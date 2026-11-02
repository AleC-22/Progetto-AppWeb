import {describe, expect, it} from "vitest";
import {isExpiredClosedParty, timestampToMillis} from "./partyUtils.js";

const DAY = 24 * 60 * 60 * 1000;
const NOW = Date.UTC(2026, 0, 31);
const CUTOFF = NOW - 30 * DAY;

describe("timestampToMillis", () => {
    it("reads Firestore timestamps", () => {
        expect(timestampToMillis({toMillis: () => 1234})).toBe(1234);
    });

    it("reads JS dates and numeric values", () => {
        const date = new Date(NOW);
        expect(timestampToMillis(date)).toBe(NOW);
        expect(timestampToMillis(NOW)).toBe(NOW);
    });

    it("returns zero for missing or unsupported values", () => {
        expect(timestampToMillis(null)).toBe(0);
        expect(timestampToMillis(undefined)).toBe(0);
        expect(timestampToMillis({})).toBe(0);
        expect(timestampToMillis("2026-01-01")).toBe(0);
    });
});

describe("isExpiredClosedParty", () => {
    it("ignores parties that are still open", () => {
        expect(isExpiredClosedParty({
            status: "open",
            createdAt: NOW - 90 * DAY,
        }, CUTOFF)).toBe(false);
    });

    it("ignores closed parties newer than the cutoff", () => {
        expect(isExpiredClosedParty({
            status: "closed",
            closedAt: NOW - DAY,
        }, CUTOFF)).toBe(false);
    });

    it("detects closed parties older than the cutoff", () => {
        expect(isExpiredClosedParty({
            status: "closed",
            closedAt: NOW - 31 * DAY,
        }, CUTOFF)).toBe(true);
    });

    it("falls back to createdAt when closedAt is missing", () => {
        expect(isExpiredClosedParty({
            status: "closed",
            createdAt: NOW - 40 * DAY,
        }, CUTOFF)).toBe(true);
    });

    it("does not delete closed parties without a usable timestamp", () => {
        expect(isExpiredClosedParty({status: "closed"}, CUTOFF)).toBe(false);
        expect(isExpiredClosedParty(null, CUTOFF)).toBe(false);
    });
});
