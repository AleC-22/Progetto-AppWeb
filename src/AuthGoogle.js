import {signInWithPopup} from "firebase/auth";
import {auth, provider} from "./Firebase.js";

export const AuthGoogle = async () => {
    if (!auth || !provider) {
        throw new Error("Firebase is not configured");
    }
    const result = await signInWithPopup(auth, provider);
    return result.user;
};
