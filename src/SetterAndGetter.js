import {db} from "./Firebase.js";
import {doc, setDoc, getDoc} from "firebase/firestore";



export const getFavoriteGenre = async (userId) => {
    try{
        const userDoc = await getDoc(doc(db, "users", userId));
        if (userDoc.exists()) {
            return userDoc.data().favoriteGenre;
        }
        return null;
    } catch (error) {
        console.error(error);
        return null;
    }
}

export const saveFavoriteGenre = async (userId, genre) => {
    try{
        await setDoc(doc(db, "users", userId), {favoriteGenre: genre}, {merge: true});
    } catch (error) {
        console.error(error);
    }
}