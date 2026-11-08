import {useEffect, useState} from "react";
import {
    CLEANUP_MAX_AGE_DAYS,
    cleanupOldClosedParties,
    deleteParty,
    subscribeToOwnedParties,
} from "./partyHandler.js";
import {useI18n} from "./i18n/context.js";

function partySize(party) {
    return party.memberCount ?? party.members?.length ?? 0;
}

export function PartyList({user, onJoin}) {
    const {t} = useI18n();
    const [parties, setParties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionError, setActionError] = useState("");
    const [cleaning, setCleaning] = useState(false);
    const [cleanupMessage, setCleanupMessage] = useState("");

    const userId = user?.uid;

    useEffect(() => {
        if (!userId) {
            setParties([]);
            setLoading(false);
            return undefined;
        }

        setLoading(true);
        const unsubscribe = subscribeToOwnedParties(
            userId,
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
    }, [userId, t]);

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

    const handleCleanup = async () => {
        if (!window.confirm(t("party.cleanupConfirm", {days: CLEANUP_MAX_AGE_DAYS}))) {
            return;
        }

        setActionError("");
        setCleanupMessage("");
        setCleaning(true);
        try {
            const count = await cleanupOldClosedParties(user);
            setCleanupMessage(count > 0
                ? t("party.cleanupDone", {count})
                : t("party.cleanupNone", {days: CLEANUP_MAX_AGE_DAYS}));
        } catch (error) {
            console.error(error);
            setActionError(t("party.cleanupError"));
        } finally {
            setCleaning(false);
        }
    };

    if (loading) {
        return <p className="empty-state">{t("party.loading")}</p>;
    }

    return (
        <div>
            {actionError && <p className="form-error">{actionError}</p>}

            {parties.length === 0
                ? <p className="empty-state">{t("party.empty")}</p>
                : (
                    <ul className="party-list">
                        {parties.map((party) => {
                            const closed = party.status === "closed";

                            return (
                                <li key={party.id} className="party-item">
                                    <div className="party-item-main">
                                        <strong>{party.partyName}</strong>
                                        <span className="party-meta">
                                            {t("party.members", {count: partySize(party)})}
                                            {" · "}
                                            <span className="party-code-inline">{party.id}</span>
                                        </span>
                                        {closed && <span className="badge bg-dark">{t("party.closed")}</span>}
                                    </div>

                                    <div className="party-item-actions">
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-primary"
                                            onClick={() => onJoin(party.id)}
                                        >
                                            {t("party.open")}
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-outline-danger"
                                            onClick={() => handleDelete(party)}
                                        >
                                            {t("common.delete")}
                                        </button>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}

            <div className="party-cleanup">
                <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary"
                    onClick={handleCleanup}
                    disabled={cleaning || !userId}
                >
                    {cleaning ? t("common.loading") : t("party.cleanup")}
                </button>
                {cleanupMessage && <span className="party-cleanup-message">{cleanupMessage}</span>}
            </div>
        </div>
    );
}
