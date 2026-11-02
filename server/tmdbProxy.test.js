import {describe, expect, it} from "vitest";
import {parseProxyUrl, proxyTmdbRequest, TmdbProxyError, writeNodeResponse} from "./tmdbProxy.js";

function fakeFetch(body = {page: 1, results: []}, {ok = true, status = 200} = {}) {
    const calls = [];
    const fetchImpl = async (url, options) => {
        calls.push({url: String(url), options});
        return {
            ok,
            status,
            text: async () => JSON.stringify(body),
        };
    };
    return {calls, fetchImpl};
}

describe("parseProxyUrl", () => {
    it("accepts a whitelisted endpoint and keeps allowed params", () => {
        const {endpoint, params} = parseProxyUrl("/api/tmdb/discover/movie?page=2&language=it-IT&region=IT");

        expect(endpoint).toBe("discover/movie");
        expect(params.get("page")).toBe("2");
        expect(params.get("language")).toBe("it-IT");
        expect(params.get("region")).toBe("IT");
    });

    it("drops unknown params and any client-supplied api_key", () => {
        const {params} = parseProxyUrl("/api/tmdb/movie/upcoming?page=1&api_key=stolen&foo=bar");

        expect(params.has("api_key")).toBe(false);
        expect(params.has("foo")).toBe(false);
    });

    it("accepts the Italian-language and Italian-release filters", () => {
        const {params} = parseProxyUrl(
            "/api/tmdb/discover/movie?with_original_language=it&with_release_type=2|3|4"
            + "&release_date.gte=1900-01-01&release_date.lte=2031-12-31",
        );

        expect(params.get("with_original_language")).toBe("it");
        expect(params.get("with_release_type")).toBe("2|3|4");
        expect(params.get("release_date.gte")).toBe("1900-01-01");
        expect(params.get("release_date.lte")).toBe("2031-12-31");
    });

    it("rejects endpoints outside the whitelist", () => {
        expect(() => parseProxyUrl("/api/tmdb/account")).toThrow(TmdbProxyError);
        expect(() => parseProxyUrl("/api/tmdb/account")).toThrow("unsupported-endpoint");
    });

    it("rejects an invalid page", () => {
        expect(() => parseProxyUrl("/api/tmdb/movie/upcoming?page=0")).toThrow("invalid-page");
        expect(() => parseProxyUrl("/api/tmdb/movie/upcoming?page=abc")).toThrow("invalid-page");
    });

    it("rejects a malformed encoded path", () => {
        expect(() => parseProxyUrl("/api/tmdb/movie/%E0%A4%A/upcoming")).toThrow("invalid-path");
    });

    it("rejects invalid language and release filters", () => {
        expect(() => parseProxyUrl("/api/tmdb/discover/movie?with_original_language=italian"))
            .toThrow("invalid-original-language");
        expect(() => parseProxyUrl("/api/tmdb/discover/movie?with_release_type=9"))
            .toThrow("invalid-release-type");
        expect(() => parseProxyUrl("/api/tmdb/discover/movie?release_date.gte=1900-1-1"))
            .toThrow("invalid-release-date");
    });
});

describe("proxyTmdbRequest", () => {
    it("returns missing-key without calling TMDb", async () => {
        const {calls, fetchImpl} = fakeFetch();
        const result = await proxyTmdbRequest({url: "/api/tmdb/movie/upcoming", apiKey: "", fetchImpl});

        expect(result.status).toBe(500);
        expect(result.body).toEqual({error: "missing-key"});
        expect(calls).toHaveLength(0);
    });

    it("adds a v3 api_key server-side and forwards the request", async () => {
        const {calls, fetchImpl} = fakeFetch({page: 1, results: [{id: 1}]});
        const result = await proxyTmdbRequest({
            url: "/api/tmdb/movie/upcoming?page=1&language=it-IT&region=IT",
            apiKey: "v3-key",
            fetchImpl,
        });

        expect(result.status).toBe(200);
        expect(result.body).toEqual({page: 1, results: [{id: 1}]});
        expect(calls[0].url).toContain("https://api.themoviedb.org/3/movie/upcoming");
        expect(calls[0].url).toContain("api_key=v3-key");
        expect(result.headers["cache-control"]).toContain("s-maxage=300");
    });

    it("uses a bearer token when given a v4 access token", async () => {
        const {calls, fetchImpl} = fakeFetch();
        const token = "eyJhbGciOiJIUzI1NiJ9.fake-token";
        await proxyTmdbRequest({url: "/api/tmdb/movie/upcoming", apiKey: token, fetchImpl});

        expect(calls[0].url).not.toContain("api_key=");
        expect(calls[0].options.headers.authorization).toBe(`Bearer ${token}`);
    });

    it("maps TMDb errors to the proxy response", async () => {
        const {fetchImpl} = fakeFetch({status_message: "Invalid API key"}, {ok: false, status: 401});
        const result = await proxyTmdbRequest({url: "/api/tmdb/movie/upcoming", apiKey: "bad", fetchImpl});

        expect(result.status).toBe(401);
        expect(result.body).toEqual({
            error: "tmdb-error",
            status: 401,
            details: "Invalid API key",
        });
    });

    it("returns 502 when TMDb is unreachable", async () => {
        const result = await proxyTmdbRequest({
            url: "/api/tmdb/movie/upcoming",
            apiKey: "key",
            fetchImpl: async () => {
                throw new Error("network down");
            },
        });

        expect(result.status).toBe(502);
        expect(result.body).toEqual({error: "upstream-unreachable"});
    });
});

describe("writeNodeResponse", () => {
    it("writes status, headers and JSON body to a Node response", () => {
        const response = {
            statusCode: 0,
            headers: {},
            setHeader(name, value) {
                this.headers[name] = value;
            },
            end(body) {
                this.body = body;
            },
        };

        writeNodeResponse(response, {
            status: 200,
            headers: {"cache-control": "no-store"},
            body: {ok: true},
        });

        expect(response.statusCode).toBe(200);
        expect(response.headers["cache-control"]).toBe("no-store");
        expect(JSON.parse(response.body)).toEqual({ok: true});
    });
});
