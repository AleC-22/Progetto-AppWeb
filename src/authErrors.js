export function getAuthErrorMessage(error, t) {
    switch (error?.code) {
        case "auth/invalid-credential":
        case "auth/user-not-found":
        case "auth/wrong-password":
            return t("auth.invalidCredentials");
        case "auth/email-already-in-use":
            return t("auth.emailInUse");
        case "auth/invalid-email":
            return t("auth.invalidEmail");
        case "auth/weak-password":
            return t("auth.weakPassword");
        case "auth/too-many-requests":
            return t("auth.tooManyRequests");
        default:
            return t("auth.genericError");
    }
}
