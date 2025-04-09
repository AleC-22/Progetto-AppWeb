import {auth, provider, signInWithPopup} from "./Firebase.js";

export const AuthGoogle = async (setUser) => {
    try {
        await signInWithPopup(auth, provider)
            .then((result) => {
                const user = result.user;
                setUser(user);
            }).catch(error => {
                console.log(error)
            });
    } catch (error) {
        console.error(error)
    }
}