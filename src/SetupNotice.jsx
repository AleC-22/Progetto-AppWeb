import {useI18n} from "./i18n/context.js";
import {LanguageSwitcher} from "./LanguageSwitcher.jsx";

export function SetupNotice() {
    const {t} = useI18n();

    return (
        <div className="background-image">
            <div className="form-box setup-box">
                <div className="d-flex justify-content-between align-items-center gap-3 mb-3">
                    <h1 className="h3 mb-0">{t("setup.title")}</h1>
                    <LanguageSwitcher/>
                </div>
                <p>{t("setup.text")}</p>
                <pre className="setup-code">VITE_Firebase_apiKey=...{"\n"}VITE_Firebase_authDomain=...{"\n"}VITE_Firebase_projectId=...{"\n"}VITE_Firebase_appId=...{"\n"}VITE_TMDb_Key=...</pre>
                <p className="mb-0 text-muted">{t("setup.hint")}</p>
            </div>
        </div>
    );
}
