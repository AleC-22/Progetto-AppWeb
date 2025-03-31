import{initializeApp} from "firebase/app";
import{getAuth, GoogleAuthProvider, signInWithPopup} from "firebase/auth";
import {getFirestore} from "firebase/firestore";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_Firebase_apiKey,
    authDomain: import.meta.env.VITE_Firebase_authDomain,
    projectId: import.meta.env.VITE_Firebase_projectId,
    storageBucket: import.meta.env.VITE_Firebase_storageBucket,
    messagingSenderId: import.meta.env.VITE_Firebase_messagingSenderId,
    appId: import.meta.env.VITE_Firebase_appId,
    measurementId: import.meta.env.VITE_Firebase_measurementId,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
const db = getFirestore(app);
export {signInWithPopup, db};