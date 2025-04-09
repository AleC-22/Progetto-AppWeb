import {useEffect, useState} from "react";
import {LoginForm} from "./LoginForm.jsx";
import {RegisterForm} from "./RegisterForm.jsx";
import {AuthGoogle} from "./AuthGoogle.js";
import {MenuHandler} from "./MenuHandler.jsx";
import {Fallback} from "./Fallback.jsx";

function App() {
    const [isLogin, setIsLogin] = useState(true);
    const [user, setUser] = useState(null);
    const [isOnline, setIsOnline] = useState(navigator.onLine);


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

    return (
        <>
            {!isOnline ? <Fallback retry={() => window.location.reload()} /> : user !== null ? <MenuHandler setUser={setUser}/> : <div className={"background-image"}>
                <form className="form-box">
                    <h1 className={"d-flex justify-content-center"}> {isLogin ? "Welcome" : "Create an account"}</h1>
                    {isLogin ? <LoginForm setUser={setUser}/> : <RegisterForm setIsLogin={setIsLogin}/>}
                    <p className={"d-flex align-content-center justify-content-center mt-3"}>
                        {isLogin ? "Don't have an account?" : "Already have an account?"}
                        &nbsp;<a href={"#"} onClick={(e) => {
                        e.preventDefault();
                        setIsLogin(!isLogin);
                    }}>
                        {isLogin ? "Register here" : "Sign in"}
                    </a>
                    </p>
                    <hr/>
                    <div className={"d-flex justify-content-center"}>
                        <button type="button" className="google-sign-in-button"
                                onClick={() => AuthGoogle(setUser)}>
                            Continue with Google
                        </button>
                    </div>
                </form>
            </div>}
        </>
    )
}

export default App;