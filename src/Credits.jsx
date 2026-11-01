import {useI18n} from "./i18n/context.js";

export function Credits({compact = false}) {
    const {t} = useI18n();

    return (
        <div className={compact ? "credits credits-compact" : "credits"}>
            <a
                href="https://www.themoviedb.org/"
                target="_blank"
                rel="noreferrer"
                className="credits-brand"
                aria-label="TMDB"
            >
                <img src="/tmdb-logo.svg" alt="TMDB" className="credits-logo"/>
            </a>
            <p>{t("credits.notice")}</p>
        </div>
    );
}
