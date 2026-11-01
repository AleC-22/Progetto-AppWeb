import {describe, expect, it} from "vitest";
import {getImageUrl, getTmdbImageUrl} from "./TMDb.js";

describe("getTmdbImageUrl", () => {
    it("builds a TMDb URL from a poster path that starts with a slash", () => {
        expect(getTmdbImageUrl("/poster.jpg")).toBe("https://image.tmdb.org/t/p/w300/poster.jpg");
    });

    it("supports a custom size and a path without a leading slash", () => {
        expect(getTmdbImageUrl("poster.jpg", "w500")).toBe("https://image.tmdb.org/t/p/w500/poster.jpg");
    });

    it("keeps absolute URLs unchanged", () => {
        expect(getTmdbImageUrl("https://example.com/poster.jpg")).toBe("https://example.com/poster.jpg");
    });

    it("returns the local placeholder when the poster is missing", () => {
        expect(getTmdbImageUrl(null)).toBe("/poster-placeholder.svg");
        expect(getTmdbImageUrl("")).toBe("/poster-placeholder.svg");
    });
});

describe("getImageUrl", () => {
    it("keeps local assets local", () => {
        expect(getImageUrl("/poster-placeholder.svg")).toBe("/poster-placeholder.svg");
    });

    it("keeps already-built TMDb URLs unchanged", () => {
        const url = "https://image.tmdb.org/t/p/w300/poster.jpg";
        expect(getImageUrl(url)).toBe(url);
    });

    it("returns the placeholder for a missing image", () => {
        expect(getImageUrl(null)).toBe("/poster-placeholder.svg");
    });
});
