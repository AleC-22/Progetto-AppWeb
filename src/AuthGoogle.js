import {auth,provider,signInWithPopup} from "./Firebase.js";

export const AuthGoogle = async () => {
    try{
            await signInWithPopup(auth,provider);
        } catch (error) {
            console.error(error)
        }
    }