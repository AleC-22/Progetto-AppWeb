import {getAuth, signOut} from "firebase/auth";
import {useState} from "react";
import {Home} from "./Home.jsx";
import {News} from "./News.jsx";
import {Profile} from "./Profile.jsx";


export function MenuHandler({setUser}){
    const auth = getAuth();
    const [page, setPage] = useState("Home");

    const signOutHandler = async () => {
            await signOut(auth)
                .then(() => {
                    setUser(null);
                    console.log("Utente disconnesso con successo!")
                }).catch(error => {
                    console.log(error)
                });
    };
    return(
        <>
            <div className={"background-home"}>
                <ul>
                    <li>
                        <a className={page === "Home" ? "active" : ""} href="#"
                           onClick={() => setPage("Home")}>
                            Home
                        </a>
                    </li>
                    <li>
                        <a className={page === "News" ? "active" : ""} href="#"
                           onClick={() => setPage("News")}>
                            News
                        </a>
                    </li>
                    <li>
                        <a className={page === "Profile" ? "active" : ""} href="#"
                           onClick={() => setPage("Profile")}>
                            Profile
                        </a>
                    </li>
                    <li>
                        <a href={"#"} onClick={(signOutHandler)}>
                            Logout
                        </a>
                    </li>
                </ul>
                <div>
                    {page === "Home" && <Home/>}
                    {page === "News" && <News/>}
                    {page === "Profile" && <Profile/>}
                </div>
            </div>
        </>
    )
}