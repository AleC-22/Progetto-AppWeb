import {readFileSync} from "node:fs";
import {fileURLToPath} from "node:url";
import {describe, expect, it} from "vitest";
import {CONTENT_SECURITY_POLICY} from "./csp.js";

const vercelConfig = JSON.parse(
    readFileSync(fileURLToPath(new URL("../vercel.json", import.meta.url)), "utf8"),
);

function headerValue(name) {
    const headers = vercelConfig.headers?.flatMap((entry) => entry.headers) ?? [];
    return headers.find((header) => header.key.toLowerCase() === name.toLowerCase())?.value;
}

describe("security headers", () => {
    it("keeps vercel.json CSP identical to the shared policy", () => {
        expect(headerValue("Content-Security-Policy")).toBe(CONTENT_SECURITY_POLICY);
    });

    it("keeps the base security headers", () => {
        expect(headerValue("X-Content-Type-Options")).toBe("nosniff");
        expect(headerValue("X-Frame-Options")).toBe("DENY");
        expect(headerValue("Referrer-Policy")).toBe("strict-origin-when-cross-origin");
        expect(headerValue("Strict-Transport-Security")).toBe("max-age=31536000");
    });

    it("does not allow framing or objects", () => {
        expect(CONTENT_SECURITY_POLICY).toContain("frame-ancestors 'none'");
        expect(CONTENT_SECURITY_POLICY).toContain("object-src 'none'");
    });
});
