import {describe, expect, it} from "vitest";
import {
    clientIp,
    createRateLimiter,
    guardRequest,
    isSameOriginRequest,
} from "./requestGuard.js";

describe("isSameOriginRequest", () => {
    it("allows same-origin requests", () => {
        expect(isSameOriginRequest({
            host: "flixsort.example",
            origin: "https://flixsort.example",
            "sec-fetch-site": "same-origin",
        })).toBe(true);
    });

    it("allows requests without Origin or Referer", () => {
        expect(isSameOriginRequest({host: "flixsort.example"})).toBe(true);
        expect(isSameOriginRequest({})).toBe(true);
    });

    it("allows same-origin Referer when Origin is missing", () => {
        expect(isSameOriginRequest({
            host: "flixsort.example",
            referer: "https://flixsort.example/watch-party",
        })).toBe(true);
    });

    it("rejects cross-site requests", () => {
        expect(isSameOriginRequest({
            host: "flixsort.example",
            origin: "https://evil.example",
            "sec-fetch-site": "cross-site",
        })).toBe(false);
    });

    it("rejects a foreign Origin even without Sec-Fetch-Site", () => {
        expect(isSameOriginRequest({
            host: "flixsort.example",
            origin: "https://evil.example",
        })).toBe(false);
    });

    it("rejects a foreign Referer when Origin is missing", () => {
        expect(isSameOriginRequest({
            host: "flixsort.example",
            referer: "https://evil.example/page",
        })).toBe(false);
    });

    it("rejects a malformed Origin", () => {
        expect(isSameOriginRequest({
            host: "flixsort.example",
            origin: "not a url",
        })).toBe(false);
    });

    it("matches host including the port", () => {
        expect(isSameOriginRequest({
            host: "localhost:5173",
            origin: "http://localhost:5173",
        })).toBe(true);
        expect(isSameOriginRequest({
            host: "localhost:5173",
            origin: "http://localhost:4173",
        })).toBe(false);
    });

    it("uses the first value of a forwarded host list", () => {
        expect(isSameOriginRequest({
            "x-forwarded-host": "flixsort.example, internal.vercel",
            host: "internal.vercel",
            origin: "https://flixsort.example",
        })).toBe(true);
    });

    it("allows user-initiated navigation (Sec-Fetch-Site: none)", () => {
        expect(isSameOriginRequest({
            host: "flixsort.example",
            "sec-fetch-site": "none",
        })).toBe(true);
    });
});

describe("clientIp", () => {
    it("prefers the first forwarded address", () => {
        expect(clientIp({"x-forwarded-for": "203.0.113.7, 10.0.0.1"}, "10.0.0.2")).toBe("203.0.113.7");
    });

    it("falls back to x-real-ip and then to the socket address", () => {
        expect(clientIp({"x-real-ip": "203.0.113.8"}, "10.0.0.3")).toBe("203.0.113.8");
        expect(clientIp({}, "10.0.0.4")).toBe("10.0.0.4");
    });
});

describe("createRateLimiter", () => {
    it("allows requests up to the limit and then blocks", () => {
        const allow = createRateLimiter({limit: 3, windowMs: 1000});
        const now = 1000;

        expect(allow("1.2.3.4", now)).toBe(true);
        expect(allow("1.2.3.4", now)).toBe(true);
        expect(allow("1.2.3.4", now)).toBe(true);
        expect(allow("1.2.3.4", now)).toBe(false);
    });

    it("resets the window", () => {
        const allow = createRateLimiter({limit: 1, windowMs: 1000});

        expect(allow("1.2.3.4", 1000)).toBe(true);
        expect(allow("1.2.3.4", 1500)).toBe(false);
        expect(allow("1.2.3.4", 2000)).toBe(true);
    });

    it("keeps separate buckets per key", () => {
        const allow = createRateLimiter({limit: 1, windowMs: 1000});

        expect(allow("a", 1000)).toBe(true);
        expect(allow("b", 1000)).toBe(true);
        expect(allow("a", 1000)).toBe(false);
    });

    it("always allows requests without a key", () => {
        const allow = createRateLimiter({limit: 1, windowMs: 1000});

        expect(allow("", 1000)).toBe(true);
        expect(allow("", 1000)).toBe(true);
    });
});

describe("guardRequest", () => {
    it("returns null for an allowed same-origin request", () => {
        expect(guardRequest({
            headers: {host: "flixsort.example", origin: "https://flixsort.example"},
            limiter: createRateLimiter({limit: 10}),
        })).toBeNull();
    });

    it("returns 403 for a foreign origin", () => {
        const result = guardRequest({
            headers: {host: "flixsort.example", origin: "https://evil.example"},
            limiter: createRateLimiter({limit: 10}),
        });

        expect(result?.status).toBe(403);
        expect(result?.body).toEqual({error: "forbidden-origin"});
    });

    it("returns 429 with retry-after when the limit is exhausted", () => {
        const limiter = createRateLimiter({limit: 0});
        const result = guardRequest({
            headers: {host: "flixsort.example", "x-forwarded-for": "203.0.113.9"},
            limiter,
        });

        expect(result?.status).toBe(429);
        expect(result?.body).toEqual({error: "rate-limited"});
        expect(result?.headers["retry-after"]).toBe("60");
    });
});
