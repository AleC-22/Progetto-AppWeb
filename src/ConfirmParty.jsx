import {getMovies} from "./TMDb.js";
import {createParty} from "./partyHandler.js";
import {getAuth} from "firebase/auth";
import {useState} from "react";
import {Decider} from "./Decider.jsx";

export function ConfirmParty({year, genre, partyName, setChoose}) {
    const [showDecider, setShowDecider] = useState(false);
    const [partyId, setPartyId] = useState(null);

    const auth = getAuth();
    const user = auth.currentUser;


    const confirmHandler = async () => {
        try {
            const moviesData = await getMovies(genre, year);

            if (!moviesData.results || moviesData.results.length === 0) {
                alert("No movies found");
                return;
            }

            if (user != null) {
                console.log("Dati ricevuti:", moviesData.results);
                const partyRef = await createParty(moviesData.results, user.email, partyName);
                setPartyId(partyRef.id);
                setShowDecider(true);
            }

        } catch (error) {
            console.log(error);
            alert("error creating party");
        }
    }


    return (
        <>
            {showDecider ? <Decider partyId={partyId}/> : (
                <div className={"home-page"}>
                    <div className="form-box">
                        <label className={"form-label"}>Party Name</label>
                        <input
                            type="text"
                            className={"form-control"}
                            value={partyName}
                            disabled
                        />
                        <label className={"form-label"}>Genre</label>
                        <input
                            type={"text"}
                            className={"form-control"}
                            value={genre}
                            disabled
                        />
                        <label className={"form-label"}>Year</label>
                        <input
                            type={"text"}
                            className={"form-control"}
                            value={year}
                            disabled
                        />
                        <div className={"button-container justify-content-center mt-2"}>
                            <button type="button" className="btn btn-danger" onClick={() => setChoose("")}>Cancel
                            </button>
                            <button type="button" className="btn btn-success" onClick={confirmHandler}>Confirm</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}