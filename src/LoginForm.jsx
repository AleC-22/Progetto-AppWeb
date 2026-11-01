import {signInWithEmailAndPassword} from "firebase/auth";
import {useState} from "react";
import {auth} from "./Firebase.js";
import {getAuthErrorMessage} from "./authErrors.js";
import {useI18n} from "./i18n/context.js";

export function LoginForm({setUser}) {
    const {t} = useI18n();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const loginHandler = async (event) => {
        event.preventDefault();
        setError("");

        if (!email || !password) {
            setError(t("auth.emailPasswordRequired"));
            return;
        }
        if (password.length < 6) {
            setError(t("auth.passwordShort"));
            return;
        }

        setSubmitting(true);
        try {
            const credential = await signInWithEmailAndPassword(auth, email, password);
            setUser(credential.user);
        } catch (authError) {
            console.log(authError);
            setError(getAuthErrorMessage(authError, t));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={loginHandler} noValidate>
            <div className="my-3">
                <label htmlFor="login-email" className="form-label">{t("auth.email")}</label>
                <input
                    id="login-email"
                    type="email"
                    className="form-control"
                    placeholder={t("auth.email")}
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                />
            </div>

            <div className="mb-3">
                <label htmlFor="login-password" className="form-label">{t("auth.password")}</label>
                <input
                    id="login-password"
                    type="password"
                    className="form-control"
                    placeholder={t("auth.password")}
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                />
            </div>

            {error && <p className="form-error">{error}</p>}

            <div className="button-box">
                <button type="submit" className="btn btn-primary btn-custom px-4" disabled={submitting}>
                    {submitting ? t("common.loading") : t("auth.login")}
                </button>
            </div>
        </form>
    );
}
