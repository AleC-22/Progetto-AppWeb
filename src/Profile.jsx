import {deleteUser} from "firebase/auth";
import {getFavoriteGenre, saveFavoriteGenre} from "./SetterAndGetter.js";
import {useEffect, useState} from "react";
import {GENRES} from "./genres.js";
import {LanguageSwitcher} from "./LanguageSwitcher.jsx";
import {Credits} from "./Credits.jsx";
import {useI18n} from "./i18n/context.js";

export function Profile({user, setUser}) {
    const {t} = useI18n();
    const [favoriteGenre, setFavoriteGenre] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        let cancelled = false;

        if (user) {
            getFavoriteGenre(user.uid).then((genre) => {
                if (!cancelled) {
                    setFavoriteGenre(genre ?? "");
                }
            });
        }

        return () => {
            cancelled = true;
        };
    }, [user]);

    const selectionHandler = async (genre) => {
        setMessage("");
        setError("");
        try {
            await saveFavoriteGenre(user.uid, genre);
            setFavoriteGenre(genre);
            setMessage(t("profile.saved"));
        } catch (saveError) {
            console.error(saveError);
            setError(t("errors.generic"));
        }
    };

    const deleteAccountHandler = async () => {
        if (!window.confirm(t("profile.deleteConfirm"))) {
            return;
        }

        setDeleting(true);
        setError("");
        try {
            await deleteUser(user);
            setUser(null);
        } catch (deleteError) {
            console.error(deleteError);
            if (deleteError.code === "auth/requires-recent-login") {
                setError(t("profile.recentLogin"));
            } else {
                setError(t("profile.deleteError"));
            }
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="profile-container">
            <h2 className="profile-title">{t("profile.title")}</h2>

            <div className="profile-form-group">
                <label className="form-label">{t("profile.account")}</label>
                <p className="profile-account">{user.displayName || user.email}</p>

                <label htmlFor="favorite-genre" className="form-label mt-3">
                    {t("profile.favoriteGenre")}
                </label>
                <select
                    id="favorite-genre"
                    value={favoriteGenre}
                    onChange={(event) => selectionHandler(event.target.value)}
                    className="form-select"
                >
                    <option value="">{t("profile.select")}</option>
                    {GENRES.map((genre) => (
                        <option key={genre.api} value={genre.api}>
                            {t(`genre.${genre.key}`)}
                        </option>
                    ))}
                </select>

                {message && <p className="text-success mt-2 mb-0">{message}</p>}
                {error && <p className="form-error mt-2 mb-0">{error}</p>}

                <label className="form-label mt-4 d-block">{t("profile.language")}</label>
                <LanguageSwitcher/>

                <label className="form-label mt-4 d-block">{t("profile.deleteAccount")}</label>
                <button
                    type="button"
                    className="btn btn-danger delete-button"
                    onClick={deleteAccountHandler}
                    disabled={deleting}
                >
                    {deleting ? t("common.loading") : t("profile.deleteAccount")}
                </button>
            </div>

            <section className="profile-credits" aria-labelledby="credits-title">
                <h3 id="credits-title" className="h6">{t("credits.title")}</h3>
                <Credits/>
            </section>
        </div>
    );
}
