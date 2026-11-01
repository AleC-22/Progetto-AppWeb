import axios from "axios";
import {getGenreIDs} from "./genres.js";
import {DEMO_FILMS, DEMO_UPCOMING} from "./demoFilms.js";

const API_KEY = import.meta.env.VITE_TMDb_Key;
const USE_DEMO_MOVIES = import.meta.env.VITE_DEMO_MOVIES === "true";
const BASE_URL = "https://api.themoviedb.org/3";
const POSTER_PLACEHOLDER = "/poster-placeholder.svg";

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

export const getMovies = async (genre, year, page = 1, language = "it-IT") => {
    if (!API_KEY) {
        if (USE_DEMO_MOVIES) {
            return {results: DEMO_FILMS, actualPage: 1, totalPages: 1};
        }
        return emptyResult("missing-key");
    }

    try {
        const genreIDs = getGenreIDs(genre);
        const params = {
            api_key: API_KEY,
            language,
            page,
            include_adult: false,
            sort_by: "popularity.desc",
            "vote_count.gte": 20,
            region: language === "it-IT" ? "IT" : "US",
        };

        if (genreIDs.length > 0) {
            params.with_genres = genreIDs.join(",");
        }
        if (year) {
            params["primary_release_date.gte"] = `${year}-01-01`;
        }

        const response = await axios.get(`${BASE_URL}/discover/movie`, {params});

        return {
            results: response.data.results.map(transformFilm),
            actualPage: response.data.page,
            totalPages: Math.min(response.data.total_pages || 1, 500),
        };
    } catch (error) {
        console.log("Errore nel recupero film: ", error);
        return emptyResult("request-failed");
    }
};

export const getUpcomingMovies = async (page = 1, language = "it-IT") => {
    if (!API_KEY) {
        if (USE_DEMO_MOVIES) {
            return {results: DEMO_UPCOMING, actualPage: 1, totalPages: 1};
        }
        return emptyResult("missing-key");
    }

    try {
        const response = await axios.get(`${BASE_URL}/movie/upcoming`, {
            params: {
                api_key: API_KEY,
                language,
                page,
                region: language === "it-IT" ? "IT" : "US",
            },
        });

        return {
            results: response.data.results.map(transformFilm),
            actualPage: response.data.page,
            totalPages: Math.min(response.data.total_pages || 1, 500),
        };
    } catch (error) {
        console.log("Errore nel recupero dei film in uscita: ", error);
        return emptyResult("request-failed");
    }
};
