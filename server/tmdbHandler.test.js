import {afterEach, describe, expect, it, vi} from "vitest";
import handler from "../api/tmdb/[...path].js";

function mockResponse() {
    return {
        statusCode: 0,
        headers: {},
        setHeader(name, value) {
            this.headers[name] = value;
        },
        end(body) {
            this.body = body;
        },
    };
}

describe("Vercel TMDb handler", () => {
    const originalFetch = globalThis.fetch;
    const originalKey = process.env.TMDB_API_KEY;

    afterEach(() => {
        globalThis.fetch = originalFetch;
        if (originalKey === undefined) {
            delete process.env.TMDB_API_KEY;
        } else {
            process.env.TMDB_API_KEY = originalKey;
        }
    });

    it("proxies the request using the server-side key", async () => {
        process.env.TMDB_API_KEY = "server-key";
        globalThis.fetch = vi.fn(async () => ({
            ok: true,
            status: 200,
            text: async () => JSON.stringify({page: 1, results: []}),
        }));

        const response = mockResponse();
        await handler({url: "/api/tmdb/movie/upcoming?page=1&language=it-IT"}, response);

        expect(response.statusCode).toBe(200);
        expect(JSON.parse(response.body)).toEqual({page: 1, results: []});
        expect(String(globalThis.fetch.mock.calls[0][0])).toContain("api_key=server-key");
    });

    it("rejects endpoints outside the whitelist", async () => {
        process.env.TMDB_API_KEY = "server-key";

        const response = mockResponse();
        await handler({url: "/api/tmdb/account"}, response);

        expect(response.statusCode).toBe(404);
        expect(JSON.parse(response.body)).toEqual({error: "unsupported-endpoint"});
    });
});
