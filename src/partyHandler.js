import {addDoc, arrayUnion, collection, doc, updateDoc, deleteDoc, getDoc, getDocs} from "firebase/firestore";
import {db} from "./Firebase.js";

export async function createParty(films, ownerEmail, partyName, members = 4) {
    const watchPartyData = {
        partyName: partyName,
        partyOwnerEmail: ownerEmail,
        films: films,
        maxMember: members,
        members: [{
            email: ownerEmail,
            isFinished: false,
            preferredFilms: []
        }]
    }

    return await addDoc(collection(db, "watchParty"), watchPartyData);
}

export async function addMember(watchPartyId, memberMail) {
    const docRef = doc(db, "watchParty", watchPartyId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
        alert("Party not found");
        return;
    }

    if (await checkUser(watchPartyId, memberMail)) {
        return;
    }

    const newMember = {
        email: memberMail,
        isFinished: false,
        preferredFilms: []
    }
    try {
        await updateDoc(docRef, {
            members: arrayUnion(newMember),
        });
        console.log("Updated members");
    } catch (error) {
        console.log(error);
    }
}

export async function updatePreferredFilms(watchPartyId, memberMail, filmsArray) {


    const docRef = doc(db, "watchParty", watchPartyId);

    try {
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const data = docSnap.data();
            let members = data.members;

            for (let member of members) {
                if (member.email === memberMail && !member.isFinished) {
                    member.preferredFilms = filmsArray;
                    member.isFinished = true;
                    break;
                }
            }
            await updateDoc(docRef, {members});
        }
    } catch (error) {
        console.log("Errore nell'aggiornamento:", error);
    }
}


export async function getMatchedFilm(watchPartyId) {
    const docRef = doc(db, "watchParty", watchPartyId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
        alert("Party not found");
        return;
    }

    const data = docSnap.data();
    const members = data.members;
    const films = data.films;


    let isPartyClosed = true;
    for (let member of members) {
        if (!member.isFinished) {
            isPartyClosed = false;
            break;
        }
    }

    if (isPartyClosed) {
        let partyVotes = {};
        for (let film of films) {
            partyVotes[film.title] = 0;
        }
        members.forEach(member => {
            member.preferredFilms.forEach(film => {
                const title = film.title;
                if (partyVotes[title] !== undefined) {
                    partyVotes[title]++;
                }
            })
        })

        console.log(partyVotes);
        let selectedFilm = "There are no matches";
        let selectedFilmVotes = 0;
        for (let film in partyVotes) {
            if (partyVotes[film] > selectedFilmVotes) {
                selectedFilmVotes = partyVotes[film];
                selectedFilm = film;
            }
        }
        return selectedFilm;
    } else {
        alert("Someone has not selected their preferred films yet")
    }
}

export function getParties() {
    return getDocs(collection(db, "watchParty"));
}

export async function deleteParty(watchPartyId) {
    return await deleteDoc(doc(db, "watchParty", watchPartyId));
}

export async function checkUser(watchPartyId, memberEmail) {
    const docRef = doc(db, "watchParty", watchPartyId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
        alert("Party not found");
        return;
    }

    const data = docSnap.data();

    for (let member of data.members) {
        if (member.email === memberEmail) {
            return true;
        }
    }
    return false;
}

