// The party document ID is the invite code. Codes use an unambiguous alphabet
// (no I, O, 0, 1) so they are easy to read aloud and type on a phone.
export const PARTY_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export const PARTY_CODE_LENGTH = 8;

const CODE_PATTERN = new RegExp(`^[${PARTY_CODE_ALPHABET}]{${PARTY_CODE_LENGTH}}$`);

export function generatePartyCode(random = Math.random) {
    let code = "";
    for (let index = 0; index < PARTY_CODE_LENGTH; index += 1) {
        const position = Math.floor(random() * PARTY_CODE_ALPHABET.length);
        code += PARTY_CODE_ALPHABET[position];
    }
    return code;
}

export function normalizePartyCode(value) {
    return String(value ?? "")
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "")
        .slice(0, PARTY_CODE_LENGTH);
}

export function isValidPartyCode(code) {
    return CODE_PATTERN.test(String(code ?? ""));
}
