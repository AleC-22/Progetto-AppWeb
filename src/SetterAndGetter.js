import {db} from "./Firebase.js";
import {doc, getDoc, setDoc} from "firebase/firestore";

export const getFavoriteGenre = async (userId) => {
    if (!userId) {
        return null;
    }

    try {
        const userDoc = await getDoc(doc(db, "users", userId));
        if (userDoc.exists()) {
            return userDoc.data().favoriteGenre ?? null;
        }
        return null;
    } catch (error) {
        console.error(error);
        return null;
    }
};

export const saveFavoriteGenre = async (userId, genre) => {
    await setDoc(doc(db, "users", userId), {favoriteGenre: genre}, {merge: true});
};
