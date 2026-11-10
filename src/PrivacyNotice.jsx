import {useEffect} from "react";
import {useI18n} from "./i18n/context.js";

const REPOSITORY_ISSUES = "https://github.com/AleC-22/Progetto-AppWeb/issues";

export function PrivacyNotice({open, onClose}) {
    const {t} = useI18n();

    useEffect(() => {
        if (!open) {
            return;
        }
        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                onClose();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [open, onClose]);

    if (!open) {
        return null;
    }

    return (
        <div className="privacy-overlay" role="presentation" onClick={onClose}>
            <div
                className="privacy-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="privacy-title"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="privacy-header">
                    <h2 id="privacy-title" className="h4 mb-0">{t("privacy.title")}</h2>
                    <button
                        type="button"
                        className="btn-close"
                        aria-label={t("common.close")}
                        onClick={onClose}
                    />
                </div>

                <div className="privacy-body">
                    <p>{t("privacy.intro")}</p>

                    <h3 className="h6">{t("privacy.controllerTitle")}</h3>
                    <p>
                        {t("privacy.controller")}{" "}
                        <a href={REPOSITORY_ISSUES} target="_blank" rel="noreferrer">
                            {t("privacy.controllerLink")}
                        </a>
                    </p>

                    <h3 className="h6">{t("privacy.dataTitle")}</h3>
                    <ul>
                        <li>{t("privacy.dataAccess")}</li>
                        <li>{t("privacy.dataGuest")}</li>
                        <li>{t("privacy.dataRooms")}</li>
                    </ul>

                    <h3 className="h6">{t("privacy.purposeTitle")}</h3>
                    <p>{t("privacy.purpose")}</p>

                    <h3 className="h6">{t("privacy.storageTitle")}</h3>
                    <p>{t("privacy.storage")}</p>

                    <h3 className="h6">{t("privacy.sharingTitle")}</h3>
                    <p>{t("privacy.sharing")}</p>

                    <h3 className="h6">{t("privacy.cookiesTitle")}</h3>
                    <p>{t("privacy.cookies")}</p>

                    <h3 className="h6">{t("privacy.rightsTitle")}</h3>
                    <p>{t("privacy.rights")}</p>

                    <p className="privacy-updated mb-0">{t("privacy.updated")}</p>
                </div>
            </div>
        </div>
    );
}
