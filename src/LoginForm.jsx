import {getAuth, signInWithEmailAndPassword} from "firebase/auth";
import {useState} from "react";

export function LoginForm({setUser}) {
    const auth = getAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const loginHandler = async (e) => {
        e.preventDefault();
        if (password.length < 6) {
            alert("Password should be at least 6 characters long.");
            return;
        }
        try {
            const response = await signInWithEmailAndPassword(auth, email, password);
            if (response !== undefined) {
                setUser(response);
            } else {
                console.log("ERRORE")
            }
        } catch (error) {
            console.log(error);
            setError(error.message);
        }
    }

    return (
        <>
            <div>
                <div className="my-3">
                    <label htmlFor="exampleInputEmail1" className="form-label"></label>
                    <input type="email" className="form-control" id="exampleInputEmail1" aria-describedby="emailHelp"
                           placeholder={"Email"}
                           onChange={(e) => setEmail(e.target.value)}/>
                </div>
                <div className="mb-3">
                    <label htmlFor="exampleInputPassword1" className="form-label"></label>
                    <input type="password" className="form-control" id="exampleInputPassword1" placeholder={"Password"}
                           onChange={(e) => setPassword(e.target.value)}/>
                </div>
                <div className={"button-box"}>
                    <button className="btn btn-primary btn-custom px-4" onClick={(e) => loginHandler(e)}>Login</button>
                </div>
            </div>
        </>
    )
}