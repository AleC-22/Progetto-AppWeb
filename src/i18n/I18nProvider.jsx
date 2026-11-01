import {useEffect, useMemo, useState} from "react";
import {I18nContext} from "./context.js";
import {translations} from "./translations.js";

const STORAGE_KEY = "movie-matcher.language";
const SUPPORTED_LANGUAGES = ["it", "en"];

function detectLanguage() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (SUPPORTED_LANGUAGES.includes(saved)) {
        return saved;
    }
    return navigator.language?.toLowerCase().startsWith("it") ? "it" : "en";
}

function resolveTranslation(language, key) {
    return key.split(".").reduce((value, part) => value?.[part], translations[language]);
}

export function I18nProvider({children}) {
    const [lang, setLang] = useState(detectLanguage);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, lang);
        document.documentElement.lang = lang;
    }, [lang]);

    const value = useMemo(() => ({
        lang,
        setLang,
        t: (key, vars = {}) => {
            const template = resolveTranslation(lang, key) ?? resolveTranslation("en", key) ?? key;
            return String(template).replace(/\{\{(\w+)\}\}/g, (_, name) => (
                vars[name] !== undefined ? String(vars[name]) : `{{${name}}}`
            ));
        },
    }), [lang]);

    return (
        <I18nContext.Provider value={value}>
            {children}
        </I18nContext.Provider>
    );
}
