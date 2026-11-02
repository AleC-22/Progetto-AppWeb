import {useState} from "react";
import {getMovies, LANGUAGE_FILTERS} from "./TMDb.js";
import {createParty} from "./partyHandler.js";
import {translateGenres} from "./genres.js";
import {useI18n} from "./i18n/context.js";

const LANGUAGE_FILTER_KEY = "movie-matcher.language-filter";
const DEFAULT_LANGUAGE_FILTER = "italian-release";

function detectLanguageFilter() {
    const saved = localStorage.getItem(LANGUAGE_FILTER_KEY);
    return LANGUAGE_FILTERS.includes(saved) ? saved : DEFAULT_LANGUAGE_FILTER;
}

export function ConfirmParty({year, genre, partyName, user, onPartyCreated, onCancel}) {
    const {t, lang} = useI18n();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [languageFilter, setLanguageFilter] = useState(detectLanguageFilter);

    const handleLanguageFilterChange = (event) => {
        const value = event.target.value;
        setLanguageFilter(value);
        setError("");
        localStorage.setItem(LANGUAGE_FILTER_KEY, value);
    };

    const confirmHandler = async () => {
        setLoading(true);
        setError("");

        try {
            const moviesData = await getMovies(
                genre,
                year,
                1,
                lang === "it" ? "it-IT" : "en-US",
                languageFilter,
            );

            if (moviesData.error === "missing-key") {
                setError(t("confirm.missingTmdbKey"));
                return;
            }
            if (moviesData.error) {
                setError(t("confirm.createError"));
                return;
            }
            if (!moviesData.results || moviesData.results.length === 0) {
                setError(t("confirm.noMovies"));
                return;
            }

            const partyRef = await createParty(moviesData.results, user, partyName);
            onPartyCreated(partyRef.id);
        } catch (createError) {
            console.error(createError);
            setError(t("confirm.createError"));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="home-page background-image">
            <div className="form-box">
                <h2 className="mb-3">{t("confirm.title")}</h2>

                <label className="form-label">{t("confirm.partyName")}</label>
                <input type="text" className="form-control" value={partyName} disabled/>

                <label className="form-label mt-3">{t("confirm.genre")}</label>
                <input type="text" className="form-control" value={translateGenres(genre, t)} disabled/>

                <label className="form-label mt-3">{t("confirm.year")}</label>
                <input type="text" className="form-control" value={year} disabled/>

                <label className="form-label mt-3" htmlFor="language-filter">{t("confirm.languageFilter")}</label>
                <select
                    id="language-filter"
                    className="form-select"
                    value={languageFilter}
                    onChange={handleLanguageFilterChange}
                    disabled={loading}
                >
                    <option value="italian-release">{t("confirm.languageItalianRelease")}</option>
                    <option value="italian">{t("confirm.languageItalianOriginal")}</option>
                    <option value="any">{t("confirm.languageAny")}</option>
                </select>
                <p className="form-text">{t("confirm.languageHint")}</p>

                {error && <p className="form-error mt-3">{error}</p>}

                <div className="button-container justify-content-center mt-3">
                    <button type="button" className="btn btn-danger" onClick={onCancel} disabled={loading}>
                        {t("common.cancel")}
                    </button>
                    <button type="button" className="btn btn-success" onClick={confirmHandler} disabled={loading}>
                        {loading ? t("common.loading") : t("confirm.create")}
                    </button>
                </div>
            </div>
        </div>
    );
}
