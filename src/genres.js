export const GENRES = [
    {api: "Action", key: "action", id: 28},
    {api: "Adventure", key: "adventure", id: 12},
    {api: "Animation", key: "animation", id: 16},
    {api: "Comedy", key: "comedy", id: 35},
    {api: "Documentary", key: "documentary", id: 99},
    {api: "Drama", key: "drama", id: 18},
    {api: "Family", key: "family", id: 10751},
    {api: "Fantasy", key: "fantasy", id: 14},
    {api: "History", key: "history", id: 36},
    {api: "Horror", key: "horror", id: 27},
    {api: "Mystery", key: "mystery", id: 9648},
    {api: "Romance", key: "romance", id: 10749},
    {api: "Sci-Fi", key: "sciFi", id: 878},
    {api: "Thriller", key: "thriller", id: 53},
    {api: "War", key: "war", id: 10752},
    {api: "Western", key: "western", id: 37},
];

export function getGenreIDs(genreString) {
    if (!genreString) {
        return [];
    }
    return genreString
        .split(",")
        .map((name) => GENRES.find((genre) => genre.api.toLowerCase() === name.trim().toLowerCase()))
        .filter(Boolean)
        .map((genre) => genre.id);
}

export function translateGenres(genreString, t) {
    if (!genreString) {
        return "";
    }
    return genreString
        .split(",")
        .map((name) => {
            const genre = GENRES.find((item) => item.api.toLowerCase() === name.trim().toLowerCase());
            return genre ? t(`genre.${genre.key}`) : name.trim();
        })
        .filter(Boolean)
        .join(", ");
}
