import {useState} from "react";
import {Home} from "./Home.jsx";
import {PartyList} from "./PartyList.jsx";
import {Decider} from "./Decider.jsx";

export function WatchParty() {

    const [showPartyForm, setShowPartyForm] = useState(false);
    const [joinedPartyId, setJoinedPartyId] = useState(null);
    const [createdPartyName, setCreatedPartyName] = useState("");


    if (joinedPartyId) {
        return <Decider partyId={joinedPartyId}/>;
    }

    if (createdPartyName) {
        return <Home partyName={createdPartyName}/>;
    }

    return (
        <>
            {showPartyForm ? (
                <PartyForm
                    setShowPartyForm={setShowPartyForm}
                    onPartyCreated={setCreatedPartyName}
                />
            ) : (
                <div className={"home-page background-image"}>
                    <div className={"form-box"}>
                        <h2 className="mb-4">Join a Watch Party</h2>
                        <PartyList onJoin={setJoinedPartyId}/>
                    </div>

                    <div className={"button-container mt-4"}>
                        <button className="button button5" onClick={() => setShowPartyForm(true)}>
                            ➕
                        </button>
                    </div>

                </div>
            )}
        </>
    );
}

function PartyForm({setShowPartyForm, onPartyCreated}) {
    const [partyName, setPartyName] = useState("");

    function handleConfirm() {
        if (!partyName) {
            alert("Please enter a valid name");
        } else {
            onPartyCreated(partyName);
        }
    }

    return (
        <div className={"home-page background-image"}>
            <div className="form-box">
                <h2>Insert Party Name</h2>
                <input
                    type="text"
                    className={"form-control"}
                    placeholder={"Party name"}
                    value={partyName}
                    onChange={(e) => setPartyName(e.target.value)}
                />
                <div className={"button-container justify-content-center mt-2"}>
                    <button type="button" className="btn btn-danger" onClick={() => setShowPartyForm(false)}>
                        Cancel
                    </button>
                    <button type="button" className="btn btn-success" onClick={handleConfirm}>
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
}
