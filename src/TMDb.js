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
                region: "IT",
                language: "it-IT",
                page: page
            }
        });
        let responseObj = {}
        function filmTransformer(){
            let films = [];
            for(let responseFilm of response.data.results){
                let transorfedFilm = {
                    title: responseFilm.title,
                    description: responseFilm.overview,
                    image: "https://image.tmdb.org/t/p/w300"+responseFilm.poster_path,
                    rating: responseFilm.vote_average
                }
                films.push(transorfedFilm);
            }
            return films;
        }

        responseObj.results = filmTransformer();
        responseObj.actualPage = response.data.page;
        responseObj.totalPages = response.data.total_pages;
        console.log(responseObj)
        return responseObj;
    } catch (error) {
        console.log("Errore nel recupero film: ", error);
        return [];
    }
}

function getGenreID(genreString){
    return genreString.split(",").map(g => genreMap[g.trim().toLowerCase()]).filter(id => id);
}

export const getUpcomingMovies = async (page = 1) => {
    try {
        const response = await axios.get(`${BASE_URL}/movie/upcoming`, {
            params: {
                api_key: API_KEY,
                language: "it-IT",
                page: page,
                region: "IT"
            }
        });

        return {
            results: response.data.results,
            actualPage: response.data.page,
            totalPages: response.data.total_pages
        };
    } catch (error) {
        console.log("Errore nel recupero dei film in uscita: ", error);
        return [];
    }
};