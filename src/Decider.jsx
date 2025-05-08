import {useEffect, useState} from "react";
import {db} from "./Firebase.js";
import {doc, getDoc} from "firebase/firestore";
import {deleteParty, getMatchedFilm, updatePreferredFilms} from "./partyHandler.js";
import {getAuth} from "firebase/auth";
import {WatchParty} from "./WatchParty.jsx";

export function Decider({partyId}) {

    const [movies, setMovies] = useState([]);
    const [preferredMovies, setPreferredMovies] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [creatorEmail, setCreatorEmail] = useState("");
    const [isFinished, setIsFinished] = useState(false);
    const [showWatchParty, setShowWatchParty] = useState(false);

    const auth = getAuth();
    const user = auth.currentUser;

    useEffect(() => {
        if ("Notification" in window && Notification.permission !== "granted") {
            Notification.requestPermission().then(permission => {
                if (permission === "granted") {
                    console.log("Notifiche abilitate!");
                }
            });
        }
    }, []);

    useEffect(() => {
        async function loadMovies() {
            try {
                const docRef = doc(db, "watchParty", partyId);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setMovies(docSnap.data().films);
                    setCreatorEmail(data.partyOwnerEmail);
                    if (user.email) {
                        for (let member of data.members) {
                            if (member.email === user.email) {
                                setIsFinished(member.isFinished);
                            }
                        }
                    }
                } else {
                    console.log("No party");
                }
            } catch (error) {
                console.log(error);
            }
        }

        loadMovies().catch((error) => {
            console.log(error);
        });
    }, [partyId]);


    function showNotification() {
        if (Notification.permission === "granted") {
            new Notification("🍿 Movie Party", {
                body: "A decision has been made 🥳",
            });
        }
    }

    useEffect(() => {
        async function submitPreferences() {
            if (movies.length > 0 && currentIndex === movies.length && !isSubmitted) {
                try {
                    await updatePreferredFilms(partyId, user.email, preferredMovies);
                    console.log("Preferenze inviate con successo!");
                    setIsSubmitted(true);
                } catch (err) {
                    console.error("Errore nell'aggiornamento:", err);
                }
            }
        }

        submitPreferences().catch((error) => {
            console.log(error);
        });
    }, [currentIndex, movies.length, isSubmitted, partyId, preferredMovies, user.email]);


    function handleNextMovie() {
        console.log(currentIndex)
        setCurrentIndex(currentIndex + 1);
    }

    function handleLikeButton() {
        setPreferredMovies((prevMovies) => prevMovies.concat(movies[currentIndex]));
        handleNextMovie();
    }

    const movie = movies[currentIndex];

    function handleMovieRating() {
        let movieRating = 0.0;
        if (movie.rating != null) {
            movieRating = Math.round(movie.rating * 10) / 10
        }
        return movieRating;
    }


    return (
        <>
            {showWatchParty ? <WatchParty/> : currentIndex === movies.length || isFinished ?
                <div className={"background-image home-page"}> END OF THE LIST :) <br/> You will able to close the party
                    after everyone will finishing voting.
                    {user && user.email === creatorEmail && (
                        <div className={"close-voting-btn-container"}>
                            <button className={"btn btn-danger"} onClick={async () => {
                                showNotification();
                                try {
                                    const matched = await getMatchedFilm(partyId);
                                    if (matched) {
                                        alert("Match: " + matched);
                                        await deleteParty(partyId);
                                        setShowWatchParty(true);
                                    }
                                } catch (err) {
                                    console.log(err);
                                }
                            }}
                            >
                                Close party
                            </button>
                        </div>
                    )} </div> : movie ? (
                    <>
                        <div className={"background-image home-page"}>
                            <div className="movie-card">
                                <img
                                    src={movie.image}
                                    alt={movie.title}
                                    className={"movie-poster"}
                                />

                                <div className="movie-info">

                                    <h3 className={"text-black"}>
                                        {movie.title}
                                    </h3>

                                    <p className={"movie-description"}>
                                        {movie.description}
                                    </p>

                                    <div className={"ratings"}>
                                        <span className={"imdb"}>Rating: {handleMovieRating()}</span>
                                    </div>

                                </div>

                            </div>

                            <div className={"button-container"}>
                                <button className="button button5" onClick={handleNextMovie}>👎</button>
                                <button className="button button5" onClick={() => handleLikeButton(movie.title)}>
                                    👍
                                </button>
                            </div>
                        </div>
                    </>
                ) : (<p> Nessun film disponibile...</p>)}
        </>
    );


}