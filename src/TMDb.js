import axios from "axios";
import {getGenreIDs} from "./genres.js";
import {DEMO_FILMS, DEMO_UPCOMING} from "./demoFilms.js";

const USE_DEMO_MOVIES = import.meta.env.VITE_DEMO_MOVIES === "true";
// The browser calls our proxy, which adds the TMDb credentials server-side.
const BASE_URL = "/api/tmdb";
const REQUEST_TIMEOUT = 15000;
const POSTER_PLACEHOLDER = "/poster-placeholder.svg";

// "italian-release" is a best-effort proxy for Italian audio/subtitles:
// TMDb has no subtitle track data, but a release in Italy usually means
// an Italian dubbed or subtitled edition exists.
export const LANGUAGE_FILTERS = ["any", "italian-release", "italian"];

export function getImageUrl(path, size = "w300") {
    if (!path) {
        return POSTER_PLACEHOLDER;
    }
    if (path.startsWith("http") || path.startsWith("/")) {
        return path;
    }
    return `https://image.tmdb.org/t/p/${size}${path}`;
}

export function getTmdbImageUrl(path, size = "w300") {
    if (!path) {
        return POSTER_PLACEHOLDER;
    }
    if (path.startsWith("http")) {
        return path;
    }
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    return `https://image.tmdb.org/t/p/${size}${normalizedPath}`;
}

function transformFilm(film) {
    return {
        id: film.id,
        title: film.title ?? film.name ?? "",
        description: film.overview ?? "",
        image: getTmdbImageUrl(film.poster_path),
        rating: film.vote_average ?? 0,
        releaseDate: film.release_date ?? film.first_air_date ?? "",
    };
}

function emptyResult(error) {
    return {
        results: [],
        actualPage: 1,
        totalPages: 0,
        error,
    };
}

async function requestMovieList(endpoint, params, demoResults, errorLabel) {
    if (USE_DEMO_MOVIES) {
        return {results: demoResults, actualPage: 1, totalPages: 1};
    }

    try {
        const response = await axios.get(`${BASE_URL}/${endpoint}`, {
            params,
            timeout: REQUEST_TIMEOUT,
        });

        return {
            results: response.data.results.map(transformFilm),
            actualPage: response.data.page,
            totalPages: Math.min(response.data.total_pages || 1, 500),
        };
    } catch (error) {
        console.error(errorLabel, error);
        const code = error?.response?.data?.error;
        return emptyResult(code === "missing-key" ? "missing-key" : "request-failed");
    }
}

export function buildDiscoverParams(genre, year, language = "it-IT", languageFilter = "any") {
    const genreIDs = getGenreIDs(genre);
    const italianEdition = languageFilter === "italian-release";
    const params = {
        language,
        page: 1,
        include_adult: false,
        sort_by: "popularity.desc",
        "vote_count.gte": 20,
        region: italianEdition || language === "it-IT" ? "IT" : "US",
    };

    if (genreIDs.length > 0) {
        params.with_genres = genreIDs.join(",");
    }
    if (year) {
        params["primary_release_date.gte"] = `${year}-01-01`;
    }
    if (languageFilter === "italian") {
        params.with_original_language = "it";
    }
    if (italianEdition) {
        params.with_release_type = "2|3|4";
        params["release_date.gte"] = "1900-01-01";
        params["release_date.lte"] = `${new Date().getFullYear() + 5}-12-31`;
    }

    return params;
}

export const getMovies = async (genre, year, page = 1, language = "it-IT", languageFilter = "any") => {
    const params = buildDiscoverParams(genre, year, language, languageFilter);
    params.page = page;

    return requestMovieList("discover/movie", params, DEMO_FILMS, "Errore nel recupero film: ");
};

export const getUpcomingMovies = async (page = 1, language = "it-IT") => {
    return requestMovieList("movie/upcoming", {
        language,
        page,
        region: language === "it-IT" ? "IT" : "US",
    }, DEMO_UPCOMING, "Errore nel recupero dei film in uscita: ");
};
