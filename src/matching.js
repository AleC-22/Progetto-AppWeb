export function filmKey(film) {
    return String(film?.id ?? film?.title ?? "");
}

export function calculateMatch(films = [], members = []) {
    const allFinished = members.length > 0 && members.every((member) => member.isFinished);
    const knownKeys = new Set(films.map(filmKey));
    const counts = new Map(films.map((film) => [filmKey(film), 0]));

    for (const member of members) {
        const seen = new Set();
        for (const film of member.preferredFilms ?? []) {
            const key = filmKey(film);
            if (seen.has(key)) {
                continue;
            }
            seen.add(key);
            if (knownKeys.has(key)) {
                counts.set(key, (counts.get(key) ?? 0) + 1);
            }
        }
    }

    const votes = films
        .map((film) => ({
            id: film.id ?? null,
            title: film.title,
            count: counts.get(filmKey(film)) ?? 0,
        }))
        .sort((a, b) => b.count - a.count || a.title.localeCompare(b.title));

    const maxVotes = votes[0]?.count ?? 0;
    const tied = maxVotes > 0 ? votes.filter((vote) => vote.count === maxVotes) : [];
    const winnerEntry = tied[0] ?? null;
    const winner = winnerEntry
        ? films.find((film) => filmKey(film) === String(winnerEntry.id ?? winnerEntry.title)) ?? films.find((film) => film.title === winnerEntry.title) ?? null
        : null;

    return {
        allFinished,
        votes,
        maxVotes,
        tied,
        winner,
        winnerVotes: maxVotes,
        totalVotes: votes.reduce((sum, vote) => sum + vote.count, 0),
        memberCount: members.length,
    };
}
