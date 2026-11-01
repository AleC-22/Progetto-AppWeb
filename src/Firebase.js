import {initializeApp} from "firebase/app";
import {connectAuthEmulator, getAuth, GoogleAuthProvider} from "firebase/auth";
import {connectFirestoreEmulator, getFirestore} from "firebase/firestore";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_Firebase_apiKey,
    authDomain: import.meta.env.VITE_Firebase_authDomain,
    projectId: import.meta.env.VITE_Firebase_projectId,
    storageBucket: import.meta.env.VITE_Firebase_storageBucket,
    messagingSenderId: import.meta.env.VITE_Firebase_messagingSenderId,
    appId: import.meta.env.VITE_Firebase_appId,
    measurementId: import.meta.env.VITE_Firebase_measurementId,
};

export const isFirebaseConfigured = Boolean(
    firebaseConfig.apiKey
    && firebaseConfig.authDomain
    && firebaseConfig.projectId
    && firebaseConfig.appId
);

let app = null;
let auth = null;
let db = null;
let provider = null;

if (isFirebaseConfigured) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    provider = new GoogleAuthProvider();

    if (import.meta.env.VITE_USE_FIREBASE_EMULATORS === "true" && !globalThis.__movieMatcherEmulatorsConnected) {
        connectAuthEmulator(auth, "http://127.0.0.1:9099", {disableWarnings: true});
        connectFirestoreEmulator(db, "127.0.0.1", 8080);
        globalThis.__movieMatcherEmulatorsConnected = true;
    }
}

export {app, auth, db, provider};
