import {useState} from "react";
import {Home} from "./Home.jsx";
import {PartyList} from "./PartyList.jsx";
import {Decider} from "./Decider.jsx";
import {useI18n} from "./i18n/context.js";

export function WatchParty({user}) {
    const {t} = useI18n();
    const [showPartyForm, setShowPartyForm] = useState(false);
    const [partyId, setPartyId] = useState(null);
    const [createdPartyName, setCreatedPartyName] = useState("");

    const resetToList = () => {
        setPartyId(null);
        setCreatedPartyName("");
        setShowPartyForm(false);
    };

    if (partyId) {
        return <Decider partyId={partyId} user={user} onExit={resetToList}/>;
    }

    if (createdPartyName) {
        return (
            <Home
                partyName={createdPartyName}
                user={user}
                onPartyCreated={setPartyId}
                onCancel={() => setCreatedPartyName("")}
            />
        );
    }

    if (showPartyForm) {
        return (
            <PartyForm
                onCancel={() => setShowPartyForm(false)}
                onPartyCreated={(name) => {
                    setCreatedPartyName(name);
                    setShowPartyForm(false);
                }}
            />
        );
    }

    return (
        <div className="home-page background-image party-page">
            <div className="form-box party-box">
                <div className="party-header">
                    <div>
                        <h2 className="mb-1">{t("party.title")}</h2>
                        <p className="text-muted mb-0">{t("party.subtitle")}</p>
                    </div>
                    <button type="button" className="btn btn-success" onClick={() => setShowPartyForm(true)}>
                        + {t("party.create")}
                    </button>
                </div>

                <hr/>

                <PartyList user={user} onJoin={setPartyId}/>
            </div>
        </div>
    );
}

function PartyForm({onCancel, onPartyCreated}) {
    const {t} = useI18n();
    const [partyName, setPartyName] = useState("");
    const [error, setError] = useState("");

    function handleConfirm() {
        const name = partyName.trim();
        if (!name) {
            setError(t("party.nameRequired"));
            return;
        }
        onPartyCreated(name);
    }

    return (
        <div className="home-page background-image">
            <div className="form-box">
                <h2>{t("party.createTitle")}</h2>

                <label htmlFor="party-name" className="form-label mt-3">{t("party.partyName")}</label>
                <input
                    id="party-name"
                    type="text"
                    className="form-control"
                    placeholder={t("party.namePlaceholder")}
                    value={partyName}
                    autoFocus
                    onChange={(event) => {
                        setPartyName(event.target.value);
                        setError("");
                    }}
                    onKeyDown={(event) => {
                        if (event.key === "Enter") {
                            handleConfirm();
                        }
                    }}
                />

                {error && <p className="form-error mt-2">{error}</p>}

                <div className="button-container justify-content-center mt-3">
                    <button type="button" className="btn btn-danger" onClick={onCancel}>
                        {t("common.cancel")}
                    </button>
                    <button type="button" className="btn btn-success" onClick={handleConfirm}>
                        {t("common.confirm")}
                    </button>
                </div>
            </div>
        </div>
    );
}
