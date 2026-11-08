import {
    collection,
    doc,
    getDoc,
    getDocs,
    onSnapshot,
    query,
    runTransaction,
    serverTimestamp,
    where,
    writeBatch,
} from "firebase/firestore";
import {db} from "./Firebase.js";
import {calculateMatch} from "./matching.js";
import {isExpiredClosedParty, timestampToMillis} from "./partyUtils.js";
import {generatePartyCode, isValidPartyCode, normalizePartyCode} from "./partyCode.js";

// A random collision on an 8-character code is extremely unlikely, but a
// couple of retries keep creation safe without user intervention.
export const PARTY_CODE_MAX_ATTEMPTS = 5;

// Closed parties are kept for a while so members can review results, then
// the owner can remove them from their room list.
export const CLEANUP_MAX_AGE_DAYS = 30;

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

export async function createParty(
    films,
    owner,
    partyName,
    {generateCode = generatePartyCode, maxAttempts = PARTY_CODE_MAX_ATTEMPTS} = {},
) {
    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
        const code = generateCode();
        const partyRef = doc(db, "watchParty", code);
        const ownerRef = memberRef(code, owner.uid);

        try {
            await runTransaction(db, async (transaction) => {
                const existing = await transaction.get(partyRef);
                if (existing.exists()) {
                    throw new PartyError("code-taken");
                }

                transaction.set(partyRef, {
                    partyName,
                    ownerId: owner.uid,
                    ownerEmail: owner.email,
                    films,
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
        } catch (error) {
            if (error?.code !== "code-taken") {
                throw error;
            }
        }
    }

    throw new PartyError("code-exhausted");
}

export async function joinParty(partyId, user) {
    const code = normalizePartyCode(partyId);
    if (!isValidPartyCode(code)) {
        throw new PartyError("invalid-code");
    }

    const partyRef = doc(db, "watchParty", code);
    const userRef = memberRef(code, user.uid);

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

        const memberCount = party.memberCount ?? party.members?.length ?? 0;
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

export async function cleanupOldClosedParties(
    user,
    {now = Date.now(), maxAgeDays = CLEANUP_MAX_AGE_DAYS} = {},
) {
    if (!user?.uid) {
        return 0;
    }

    const cutoff = now - maxAgeDays * 24 * 60 * 60 * 1000;
    const ownedParties = await getDocs(query(
        collection(db, "watchParty"),
        where("ownerId", "==", user.uid),
    ));
    const expired = ownedParties.docs.filter((partyDoc) => (
        isExpiredClosedParty(partyDoc.data(), cutoff)
    ));

    for (const partyDoc of expired) {
        await deleteParty(partyDoc.id, user);
    }

    return expired.length;
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

export function subscribeToOwnedParties(uid, onData, onError) {
    // Only the owner can list parties. Sorting client-side avoids a composite
    // index on (ownerId, createdAt).
    const partiesQuery = query(
        collection(db, "watchParty"),
        where("ownerId", "==", uid),
    );

    return onSnapshot(
        partiesQuery,
        (snapshot) => {
            const parties = snapshot.docs
                .map((party) => ({id: party.id, ...party.data()}))
                .sort((left, right) => (
                    timestampToMillis(right.createdAt) - timestampToMillis(left.createdAt)
                ));
            onData(parties);
        },
        (error) => onError?.(error),
    );
}
