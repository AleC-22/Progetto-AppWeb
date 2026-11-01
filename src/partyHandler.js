import {
    collection,
    doc,
    getDoc,
    getDocs,
    onSnapshot,
    runTransaction,
    serverTimestamp,
    updateDoc,
    writeBatch,
} from "firebase/firestore";
import {db} from "./Firebase.js";
import {calculateMatch} from "./matching.js";

export class PartyError extends Error {
    constructor(code, message) {
        super(message ?? code);
        this.name = "PartyError";
        this.code = code;
    }
}

function memberRef(partyId, userId) {
    return doc(db, "watchParty", partyId, "members", userId);
}

function membersCollection(partyId) {
    return collection(db, "watchParty", partyId, "members");
}

function timestampToMillis(value) {
    if (!value) {
        return 0;
    }
    if (typeof value.toMillis === "function") {
        return value.toMillis();
    }
    if (value instanceof Date) {
        return value.getTime();
    }
    return typeof value === "number" ? value : 0;
}

export function isPartyMember(party, user) {
    if (!party || !user) {
        return false;
    }
    if (party.ownerId === user.uid || party.ownerEmail === user.email) {
        return true;
    }
    if (Array.isArray(party.memberIds) && party.memberIds.includes(user.uid)) {
        return true;
    }
    return (party.members ?? []).some((member) => member.uid === user.uid || member.email === user.email);
}

export async function createParty(films, owner, partyName, maxMembers = 4) {
    const partyRef = doc(collection(db, "watchParty"));
    const ownerRef = memberRef(partyRef.id, owner.uid);

    await runTransaction(db, async (transaction) => {
        transaction.set(partyRef, {
            partyName,
            ownerId: owner.uid,
            ownerEmail: owner.email,
            films,
            maxMembers,
            memberIds: [owner.uid],
            memberCount: 1,
            status: "open",
            result: null,
            createdAt: serverTimestamp(),
        });

        transaction.set(ownerRef, {
            uid: owner.uid,
            email: owner.email,
            displayName: owner.displayName ?? owner.email,
            isFinished: false,
            preferredFilms: [],
            joinedAt: Date.now(),
        });
    });

    return partyRef;
}

export async function joinParty(partyId, user) {
    const partyRef = doc(db, "watchParty", partyId);
    const userRef = memberRef(partyId, user.uid);

    return runTransaction(db, async (transaction) => {
        const partySnap = await transaction.get(partyRef);
        const memberSnap = await transaction.get(userRef);

        if (!partySnap.exists()) {
            throw new PartyError("not-found");
        }
        if (memberSnap.exists() || isPartyMember(partySnap.data(), user)) {
            return {alreadyMember: true};
        }

        const party = partySnap.data();
        if (party.status !== "open") {
            throw new PartyError("closed");
        }

        const maxMembers = party.maxMembers ?? 4;
        const memberCount = party.memberCount ?? party.members?.length ?? 0;
        if (memberCount >= maxMembers) {
            throw new PartyError("full");
        }

        const memberIds = party.memberIds ?? (party.members ?? []).map((member) => member.uid).filter(Boolean);

        transaction.set(userRef, {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName ?? user.email,
            isFinished: false,
            preferredFilms: [],
            joinedAt: Date.now(),
        });
        transaction.update(partyRef, {
            memberCount: memberCount + 1,
            memberIds: [...memberIds, user.uid],
        });

        return {alreadyMember: false};
    });
}

export async function submitPreferences(partyId, user, filmsArray) {
    const partyRef = doc(db, "watchParty", partyId);
    const userRef = memberRef(partyId, user.uid);

    await runTransaction(db, async (transaction) => {
        const partySnap = await transaction.get(partyRef);
        const memberSnap = await transaction.get(userRef);

        if (!partySnap.exists()) {
            throw new PartyError("not-found");
        }
        if (!memberSnap.exists()) {
            throw new PartyError("not-member");
        }
        if (partySnap.data().status !== "open") {
            throw new PartyError("closed");
        }
        if (memberSnap.data().isFinished) {
            return;
        }

        transaction.update(userRef, {
            preferredFilms: filmsArray,
            isFinished: true,
            finishedAt: Date.now(),
        });
    });
}

export async function closeParty(partyId, user) {
    const partyRef = doc(db, "watchParty", partyId);
    const partySnap = await getDoc(partyRef);

    if (!partySnap.exists()) {
        throw new PartyError("not-found");
    }

    const party = partySnap.data();
    if (party.ownerId !== user.uid && party.ownerEmail !== user.email) {
        throw new PartyError("not-owner");
    }
    if (party.status === "closed") {
        return party.result ?? null;
    }

    const membersSnap = await getDocs(membersCollection(partyId));
    const members = membersSnap.docs.map((member) => member.data());
    const result = calculateMatch(party.films ?? [], members);

    if (!result.allFinished) {
        throw new PartyError("not-finished");
    }

    const finalResult = {
        ...result,
        computedAt: Date.now(),
        computedBy: user.uid,
    };

    await runTransaction(db, async (transaction) => {
        const freshSnap = await transaction.get(partyRef);
        if (!freshSnap.exists()) {
            throw new PartyError("not-found");
        }

        const freshParty = freshSnap.data();
        if (freshParty.status === "closed") {
            return;
        }
        if ((freshParty.memberCount ?? 0) !== members.length) {
            throw new PartyError("retry");
        }

        transaction.update(partyRef, {
            status: "closed",
            result: finalResult,
            closedAt: serverTimestamp(),
        });
    });

    return finalResult;
}

export async function deleteParty(partyId, user) {
    const partyRef = doc(db, "watchParty", partyId);
    const partySnap = await getDoc(partyRef);

    if (!partySnap.exists()) {
        throw new PartyError("not-found");
    }

    const party = partySnap.data();
    if (party.ownerId !== user.uid && party.ownerEmail !== user.email) {
        throw new PartyError("not-owner");
    }

    const membersSnap = await getDocs(membersCollection(partyId));
    const batch = writeBatch(db);
    membersSnap.forEach((member) => batch.delete(member.ref));
    batch.delete(partyRef);
    await batch.commit();
}

export function subscribeToParty(partyId, onData, onError) {
    let party = null;
    let members = null;

    const emit = () => {
        if (party !== null && members !== null) {
            onData({party, members});
        }
    };

    const unsubscribeParty = onSnapshot(
        doc(db, "watchParty", partyId),
        (snapshot) => {
            if (!snapshot.exists()) {
                party = null;
                members = null;
                onError?.(new PartyError("not-found"));
                return;
            }
            party = {id: snapshot.id, ...snapshot.data()};
            emit();
        },
        (error) => onError?.(error),
    );

    const unsubscribeMembers = onSnapshot(
        membersCollection(partyId),
        (snapshot) => {
            members = snapshot.docs.map((member) => ({id: member.id, ...member.data()}));
            emit();
        },
        (error) => onError?.(error),
    );

    return () => {
        unsubscribeParty();
        unsubscribeMembers();
    };
}

export function subscribeToParties(onData, onError) {
    return onSnapshot(
        collection(db, "watchParty"),
        (snapshot) => {
            const parties = snapshot.docs
                .map((party) => ({id: party.id, ...party.data()}))
                .sort((a, b) => timestampToMillis(b.createdAt) - timestampToMillis(a.createdAt));
            onData(parties);
        },
        (error) => onError?.(error),
    );
}

export async function getParties() {
    return getDocs(collection(db, "watchParty"));
}

export async function updatePartyStatus(partyId, status) {
    return updateDoc(doc(db, "watchParty", partyId), {status});
}
