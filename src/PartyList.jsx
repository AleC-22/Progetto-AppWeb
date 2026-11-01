import {useEffect, useState} from "react";
import {deleteParty, isPartyMember, joinParty, subscribeToParties} from "./partyHandler.js";
import {useI18n} from "./i18n/context.js";

function partySize(party) {
    return party.memberCount ?? party.members?.length ?? 0;
}

function maxSize(party) {
    return party.maxMembers ?? party.maxMember ?? 4;
}

export function PartyList({user, onJoin}) {
    const {t} = useI18n();
    const [parties, setParties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionError, setActionError] = useState("");
    const [joiningId, setJoiningId] = useState(null);

    useEffect(() => {
        const unsubscribe = subscribeToParties(
            (data) => {
                setParties(data);
                setLoading(false);
            },
            (error) => {
                console.error("Errore nel recupero dei party:", error);
                setActionError(t("errors.generic"));
                setLoading(false);
            },
        );

        return unsubscribe;
    }, [t]);

    const handleJoin = async (party) => {
        if (isPartyMember(party, user)) {
            onJoin(party.id);
            return;
        }

        setActionError("");
        setJoiningId(party.id);
        try {
            await joinParty(party.id, user);
            onJoin(party.id);
        } catch (error) {
            console.error(error);
            if (error.code === "full") {
                setActionError(t("errors.full"));
            } else if (error.code === "closed") {
                setActionError(t("errors.closed"));
            } else {
                setActionError(t("party.joinError"));
            }
        } finally {
            setJoiningId(null);
        }
    };

    const handleDelete = async (party) => {
        if (!window.confirm(t("party.deleteConfirm"))) {
            return;
        }

        setActionError("");
        try {
            await deleteParty(party.id, user);
        } catch (error) {
            console.error(error);
            setActionError(t("party.deleteError"));
        }
    };

    if (loading) {
        return <p className="empty-state">{t("party.loading")}</p>;
    }

    if (parties.length === 0) {
        return <p className="empty-state">{t("party.empty")}</p>;
    }

    return (
        <div>
            {actionError && <p className="form-error">{actionError}</p>}

            <ul className="party-list">
                {parties.map((party) => {
                    const member = isPartyMember(party, user);
                    const owner = party.ownerId === user.uid || party.ownerEmail === user.email;
                    const closed = party.status === "closed";
                    const full = partySize(party) >= maxSize(party);
                    const openLabel = member
                        ? t("party.open")
                        : closed
                            ? t("party.closed")
                            : full
                                ? t("party.full")
                                : t("party.join");

                    return (
                        <li key={party.id} className="party-item">
                            <div className="party-item-main">
                                <strong>{party.partyName}</strong>
                                <span className="party-meta">
                                    {t("party.host")}: {party.ownerEmail ?? party.partyOwnerEmail ?? "—"}
                                    {" · "}
                                    {t("party.members", {
                                        count: partySize(party),
                                        max: maxSize(party),
                                    })}
                                </span>
                                {closed && <span className="badge bg-dark">{t("party.closed")}</span>}
                            </div>

                            <div className="party-item-actions">
                                {member && !closed && (
                                    <span className="badge bg-secondary">{t("party.joined")}</span>
                                )}
                                <button
                                    type="button"
                                    className={`btn btn-sm ${member ? "btn-primary" : "btn-success"}`}
                                    onClick={() => handleJoin(party)}
                                    disabled={joiningId === party.id || (!member && (closed || full))}
                                >
                                    {joiningId === party.id ? t("common.loading") : openLabel}
                                </button>
                                {owner && (
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-outline-danger"
                                        onClick={() => handleDelete(party)}
                                    >
                                        {t("common.delete")}
                                    </button>
                                )}
                            </div>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
