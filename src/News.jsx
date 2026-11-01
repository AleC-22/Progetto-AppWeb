import {useEffect, useState} from "react";
import {getImageUrl, getUpcomingMovies} from "./TMDb.js";
import {useI18n} from "./i18n/context.js";

function formatDate(value, lang) {
    if (!value) {
        return "";
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return value;
    }
    return date.toLocaleDateString(lang === "it" ? "it-IT" : "en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

export function News() {
    const {t, lang} = useI18n();
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError("");

        getUpcomingMovies(currentPage, lang === "it" ? "it-IT" : "en-US")
            .then((data) => {
                if (cancelled) {
                    return;
                }

                if (data.error === "missing-key") {
                    setError(t("news.missingTmdbKey"));
                } else if (data.error) {
                    setError(t("news.error"));
                }

                setMovies(data.results ?? []);
                setTotalPages(data.totalPages || 1);
                setLoading(false);
            })
            .catch((requestError) => {
                if (cancelled) {
                    return;
                }
                console.error(requestError);
                setError(t("news.error"));
                setMovies([]);
                setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [currentPage, lang, t]);

    return (
        <div className="news-container">
            <h2>{t("news.title")}</h2>

            {loading && <p>{t("news.loading")}</p>}

            {!loading && error && <p className="form-error">{error}</p>}

            {!loading && !error && movies.length === 0 && <p>{t("news.empty")}</p>}

            {!loading && movies.length > 0 && (
                <div className="movies-grid">
                    {movies.map((movie) => (
                        <div key={movie.id} className="movie-card-news">
                            <img
                                src={getImageUrl(movie.image)}
                                alt={movie.title}
                                className="movie-poster-news"
                                loading="lazy"
                            />
                            <h3 className="h3-news">{movie.title}</h3>
                            {movie.releaseDate && (
                                <p className="mb-0">📅 {t("news.release")}: {formatDate(movie.releaseDate, lang)}</p>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {!loading && totalPages > 1 && (
                <div className="news-pagination">
                    <button
                        type="button"
                        className="btn btn-dark"
                        onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                        disabled={currentPage === 1}
                    >
                        ⬅️
                    </button>
                    <span>{t("news.page", {page: currentPage, total: totalPages})}</span>
                    <button
                        type="button"
                        className="btn btn-dark"
                        onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                        disabled={currentPage >= totalPages}
                    >
                        ➡️
                    </button>
                </div>
            )}
        </div>
    );
}
