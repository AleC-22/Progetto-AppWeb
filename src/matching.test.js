import {describe, expect, it} from "vitest";
import {calculateMatch, filmKey} from "./matching.js";

const films = [
    {id: 1, title: "Film A"},
    {id: 2, title: "Film B"},
    {id: 3, title: "Film C"},
];

function member(isFinished, preferredFilms = []) {
    return {isFinished, preferredFilms};
}

describe("filmKey", () => {
    it("prefers the TMDb id", () => {
        expect(filmKey({id: 42, title: "Title"})).toBe("42");
    });

    it("falls back to the title", () => {
        expect(filmKey({title: "Title"})).toBe("Title");
    });
});

describe("calculateMatch", () => {
    it("does not close a party with unfinished members", () => {
        const result = calculateMatch(films, [member(true, [films[0]]), member(false, [])]);
        expect(result.allFinished).toBe(false);
    });

    it("requires at least one member", () => {
        expect(calculateMatch(films, []).allFinished).toBe(false);
    });

    it("selects the film with the most votes", () => {
        const result = calculateMatch(films, [
            member(true, [films[0], films[1]]),
            member(true, [films[1]]),
            member(true, [films[2]]),
        ]);

        expect(result.allFinished).toBe(true);
        expect(result.winner.title).toBe("Film B");
        expect(result.winnerVotes).toBe(2);
        expect(result.totalVotes).toBe(4);
    });

    it("reports a tie", () => {
        const result = calculateMatch(films, [
            member(true, [films[0]]),
            member(true, [films[1]]),
        ]);

        expect(result.tied).toHaveLength(2);
        expect(result.tied.map((vote) => vote.title)).toEqual(["Film A", "Film B"]);
    });

    it("returns no winner when nobody voted", () => {
        const result = calculateMatch(films, [member(true, []), member(true, [])]);

        expect(result.winner).toBeNull();
        expect(result.totalVotes).toBe(0);
        expect(result.tied).toEqual([]);
    });

    it("counts a film only once per member", () => {
        const result = calculateMatch(films, [
            member(true, [films[0], films[0], films[0]]),
            member(true, [films[1]]),
        ]);

        expect(result.tied).toHaveLength(2);
        expect(result.totalVotes).toBe(2);
    });

    it("ignores films that are not part of the party", () => {
        const result = calculateMatch(films, [
            member(true, [{id: 99, title: "Unknown"}]),
        ]);

        expect(result.totalVotes).toBe(0);
        expect(result.winner).toBeNull();
    });

    it("works with legacy films without ids", () => {
        const legacyFilms = [{title: "Old A"}, {title: "Old B"}];
        const result = calculateMatch(legacyFilms, [
            member(true, [legacyFilms[1]]),
            member(true, [legacyFilms[1]]),
        ]);

        expect(result.winner.title).toBe("Old B");
        expect(result.winnerVotes).toBe(2);
    });
});
