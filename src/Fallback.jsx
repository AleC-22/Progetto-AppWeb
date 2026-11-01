import {useI18n} from "./i18n/context.js";

export function Fallback({retry}) {
    const {t} = useI18n();

    return (
        <div className="offline-container">
            <h2>{t("fallback.title")}</h2>
            <p>{t("fallback.text")}</p>
            {retry && (
                <button type="button" className="btn btn-light" onClick={retry}>
                    {t("fallback.retry")}
                </button>
            )}
        </div>
    );
}
