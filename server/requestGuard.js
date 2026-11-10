const DEFAULT_LIMIT = 60;
const DEFAULT_WINDOW_MS = 60 * 1000;
const DEFAULT_MAX_ENTRIES = 5000;

function firstHeaderValue(value) {
    return String(value ?? "").split(",")[0].trim();
}

function hostFromUrl(value) {
    try {
        return new URL(value).host.toLowerCase();
    } catch {
        return null;
    }
}

function requestHost(headers) {
    return firstHeaderValue(headers["x-forwarded-host"] ?? headers.host).toLowerCase();
}

/**
 * The TMDb proxy is only meant to be called by the app itself. Browsers send
 * `Sec-Fetch-Site` and `Origin`/`Referer`, so a foreign page can be rejected
 * without affecting same-origin fetches, which send no `Origin` header.
 */
export function isSameOriginRequest(headers = {}) {
    const fetchSite = String(headers["sec-fetch-site"] ?? "").toLowerCase();
    if (fetchSite && fetchSite !== "same-origin" && fetchSite !== "none") {
        return false;
    }

    const host = requestHost(headers);
    const origin = headers.origin ? hostFromUrl(headers.origin) : null;
    const referer = headers.referer ? hostFromUrl(headers.referer) : null;

    if (headers.origin && !origin) {
        return false;
    }
    if (headers.referer && !referer) {
        return false;
    }
    if (origin && host && origin !== host) {
        return false;
    }
    if (!origin && referer && host && referer !== host) {
        return false;
    }
    return true;
}

export function clientIp(headers = {}, remoteAddress = "") {
    const forwarded = firstHeaderValue(headers["x-forwarded-for"]);
    const realIp = firstHeaderValue(headers["x-real-ip"]);
    return forwarded || realIp || String(remoteAddress ?? "");
}

/**
 * Fixed-window in-memory limiter. Serverless instances are ephemeral and
 * independent, so this deters casual abuse rather than guaranteeing a global
 * quota. It is enough for a small, non-commercial deployment.
 */
export function createRateLimiter({
    limit = DEFAULT_LIMIT,
    windowMs = DEFAULT_WINDOW_MS,
    maxEntries = DEFAULT_MAX_ENTRIES,
} = {}) {
    const buckets = new Map();

    const prune = (now) => {
        for (const [key, bucket] of buckets) {
            if (now - bucket.start >= windowMs) {
                buckets.delete(key);
            }
        }
        while (buckets.size > maxEntries) {
            const oldestKey = buckets.keys().next().value;
            buckets.delete(oldestKey);
        }
    };

    return function allow(key, now = Date.now()) {
        if (!key) {
            return true;
        }
        if (limit <= 0) {
            return false;
        }

        const bucket = buckets.get(key);
        if (!bucket || now - bucket.start >= windowMs) {
            buckets.set(key, {start: now, count: 1});
            if (buckets.size > maxEntries) {
                prune(now);
            }
            return true;
        }

        if (bucket.count >= limit) {
            return false;
        }
        bucket.count += 1;
        return true;
    };
}

export function policyResponse(status, error, extraHeaders = {}) {
    return {
        status,
        body: {error},
        headers: {
            "cache-control": "no-store",
            "content-type": "application/json; charset=utf-8",
            "x-content-type-options": "nosniff",
            ...extraHeaders,
        },
    };
}

/**
 * Returns a ready-to-send response when the request must be rejected,
 * or `null` when it can reach TMDb.
 */
export function guardRequest({headers = {}, remoteAddress = "", limiter} = {}) {
    if (!isSameOriginRequest(headers)) {
        return policyResponse(403, "forbidden-origin");
    }
    if (limiter && !limiter(clientIp(headers, remoteAddress))) {
        return policyResponse(429, "rate-limited", {"retry-after": "60"});
    }
    return null;
}
