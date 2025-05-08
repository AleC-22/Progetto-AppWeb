import {useEffect, useState} from "react";
import {addMember, checkUser, getParties} from "./partyHandler.js";
import {getAuth} from "firebase/auth";

export function PartyList({onJoin}) {
    const [parties, setParties] = useState([]);
    const [loading, setLoading] = useState(true);

    const auth = getAuth();
    const user = auth.currentUser;

    useEffect(() => {
        async function fetchParties() {
            try {
                const querySnapshot = await getParties();
                const partyList = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setParties(partyList);
            } catch (error) {
                console.error("Errore nel recupero dei party:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchParties().catch((error) => {
            console.error("Errore nel recupero dei party:", error);
        });
    }, [user]);

    if (!user) {
        console.log("No user found");
        return;
    }

    if (loading) {
        return <p>Caricamento party...</p>;
    }

    if (parties.length === 0) {
        return <p>Nessun party disponibile</p>;
    }

    return (
        <div>
            <ul className={"party-container"}>
                {parties.map((party) => (
                    <li key={party.id} className="mb-2 d-flex justify-content-between">
                        <span className="font-semibold">{`Party ${party.partyName}`}</span>
                        <div className={"d-flex gap-3"}>
                            <span>{party.members.length}/4</span>
                            <button
                                className="btn btn-primary"
                                onClick={async () => {
                                    try {
                                        await addMember(party.id, user.email);
                                        onJoin(party.id);
                                    } catch (e) {
                                        console.error(e);
                                    }
                                }}
                                disabled={party.members.length === 4 && checkUser(party.id, user.email)}
                            >
                                Join
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
