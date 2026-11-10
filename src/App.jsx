import {useEffect, useState} from "react";
import {onAuthStateChanged, signInAnonymously} from "firebase/auth";
import {auth, isFirebaseConfigured} from "./Firebase.js";
import {LoginForm} from "./LoginForm.jsx";
import {RegisterForm} from "./RegisterForm.jsx";
import {AuthGoogle} from "./AuthGoogle.js";
import {MenuHandler} from "./MenuHandler.jsx";
import {Fallback} from "./Fallback.jsx";
import {LoadingScreen} from "./LoadingScreen.jsx";
import {SetupNotice} from "./SetupNotice.jsx";
import {LanguageSwitcher} from "./LanguageSwitcher.jsx";
import {useI18n} from "./i18n/context.js";

function App() {
    const {t} = useI18n();
    const [isLogin, setIsLogin] = useState(true);
    const [user, setUser] = useState(null);
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [checkingAuth, setCheckingAuth] = useState(isFirebaseConfigured);
    const [authError, setAuthError] = useState("");
    const [guestLoading, setGuestLoading] = useState(false);

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);

        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, []);

    useEffect(() => {
        if (!isFirebaseConfigured || !auth) {
            return;
        }

        return onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setCheckingAuth(false);
        });
    }, []);

    if (!isFirebaseConfigured) {
        return <SetupNotice/>;
    }

    if (!isOnline) {
        return <Fallback retry={() => window.location.reload()}/>;
    }

    if (checkingAuth) {
        return <LoadingScreen message={t("auth.loading")}/>;
    }

    if (user) {
        return <MenuHandler user={user} setUser={setUser}/>;
    }

    const handleGoogleLogin = async () => {
        setAuthError("");
        try {
            const googleUser = await AuthGoogle();
            if (googleUser) {
                setUser(googleUser);
            }
        } catch (error) {
            console.log(error);
            if (error?.code !== "auth/popup-closed-by-user") {
                setAuthError(t("auth.googleError"));
            }
        }
    };

    const handleGuestLogin = async () => {
        setAuthError("");
        setGuestLoading(true);
        try {
            await signInAnonymously(auth);
        } catch (error) {
            console.error(error);
            setAuthError(t("auth.guestError"));
        } finally {
            setGuestLoading(false);
        }
    };

    return (
        <div className="background-image">
            <div className="form-box">
                <div className="d-flex justify-content-between align-items-center gap-3 mb-2">
                    <h1 className="h3 mb-0">{isLogin ? t("auth.welcome") : t("auth.createAccount")}</h1>
                    <LanguageSwitcher/>
                </div>

                {isLogin
                    ? <LoginForm setUser={setUser}/>
                    : <RegisterForm setUser={setUser}/>}

                <p className="d-flex align-content-center justify-content-center mt-3 mb-2">
                    {isLogin ? t("auth.noAccount") : t("auth.haveAccount")}
                    &nbsp;
                    <a
                        href="#"
                        onClick={(event) => {
                            event.preventDefault();
                            setAuthError("");
                            setIsLogin(!isLogin);
                        }}
                    >
                        {isLogin ? t("auth.registerHere") : t("auth.signInHere")}
                    </a>
                </p>

                <hr/>

                <button
                    type="button"
                    className="btn btn-outline-dark w-100"
                    onClick={handleGuestLogin}
                    disabled={guestLoading}
                >
                    {guestLoading ? t("common.loading") : t("auth.guest")}
                </button>

                <div className="d-flex justify-content-center mt-3">
                    <button type="button" className="google-sign-in-button" onClick={handleGoogleLogin}>
                        {t("auth.continueGoogle")}
                    </button>
                </div>

                {authError && <p className="form-error mt-3 mb-0">{authError}</p>}
            </div>
        </div>
    );
}

export default App;
