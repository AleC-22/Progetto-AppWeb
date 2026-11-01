const TMDB_API_BASE = "https://api.themoviedb.org/3";
const PROXY_PREFIX = "/api/tmdb/";
const CACHE_CONTROL = "public, max-age=0, s-maxage=300, stale-while-revalidate=600";

// Only the endpoints used by the app can be reached through the proxy.
const ALLOWED_ENDPOINTS = new Set([
    "discover/movie",
    "movie/upcoming",
]);

// Only parameters the app actually needs are forwarded to TMDb.
const ALLOWED_PARAMS = new Set([
    "page",
    "language",
    "region",
    "include_adult",
    "sort_by",
    "vote_count.gte",
    "with_genres",
    "primary_release_date.gte",
]);

export class TmdbProxyError extends Error {
    constructor(status, code) {
        super(code);
        this.name = "TmdbProxyError";
        this.status = status;
        this.code = code;
    }
}

function jsonResult(status, body, cacheable = false) {
    return {
        status,
        body,
        headers: {
            "cache-control": cacheable ? CACHE_CONTROL : "no-store",
            "content-type": "application/json; charset=utf-8",
            "x-content-type-options": "nosniff",
        },
    };
}

export function parseProxyUrl(rawUrl) {
    const url = new URL(rawUrl, "http://localhost");

    if (!url.pathname.startsWith(PROXY_PREFIX)) {
        throw new TmdbProxyError(404, "not-found");
    }

    let endpoint;
    try {
        endpoint = decodeURIComponent(url.pathname.slice(PROXY_PREFIX.length)).replace(/\/+$/, "");
    } catch {
        throw new TmdbProxyError(400, "invalid-path");
    }
    if (!ALLOWED_ENDPOINTS.has(endpoint)) {
        throw new TmdbProxyError(404, "unsupported-endpoint");
    }

    const params = new URLSearchParams();
    for (const [name, value] of url.searchParams) {
        if (ALLOWED_PARAMS.has(name)) {
            params.append(name, value);
        }
    }

    const page = params.get("page");
    if (page !== null && (!/^\d+$/.test(page) || Number(page) < 1 || Number(page) > 500)) {
        throw new TmdbProxyError(400, "invalid-page");
    }

    const language = params.get("language");
    if (language !== null && !/^[a-z]{2}(-[A-Z]{2})?$/.test(language)) {
        throw new TmdbProxyError(400, "invalid-language");
    }

    const region = params.get("region");
    if (region !== null && !/^[A-Z]{2}$/.test(region)) {
        throw new TmdbProxyError(400, "invalid-region");
    }

    return {endpoint, params};
}

export async function proxyTmdbRequest({url, apiKey, fetchImpl = globalThis.fetch}) {
    if (!apiKey) {
        return jsonResult(500, {error: "missing-key"});
    }
    if (typeof fetchImpl !== "function") {
        return jsonResult(500, {error: "fetch-unavailable"});
    }

    let endpoint;
    let params;
    try {
        ({endpoint, params} = parseProxyUrl(url));
    } catch (error) {
        if (error instanceof TmdbProxyError) {
            return jsonResult(error.status, {error: error.code});
        }
        throw error;
    }

    const target = new URL(`${TMDB_API_BASE}/${endpoint}`);
    for (const [name, value] of params) {
        target.searchParams.append(name, value);
    }

    const headers = {accept: "application/json"};
    if (apiKey.startsWith("eyJ")) {
        // TMDb v4 read access token (JWT).
        headers.authorization = `Bearer ${apiKey}`;
    } else {
        // TMDb v3 API key.
        target.searchParams.set("api_key", apiKey);
    }

    try {
        const response = await fetchImpl(target, {headers});
        const text = await response.text();

        let body = {};
        if (text) {
            try {
                body = JSON.parse(text);
            } catch {
                return jsonResult(502, {error: "invalid-upstream-response"});
            }
        }

        if (!response.ok) {
            return jsonResult(response.status >= 400 ? response.status : 502, {
                error: "tmdb-error",
                status: response.status,
                details: body?.status_message ?? null,
            });
        }

        return jsonResult(200, body, true);
    } catch {
        return jsonResult(502, {error: "upstream-unreachable"});
    }
}

export function writeNodeResponse(response, result) {
    response.statusCode = result.status;
    for (const [name, value] of Object.entries(result.headers)) {
        response.setHeader(name, value);
    }
    response.end(JSON.stringify(result.body));
}
