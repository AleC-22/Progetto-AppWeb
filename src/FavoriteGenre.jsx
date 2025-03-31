import {getAuth} from "firebase/auth";
import {saveFavoriteGenre} from "./SetterAndGetter.js";

export function FavoriteGenre({setFavoriteGenre}) {

    const genres =
        ["Action", "Adventure", "Drama",
            "Horror", "Thriller",
            "Mystery", "Comedy",
            "Family", "Romance",
            "History", "Documentary",
            "Fantasy", "Sci-Fi"]

    const auth = getAuth();
    const user = auth.currentUser;

    const selectionHandler = (genre) => {
        saveFavoriteGenre(user.uid, genre).then(() => {
            setFavoriteGenre(genre);
        });
    };

    return(
        <div className={"background-image"}>
            <div className={"select-container"}>
            <h1>Select your favorite genre to stay updated on upcoming releases... or you can do it later</h1>
                <select
                    onChange={(e) => {
                        selectionHandler(e.target.value);
                    }}
                    className="form-select">
                    <option value={""}>--Select--</option>
                    {genres.map(genre => (
                        <option key={genre} value={genre}>
                            {genre}
                        </option>
                    ))}
                </select>
                <div className={"mt-3 d-flex justify-content-center align-items-center"}>
                    <button className="btn btn-danger"
                            onClick={() => {
                                selectionHandler("");
                            }}>
                        Skip
                    </button>
                </div>
            </div>
        </div>
    )
}