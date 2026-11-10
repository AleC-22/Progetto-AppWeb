/* eslint-disable react-refresh/only-export-components --
 * Error boundaries must be class components, which Fast Refresh cannot patch;
 * a full reload is acceptable for this rarely rendered fallback. */
import {Component} from "react";
import {useI18n} from "./i18n/context.js";

function CrashFallback({onReload}) {
    const {t} = useI18n();

    return (
        <div className="background-image">
            <div className="form-box" role="alert">
                <h1 className="h4 mb-3">{t("errors.crashTitle")}</h1>
                <p>{t("errors.crashText")}</p>
                <button type="button" className="btn btn-primary" onClick={onReload}>
                    {t("errors.reload")}
                </button>
            </div>
        </div>
    );
}

export class ErrorBoundary extends Component {
    state = {hasError: false};

    static getDerivedStateFromError() {
        return {hasError: true};
    }

    componentDidCatch(error, info) {
        console.error("Unexpected UI error", error, info);
    }

    render() {
        if (this.state.hasError) {
            return <CrashFallback onReload={() => window.location.reload()}/>;
        }
        return this.props.children;
    }
}
