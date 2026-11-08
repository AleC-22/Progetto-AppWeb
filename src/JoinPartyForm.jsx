import {useState} from "react";
import {joinParty} from "./partyHandler.js";
import {isValidPartyCode, normalizePartyCode, PARTY_CODE_LENGTH} from "./partyCode.js";
import {useI18n} from "./i18n/context.js";

export function JoinPartyForm({user, onJoin}) {
    const {t} = useI18n();
    const [code, setCode] = useState("");
    const [error, setError] = useState("");
    const [joining, setJoining] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();

        const normalized = normalizePartyCode(code);
        if (!isValidPartyCode(normalized)) {
            setError(t("party.codeInvalid", {length: PARTY_CODE_LENGTH}));
            return;
        }

        setError("");
        setJoining(true);
        try {
            await joinParty(normalized, user);
            onJoin(normalized);
        } catch (joinError) {
            console.error(joinError);
            if (joinError.code === "not-found") {
                setError(t("party.codeNotFound"));
            } else if (joinError.code === "closed") {
                setError(t("party.codeClosed"));
            } else {
                setError(t("party.joinError"));
            }
        } finally {
            setJoining(false);
        }
    };

    return (
        <form className="party-join" onSubmit={handleSubmit}>
            <h3 className="h5 mb-1">{t("party.joinTitle")}</h3>
            <p className="text-muted party-join-hint mb-2">{t("party.joinHint")}</p>

            <div className="party-join-row">
                <label htmlFor="party-code" className="visually-hidden">
                    {t("party.codeLabel")}
                </label>
                <input
                    id="party-code"
                    type="text"
                    className="form-control party-code-input"
                    value={code}
                    placeholder={t("party.codePlaceholder")}
                    maxLength={PARTY_CODE_LENGTH}
                    autoComplete="off"
                    autoCapitalize="characters"
                    spellCheck="false"
                    disabled={joining}
                    onChange={(event) => {
                        setCode(normalizePartyCode(event.target.value));
                        setError("");
                    }}
                />
                <button type="submit" className="btn btn-success" disabled={joining}>
                    {joining ? t("common.loading") : t("party.joinCode")}
                </button>
            </div>

            {error && <p className="form-error mt-2">{error}</p>}
        </form>
    );
}
