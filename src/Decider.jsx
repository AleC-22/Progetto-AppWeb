import {useEffect, useRef, useState} from "react";
import {closeParty, submitPreferences, subscribeToParty} from "./partyHandler.js";
import {getImageUrl} from "./TMDb.js";
import {LoadingScreen} from "./LoadingScreen.jsx";
import {PartyCode} from "./PartyCode.jsx";
import {useI18n} from "./i18n/context.js";

export function Decider({partyId, user, onExit}) {
    const {t} = useI18n();
    const [party, setParty] = useState(null);
    const [member, setMember] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [currentIndex, setCurrentIndex] = useState(0);
    const [preferredMovies, setPreferredMovies] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [closing, setClosing] = useState(false);

    const submittedRef = useRef(false);
    const notifiedRef = useRef(false);

    useEffect(() => {
        setLoading(true);
        setError("");

        const unsubscribe = subscribeToParty(
            partyId,
            user.uid,
            ({party: nextParty, member: nextMember}) => {
                setParty(nextParty);
                setMember(nextMember);
                setLoading(false);
            },
            (subscriptionError) => {
                console.error(subscriptionError);
                setParty(null);
                setMember(null);
                setError(subscriptionError.code === "not-found" ? t("errors.notFound") : t("errors.generic"));
                setLoading(false);
            },
        );

        return unsubscribe;
    }, [partyId, user.uid, t]);

    useEffect(() => {
        if ("Notification" in window && Notification.permission === "default") {
            Notification.requestPermission().catch(() => {
            });
        }
    }, []);

    const me = member;
    const movies = party?.films ?? [];
    const isClosed = party?.status === "closed" || Boolean(party?.result);
    const isOwner = party && party.ownerId === user.uid;
    const memberCount = party?.memberCount ?? 0;
    const finishedCount = party?.finishedCount ?? 0;
    const allFinished = memberCount > 0 && finishedCount >= memberCount;
    const isFinished = Boolean(me?.isFinished) || submitting || currentIndex >= movies.length;
    const result = party?.result;

    useEffect(() => {
        if (!result || notifiedRef.current) {
            return;
        }
        notifiedRef.current = true;

        if ("Notification" in window && Notification.permission === "granted") {
            new Notification(t("decider.notificationTitle"), {
                body: t("decider.notificationBody"),
            });
        }
    }, [result, t]);

    useEffect(() => {
        if (!party || !me || me.isFinished || isClosed || movies.length === 0) {
            return;
        }
        if (currentIndex < movies.length || submittedRef.current) {
            return;
        }

        submittedRef.current = true;
        setSubmitting(true);
        setError("");

        submitPreferences(partyId, user, preferredMovies)
            .catch((submitError) => {
                console.error(submitError);
                submittedRef.current = false;
                setError(submitError.code === "closed" ? t("errors.closed") : t("errors.generic"));
            })
            .finally(() => setSubmitting(false));
    }, [currentIndex, movies.length, party, me, isClosed, partyId, preferredMovies, user, t]);

    const handleNext = () => {
        setCurrentIndex((index) => index + 1);
    };

    const handleLike = () => {
        const movie = movies[currentIndex];
        if (!movie) {
            return;
        }
        setPreferredMovies((previous) => [...previous, movie]);
        handleNext();
    };

    const handleClose = async () => {
        setClosing(true);
        setError("");
        try {
            await closeParty(partyId, user);
        } catch (closeError) {
            console.error(closeError);
            if (closeError.code === "not-finished") {
                setError(t("decider.notAllVoted"));
            } else {
                setError(t("decider.closeError"));
            }
        } finally {
            setClosing(false);
        }
    };

    if (loading) {
        return <LoadingScreen message={t("decider.loading")}/>;
    }

    if (error && !party) {
        return (
            <div className="home-page background-image">
                <div className="form-box">
                    <p className="form-error">{error}</p>
                    <button type="button" className="btn btn-primary" onClick={onExit}>
                        {t("decider.backToParties")}
                    </button>
                </div>
            </div>
        );
    }

    if (!party) {
        return (
            <div className="home-page background-image">
                <div className="form-box">
                    <p className="form-error">{t("errors.notFound")}</p>
                    <button type="button" className="btn btn-primary" onClick={onExit}>
                        {t("decider.backToParties")}
                    </button>
                </div>
            </div>
        );
    }

    if (!me) {
        return (
            <div className="home-page background-image">
                <div className="form-box">
                    <p className="form-error">{t("decider.notMember")}</p>
                    <button type="button" className="btn btn-primary" onClick={onExit}>
                        {t("decider.backToParties")}
                    </button>
                </div>
            </div>
        );
    }

    if (isClosed) {
        const votes = result?.votes ?? [];
        const tied = result?.tied ?? [];
        const winner = result?.winner ?? null;
        const winnerVotes = result?.winnerVotes ?? 0;

        return (
            <div className="home-page background-image">
                <div className="result-card">
                    <h1>{winner && tied.length <= 1 ? t("decider.resultTitle") : winner ? t("decider.tieTitle") : t("decider.noVotes")}</h1>

                    {winner && tied.length > 1 && <p>{t("decider.tieText")}</p>}

                    {winner && (
                        <div className="result-winner">
                            <img
                                src={getImageUrl(winner.image)}
                                alt={winner.title}
                                className="result-poster"
                            />
                            <div>
                                <h2>{winner.title}</h2>
                                <p className="mb-0">
                                    {t(winnerVotes === 1 ? "decider.vote" : "decider.votes", {count: winnerVotes})}
                                </p>
                            </div>
                        </div>
                    )}

                    {votes.length > 0 && (
                        <ul className="result-votes">
                            {votes.map((vote) => (
                                <li key={vote.id ?? vote.title}>
                                    <span>{vote.title}</span>
                                    <span>{t(vote.count === 1 ? "decider.vote" : "decider.votes", {count: vote.count})}</span>
                                </li>
                            ))}
                        </ul>
                    )}

                    <button type="button" className="btn btn-light mt-2" onClick={onExit}>
                        {t("decider.backToParties")}
                    </button>
                </div>
            </div>
        );
    }

    if (movies.length === 0) {
        return (
            <div className="home-page background-image">
                <div className="form-box">
                    <p>{t("decider.noFilms")}</p>
                    <button type="button" className="btn btn-primary" onClick={onExit}>
                        {t("decider.backToParties")}
                    </button>
                </div>
            </div>
        );
    }

    if (isFinished) {
        const progress = memberCount > 0 ? Math.round((finishedCount / memberCount) * 100) : 0;

        return (
            <div className="home-page background-image">
                <div className="form-box">
                    <h1 className="h3">{t("decider.endTitle")}</h1>
                    <p>{t("decider.progress", {finished: finishedCount, total: memberCount})}</p>

                    <div className="progress mb-3" role="progressbar" aria-valuenow={progress} aria-valuemin="0" aria-valuemax="100">
                        <div className="progress-bar bg-success" style={{width: `${progress}%`}}/>
                    </div>

                    <PartyCode code={partyId}/>

                    {!allFinished && <p className="text-muted">{t("decider.endText")}</p>}

                    {error && <p className="form-error mt-3">{error}</p>}

                    <div className="form-actions">
                        {allFinished && (isOwner
                            ? <button type="button" className="btn btn-danger" onClick={handleClose} disabled={closing}>
                                {closing ? t("common.loading") : t("decider.close")}
                            </button>
                            : <p className="text-muted mb-0">{t("decider.waitingOwner")}</p>)}

                        <button type="button" className="btn btn-outline-secondary" onClick={onExit}>
                            {t("decider.backToParties")}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const movie = movies[currentIndex];
    const progress = memberCount > 0 ? Math.round((finishedCount / memberCount) * 100) : 0;
    const movieRating = Math.round((movie.rating ?? 0) * 10) / 10;

    return (
        <div className="home-page background-image decider-page">
            <div className="decider-progress">
                <div className="d-flex justify-content-between gap-3">
                    <span>{t("decider.movieCounter", {current: currentIndex + 1, total: movies.length})}</span>
                    <span>{t("decider.progress", {finished: finishedCount, total: memberCount})}</span>
                </div>
                <div className="progress mt-2" role="progressbar" aria-valuenow={progress} aria-valuemin="0" aria-valuemax="100">
                    <div className="progress-bar bg-success" style={{width: `${progress}%`}}/>
                </div>
            </div>

            <PartyCode code={partyId}/>

            <div className="movie-card">
                <img
                    src={getImageUrl(movie.image)}
                    alt={movie.title}
                    className="movie-poster"
                />

                <div className="movie-info">
                    <h3 className="text-black">{movie.title}</h3>
                    <p className="movie-description">{movie.description || "—"}</p>
                    <div className="ratings">
                        <span className="imdb">{t("decider.rating")}: {movieRating}</span>
                    </div>
                </div>
            </div>

            <div className="button-container">
                <button type="button" className="button button5" onClick={handleNext} aria-label={t("decider.dislike")}>
                    👎
                </button>
                <button type="button" className="button button5" onClick={handleLike} aria-label={t("decider.like")}>
                    👍
                </button>
            </div>

            {error && <p className="form-error">{error}</p>}

            <button type="button" className="btn btn-outline-secondary mt-3" onClick={onExit}>
                {t("decider.backToParties")}
            </button>
        </div>
    );
}
