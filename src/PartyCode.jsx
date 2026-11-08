import {useEffect, useRef, useState} from "react";
import {useI18n} from "./i18n/context.js";

export function PartyCode({code}) {
    const {t} = useI18n();
    const [copied, setCopied] = useState(false);
    const timeoutRef = useRef(null);

    useEffect(() => () => clearTimeout(timeoutRef.current), []);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(code);
        } catch (error) {
            console.error(error);
            return;
        }

        setCopied(true);
        clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="party-code">
            <span className="party-code-label">{t("party.codeLabel")}</span>
            <code className="party-code-value">{code}</code>
            <button type="button" className="btn btn-sm btn-light" onClick={handleCopy}>
                {copied ? t("party.codeCopied") : t("party.copyCode")}
            </button>
        </div>
    );
}
