import {describe, expect, it} from "vitest";
import {
    generatePartyCode,
    isValidPartyCode,
    normalizePartyCode,
    PARTY_CODE_ALPHABET,
    PARTY_CODE_LENGTH,
} from "./partyCode.js";

describe("generatePartyCode", () => {
    it("creates codes of the expected length using the allowed alphabet", () => {
        const code = generatePartyCode();
        expect(code).toHaveLength(PARTY_CODE_LENGTH);
        expect(isValidPartyCode(code)).toBe(true);
    });

    it("avoids ambiguous characters", () => {
        const code = generatePartyCode();
        for (const character of code) {
            expect(PARTY_CODE_ALPHABET).toContain(character);
        }
        expect(code).not.toMatch(/[IO01]/);
    });

    it("honours the injected random source", () => {
        expect(generatePartyCode(() => 0)).toBe("AAAAAAAA");
        expect(generatePartyCode(() => 0.999999)).toBe("99999999");
    });
});

describe("normalizePartyCode", () => {
    it("uppercases and strips separators", () => {
        expect(normalizePartyCode(" abcd-2345 ")).toBe("ABCD2345");
        expect(normalizePartyCode("ab cd")).toBe("ABCD");
    });

    it("ignores non-alphanumeric characters", () => {
        expect(normalizePartyCode("A!B@C#2$3%4^5")).toBe("ABC2345");
    });

    it("truncates to the maximum code length", () => {
        expect(normalizePartyCode("ABCDEFGHJKLMN")).toHaveLength(PARTY_CODE_LENGTH);
    });

    it("handles empty values", () => {
        expect(normalizePartyCode(null)).toBe("");
        expect(normalizePartyCode(undefined)).toBe("");
    });
});

describe("isValidPartyCode", () => {
    it("accepts well-formed codes", () => {
        expect(isValidPartyCode("ABCD2345")).toBe(true);
        expect(isValidPartyCode(generatePartyCode())).toBe(true);
    });

    it("rejects wrong length and ambiguous characters", () => {
        expect(isValidPartyCode("ABCD234")).toBe(false);
        expect(isValidPartyCode("ABCD23456")).toBe(false);
        expect(isValidPartyCode("ABCD234O")).toBe(false);
        expect(isValidPartyCode("")).toBe(false);
        expect(isValidPartyCode(null)).toBe(false);
    });
});
