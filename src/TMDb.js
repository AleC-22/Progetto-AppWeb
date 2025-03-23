import axios from "axios";

const API_KEY = import.meta.env.VITE_TMDb_Key;
const BASE_URL = "https://api.themoviedb.org/3";

const genreMap = {
    "action": 28,
    "adventure": 12,
    "animation": 16,
    "comedy": 35,
    "documentary": 99,
    "drama": 18,
    "family": 10751,
    "fantasy": 14,
    "history": 36,
    "horror": 27,
    "mystery": 9648,
    "romance": 10749,
    "sci-Fi": 878,
    "thriller": 53
}

export const getMovies = async (genre, year, page = 1) => {
    try{
        const response = await axios.get(`${BASE_URL}/discover/movie`,{
            params: {
                api_key: API_KEY,
                with_genres: getGenreID(genre).join(","),
                "primary_release_date.gte": `${year}-01-01`,
                sort_by: "popularity.desc",
                language: "it-IT",
                page: page
            }
        });
        let responseObj = {}
        responseObj.results = response.data.results;
        responseObj.actualPage = response.data.page;
        responseObj.totalPages = response.data.total_pages;
        console.log(response.data)
        return responseObj;
    } catch (error) {
        console.log("Errore nel recupero film: ", error);
        return [];
    }
}

export function getGenreID(genreString){
    return genreString.split(",").map(g => genreMap[g.trim().toLowerCase()]).filter(id => id);
}