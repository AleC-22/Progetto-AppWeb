import {useState} from "react";
import {Year} from "./Year.jsx";
import {translateGenres} from "./genres.js";
import {useI18n} from "./i18n/context.js";

const CATEGORIES = [
    {titleKey: "home.dramatic", genres: ["Action", "Adventure", "Drama"]},
    {titleKey: "home.anxiety", genres: ["Horror", "Thriller", "Mystery"]},
    {titleKey: "home.gentle", genres: ["Comedy", "Family", "Romance"]},
    {titleKey: "home.curious", genres: ["History", "Documentary"]},
    {titleKey: "home.outOfThisWorld", genres: ["Fantasy", "Sci-Fi"]},
];

export function Home({partyName, user, onPartyCreated, onCancel}) {
    const {t} = useI18n();
    const [choose, setChoose] = useState(false);
    const [genre, setGenre] = useState("");

    function handleGenreChange(genres) {
        setGenre(genres.join(", "));
        setChoose(true);
    }

    if (choose) {
        return (
            <Year
                setChoose={setChoose}
                genre={genre}
                partyName={partyName}
                user={user}
                onPartyCreated={onPartyCreated}
            />
        );
    }

    return (
        <div className="home-page background-image">
            <h1 className="header">{t("home.question")}</h1>

            {CATEGORIES.map((category) => (
                <div key={category.titleKey}>
                    <button
                        type="button"
                        className="btn btn-danger btn-home"
                        onClick={() => handleGenreChange(category.genres)}
                    >
                        {t(category.titleKey)}
                        <br/>
                        <span className="genre-hint">({translateGenres(category.genres.join(", "), t)})</span>
                    </button>
                </div>
            ))}

            <button type="button" className="btn btn-light btn-year mt-2" onClick={onCancel}>
                {t("home.back")}
            </button>
        </div>
    );
}
