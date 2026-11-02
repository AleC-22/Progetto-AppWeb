import {describe, expect, it} from "vitest";
import {buildDiscoverParams, getImageUrl, getTmdbImageUrl, LANGUAGE_FILTERS} from "./TMDb.js";

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

describe("buildDiscoverParams", () => {
    it("exposes the supported language filters", () => {
        expect(LANGUAGE_FILTERS).toEqual(["any", "italian-release", "italian"]);
    });

    it("does not add a language filter by default", () => {
        const params = buildDiscoverParams("Drama", 2020);

        expect(params.with_original_language).toBeUndefined();
        expect(params.with_release_type).toBeUndefined();
        expect(params["release_date.gte"]).toBeUndefined();
    });

    it("filters by Italian original language", () => {
        const params = buildDiscoverParams("Drama", 2020, "it-IT", "italian");

        expect(params.with_original_language).toBe("it");
        expect(params.with_release_type).toBeUndefined();
    });

    it("filters by Italian release even with an English UI", () => {
        const params = buildDiscoverParams("Comedy", 2016, "en-US", "italian-release");

        expect(params.region).toBe("IT");
        expect(params.with_release_type).toBe("2|3|4");
        expect(params["release_date.gte"]).toBe("1900-01-01");
        expect(params["release_date.lte"]).toBe(`${new Date().getFullYear() + 5}-12-31`);
        expect(params.with_original_language).toBeUndefined();
    });

    it("keeps genre and year filters alongside the language filter", () => {
        const params = buildDiscoverParams("Horror, Thriller", 2010, "it-IT", "italian-release");

        expect(params.with_genres).toBe("27,53");
        expect(params["primary_release_date.gte"]).toBe("2010-01-01");
        expect(params.region).toBe("IT");
    });
});
