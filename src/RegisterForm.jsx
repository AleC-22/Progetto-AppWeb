import {createUserWithEmailAndPassword} from "firebase/auth";
import {useState} from "react";
import {auth} from "./Firebase.js";
import {getAuthErrorMessage} from "./authErrors.js";
import {useI18n} from "./i18n/context.js";

export function RegisterForm({setUser}) {
    const {t} = useI18n();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const registerHandler = async (event) => {
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
        if (password !== confirmPassword) {
            setError(t("auth.passwordMismatch"));
            return;
        }

        setSubmitting(true);
        try {
            const credential = await createUserWithEmailAndPassword(auth, email, password);
            setUser(credential.user);
        } catch (authError) {
            console.log(authError);
            setError(getAuthErrorMessage(authError, t));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={registerHandler} noValidate>
            <div className="my-3">
                <label htmlFor="register-email" className="form-label">{t("auth.email")}</label>
                <input
                    id="register-email"
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
                <label htmlFor="register-password" className="form-label">{t("auth.password")}</label>
                <input
                    id="register-password"
                    type="password"
                    className="form-control"
                    placeholder={t("auth.password")}
                    autoComplete="new-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                />
            </div>

            <div className="mb-3">
                <label htmlFor="register-confirm-password" className="form-label">{t("auth.confirmPassword")}</label>
                <input
                    id="register-confirm-password"
                    type="password"
                    className="form-control"
                    placeholder={t("auth.confirmPassword")}
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    required
                />
            </div>

            {error && <p className="form-error">{error}</p>}

            <div className="button-box mt-3">
                <button type="submit" className="btn btn-primary btn-custom px-4" disabled={submitting}>
                    {submitting ? t("common.loading") : t("auth.register")}
                </button>
            </div>
        </form>
    );
}
