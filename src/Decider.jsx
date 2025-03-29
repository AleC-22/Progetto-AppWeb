import {useEffect, useState} from "react";
import {getMovies} from "./TMDb.js";

export function Decider({year, genre}) {

    const [movies, setMovies] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        if (year && genre) {
            console.log(`Fetching movies for genre: ${genre} and year: ${year}`);
            getMovies(genre, year, currentPage).then(data => {
                console.log(data)
                setMovies(data.results);
                setCurrentIndex(0);
                setTotalPages(data.totalPages);
            });
        }
    }, [year, genre, currentPage]);

    function handleNextMovie() {
        setCurrentIndex((prevIndex) => {
            if (prevIndex === movies.length - 1) {
                handleMoviePages();
                return 0;
            }
            return prevIndex + 1;
        });
    }


    function handleMoviePages() {
        setCurrentPage((prevPage) => prevPage === totalPages ? 1 : prevPage + 1);
    }

    const movie = movies[currentIndex];

    function handleMovieRating(){
        let movieRating = 0.0;
        if(movie.vote_average != null) {
            movieRating = Math.round(movie.vote_average * 10) / 10
        }
        return movieRating;
    }



    return (
        <>
            {movie ? (
                <div className="movie-card">
                    <img
                        src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`}
                        alt={movie.title}
                        className={"movie-poster"}
                    />

                    <div className="movie-info">

                        <h3 className={"text-black"}>
                            {movie.title}
                        </h3>

                        <p className={"movie-description"}>
                            {movie.overview}
                        </p>

                        <div className={"ratings"}>
                            <span className={"imdb"}>Rating: {handleMovieRating()}</span>
                        </div>

                    </div>

                </div>

            ) : (<p> Nessun film disponibile...</p>)}
            <div className={"button-container"}>
                <button className="button button5" onClick={handleNextMovie}>👎</button>
                <button className="button button5" onClick={handleNextMovie}>👍</button>
            </div>
        </>
    );

}