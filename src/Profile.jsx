import {deleteUser} from "firebase/auth";
import {useState} from "react";
import {LanguageSwitcher} from "./LanguageSwitcher.jsx";
import {Credits} from "./Credits.jsx";
import {PrivacyNotice} from "./PrivacyNotice.jsx";
import {useI18n} from "./i18n/context.js";

export function Profile({user, setUser}) {
    const {t} = useI18n();
    const [error, setError] = useState("");
    const [deleting, setDeleting] = useState(false);
    const [privacyOpen, setPrivacyOpen] = useState(false);
    const isGuest = Boolean(user?.isAnonymous);

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
                <p className="profile-account">
                    {isGuest ? t("profile.guest") : (user.displayName || user.email)}
                </p>
                {isGuest && <p className="form-text">{t("profile.guestHint")}</p>}

                {error && <p className="form-error mt-2 mb-0">{error}</p>}

                <label className="form-label mt-4 d-block">{t("profile.language")}</label>
                <LanguageSwitcher/>

                <button
                    type="button"
                    className="privacy-link mt-4 d-block"
                    onClick={() => setPrivacyOpen(true)}
                >
                    {t("privacy.link")}
                </button>

                {!isGuest && (
                    <>
                        <label className="form-label mt-4 d-block">{t("profile.deleteAccount")}</label>
                        <button
                            type="button"
                            className="btn btn-danger delete-button"
                            onClick={deleteAccountHandler}
                            disabled={deleting}
                        >
                            {deleting ? t("common.loading") : t("profile.deleteAccount")}
                        </button>
                    </>
                )}
            </div>

            <section className="profile-credits" aria-labelledby="credits-title">
                <h3 id="credits-title" className="h6">{t("credits.title")}</h3>
                <Credits/>
            </section>

            <PrivacyNotice open={privacyOpen} onClose={() => setPrivacyOpen(false)}/>
        </div>
    );
}
