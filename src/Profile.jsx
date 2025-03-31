import {useState} from "react";
import {getAuth, deleteUser, signOut} from "firebase/auth";

export function Profile({setUser}){
    const [favoriteGenre, setFavoriteGenre] = useState("");

    const auth = getAuth();

    const genres = ["Action", "Adventure", "Drama", "Horror", "Thriller", "Mistery", "Comedy", "Family",
        "Romance", "History", "Documentary", "Fantasy", "Sci-Fi"];

    const signOutHandler = async () => {
        await signOut(auth)
            .then(() => {
                setUser(null);
                console.log("Utente disconnesso con successo!")
            }).catch(error => {
                console.log(error)
            });
    };


    const deleteAccountHandler = async() => {
        const user = getAuth().currentUser;

        if(!user){
            console.error("User not found!");
            return;
        }

        const confirmDelete = window.confirm("Are you sure you want to delete this account?");
        if(confirmDelete){
            try {
                await deleteUser(user);
                alert("User Deleted");
                signOutHandler().catch(error => {
                    console.log(error)
                });
            } catch (error) {
                console.error(error);
                alert("There was an error deleting your account, please try again in a few minutes.")
            }
        }
    }

    return (
        <div className={"profile-container"}>
            <h2 className={"profile-title"}>Impostazioni profilo</h2>
            <div className={"profile-form-group"}>
                <label className={"form-label"}> Select your favorite genre</label>
                <select
                    value={favoriteGenre}
                    onChange={(e) =>
                    {
                        setFavoriteGenre(e.target.value);
                        console.log(favoriteGenre);
                    }}
                    className="form-select">
                    <option value={""}>--Select--</option>
                    {genres.map(genre => (
                        <option key={genre} value={genre}>
                            {genre}
                        </option>
                    ))}
                </select>

                <label className={"form-label mt-3 d-block"}> Delete your account</label>
                <button className="btn btn-danger delete-button" onClick={deleteAccountHandler}>
                    Delete Account
                </button>
            </div>
        </div>
    )
}
