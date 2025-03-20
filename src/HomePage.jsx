import {getAuth, signOut} from "firebase/auth";
import {useState} from "react";
import {Home} from "./Home.jsx";
import {News} from "./News.jsx";
import {Profile} from "./Profile.jsx";


export function HomePage({setUser}){
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
            {/*{page === "Home" ? <HomePage/> : page && auth !== undefined ? <Home/> : page === "Ciao" ? <News /> : null}*/}
            <div className={"background-home"}>
                <div className="sidebar">
                    <a className={page === "Home" ? "active" : ""} href="#" onClick={() => setPage("Home")}>
                        Home
                    </a>
                    <a className={page === "News" ? "active" : ""} href="#" onClick={()=>setPage("News")}>
                        News
                    </a>
                    <a className={page === "Profile" ? "active" : ""} href="#" onClick={()=>setPage("Profile")}>
                        Profile
                    </a>
                    <div className={"logout-box"}>
                        <a href={"#"} onClick={(signOutHandler)}>
                            Logout
                        </a>
                    </div>
                </div>
                <div>
                    {page === "Home" && <Home/>}
                    {page === "News" && <News/>}
                    {page === "Profile" && <Profile/>}
                </div>
            </div>
        </>
    )
}