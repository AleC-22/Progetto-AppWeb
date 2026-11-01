import {useI18n} from "./i18n/context.js";

export function LoadingScreen({message}) {
    const {t} = useI18n();

    return (
        <div className="loading-screen">
            <div className="loading-spinner" aria-hidden="true"/>
            <p>{message ?? t("common.loading")}</p>
        </div>
    );
}
