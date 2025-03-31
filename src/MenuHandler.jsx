import {getAuth, signOut} from "firebase/auth";
import {useEffect, useState} from "react";
import {Home} from "./Home.jsx";
import {News} from "./News.jsx";
import {Profile} from "./Profile.jsx";
import {FavoriteGenre} from "./FavoriteGenre.jsx";
import {getFavoriteGenre} from "./SetterAndGetter.js";


export function MenuHandler({setUser, user}){
    const auth = getAuth();
    const [page, setPage] = useState("Home");
    const [favoriteGenre, setFavoriteGenre] = useState(null);
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        if(user){
            getFavoriteGenre(user.uid).then((genre)=>{
                setFavoriteGenre(genre);
                setLoading(false)
            })
        }  else {
            setLoading(false);
        }
    }, [user])

    const signOutHandler = async () => {
            await signOut(auth)
                .then(() => {
                    setUser(null);
                    console.log("Utente disconnesso con successo!")
                }).catch(error => {
                    console.log(error)
                });
    };

    if(loading){
        return <div>Loading...</div>;
    }
    return(
        <>
            {favoriteGenre === null ? <FavoriteGenre setFavoriteGenre={setFavoriteGenre} /> :
                (
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
                            {page === "Profile" && <Profile setUser={setUser}/>}
                        </div>
                    </div>
                )
            }
        </>
    )
}