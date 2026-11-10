// Single source of truth for the Content-Security-Policy. `vercel.json`
// duplicates this string, and `server/csp.test.js` keeps them in sync.
export const CSP_DIRECTIVES = {
    "default-src": ["'self'"],
    "script-src": ["'self'", "https://apis.google.com", "https://www.gstatic.com"],
    "style-src": ["'self'", "'unsafe-inline'"],
    "img-src": ["'self'", "data:", "https://image.tmdb.org"],
    "font-src": ["'self'", "data:"],
    "connect-src": [
        "'self'",
        "https://identitytoolkit.googleapis.com",
        "https://securetoken.googleapis.com",
        "https://www.googleapis.com",
        "https://*.googleapis.com",
    ],
    // Firebase Auth embeds a helper iframe on the project's authDomain.
    "frame-src": ["https://progetto-saw-706f2.firebaseapp.com", "https://accounts.google.com"],
    "worker-src": ["'self'"],
    "manifest-src": ["'self'"],
    "base-uri": ["'self'"],
    "form-action": ["'self'"],
    "object-src": ["'none'"],
    "frame-ancestors": ["'none'"],
    "upgrade-insecure-requests": [],
};

export const CONTENT_SECURITY_POLICY = Object.entries(CSP_DIRECTIVES)
    .map(([directive, values]) => (values.length > 0 ? `${directive} ${values.join(" ")}` : directive))
    .join("; ");
