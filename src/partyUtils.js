export function timestampToMillis(value) {
    if (!value) {
        return 0;
    }
    if (typeof value.toMillis === "function") {
        return value.toMillis();
    }
    if (value instanceof Date) {
        return value.getTime();
    }
    return typeof value === "number" ? value : 0;
}

export function isExpiredClosedParty(party, cutoffMillis) {
    if (!party || party.status !== "closed") {
        return false;
    }
    const closedAt = timestampToMillis(party.closedAt ?? party.createdAt);
    return closedAt > 0 && closedAt < cutoffMillis;
}
