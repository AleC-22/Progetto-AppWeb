import {getAuth, signOut} from "firebase/auth";



export function HomePage({setUser}){
    const auth = getAuth();

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
                <div className="sidebar">
                    <a className="active" href="#">Home</a>
                    <a href="#">News</a>
                    <a href={"#"}>Profilo</a>
                    <div className={"logout-box"}>
                        <a href={"#"} onClick={(signOutHandler)}>
                            Logout
                        </a>
                    </div>
                </div>
            </div>
        </>
    )
}