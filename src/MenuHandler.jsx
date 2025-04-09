import {getAuth, signOut} from "firebase/auth";
import {useEffect, useState} from "react";
import {Home} from "./Home.jsx";
import {News} from "./News.jsx";
import {Profile} from "./Profile.jsx";
import {getFavoriteGenre} from "./SetterAndGetter.js";
import {Fallback} from "./Fallback.jsx";
import {WatchParty} from "./WatchParty.jsx";


export function MenuHandler({setUser}) {
    const auth = getAuth();
    const [page, setPage] = useState("WatchParty");
    const [favoriteGenre, setFavoriteGenre] = useState(null);
    const [loading, setLoading] = useState(true);

    const userId = getAuth().currentUser.uid;

    useEffect(() => {
        if (userId) {
            console.log("genere preferito di:", userId);
            getFavoriteGenre(userId).then((genre) => {
                setFavoriteGenre(genre);
                setLoading(false);
            }).catch(error => {
                console.log("errore nel recuperare il genere: ", error);
                setLoading(false);
            })
        }
    }, [userId])

    const signOutHandler = async () => {
        await signOut(auth)
            .then(() => {
                setUser(null);
                console.log("Utente disconnesso con successo!")
            }).catch(error => {
                console.log(error)
            });
    };

    if (loading) {
        return <Fallback/>;
    }

    return (
        <>
            <div className={"background-home"}>
                <ul>
                    <li>
                        <a className={page === "Home" ? "active" : ""} href="#"
                           onClick={() => setPage("WatchParty")}>
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
                    {page === "WatchParty" && <WatchParty/>}
                    {page === "News" && <News/>}
                    {page === "Profile" && <Profile setUser={setUser} setFavoriteGenre={setFavoriteGenre}/>}
                </div>
            </div>
        </>
    )
}