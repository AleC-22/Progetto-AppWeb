import {useI18n} from "./i18n/context.js";

export function LanguageSwitcher({className = ""}) {
    const {lang, setLang, t} = useI18n();

    return (
        <div className={`language-switcher ${className}`.trim()} role="group" aria-label={t("language.label")}>
            <button
                type="button"
                className={lang === "it" ? "active" : ""}
                onClick={() => setLang("it")}
                aria-pressed={lang === "it"}
            >
                IT
            </button>
            <button
                type="button"
                className={lang === "en" ? "active" : ""}
                onClick={() => setLang("en")}
                aria-pressed={lang === "en"}
            >
                EN
            </button>
        </div>
    );
}
