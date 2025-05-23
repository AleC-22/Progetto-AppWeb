import {useState} from "react";
import {getAuth, createUserWithEmailAndPassword} from "firebase/auth";

export function RegisterForm({setIsLogin}) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");

    const auth = getAuth();

    const registerHandler = async (e) => {
        e.preventDefault();
        if (!email || !password) {
            alert("Please enter a valid email and password");
            return;
        }
        if (password.length < 6) {
            alert("Password should be at least 6 characters long.");
            return;
        }
        if (password !== confirmPassword) {
            alert("Passwords do not match");
            return;
        }
        try {
            await createUserWithEmailAndPassword(auth, email, password)
                .then(() => {
                    setIsLogin(true);
                });
        } catch (error) {
            console.log(error);
            setError(error.message);
        }
    }

    return (
        <>
            <div>
                <div className="my-3">
                    <label className="form-label"></label>
                    <input type="email" className="form-control" id="exampleInputEmail1"
                           aria-describedby="emailHelp"
                           placeholder={"Email"}
                           onChange={(e) => setEmail(e.target.value)}/>
                </div>

                <div className="mb-3">
                    <label className="form-label"></label>
                    <input type="password" className="form-control" id="exampleInputPassword1"
                           placeholder={"Password"}
                           onChange={(e) => setPassword(e.target.value)}/>
                </div>

                <div className="mb-3">
                    <label className="form-label"></label>
                    <input type="password" className="form-control" id="exampleInputPassword2"
                           placeholder={"Confirm your password"}
                           onChange={(e) => setConfirmPassword(e.target.value)}/>
                </div>

                <div className={"button-box mt-3"}>
                    <button type="submit" className="btn btn-primary btn-custom px-4" onClick={registerHandler}>
                        Create account
                    </button>
                </div>
            </div>
        </>
    )
}