import {StrictMode} from "react";
import {createRoot} from "react-dom/client";
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";
import App from "./App.jsx";
import {ErrorBoundary} from "./ErrorBoundary.jsx";
import {I18nProvider} from "./i18n/I18nProvider.jsx";

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <I18nProvider>
            <ErrorBoundary>
                <App/>
            </ErrorBoundary>
        </I18nProvider>
    </StrictMode>,
);
