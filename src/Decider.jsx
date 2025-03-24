import {useEffect, useState} from "react";
import {getMovies} from "./TMDb.js";

export function Decider({year, genre}) {

    const [movies, setMovies] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (year && genre) {
            console.log(`Fetching movies for genre: ${genre} and year: ${year}`);
            getMovies(genre, year).then(data => {
                console.log(data)
                setMovies(data.results);
                setCurrentIndex(0);
            });
        }
    }, [year, genre]);

    function handleNextMovie(){
        setCurrentIndex((prevIndex) =>
            prevIndex === movies.length-1 ? 0 : prevIndex + 1);
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
        {movie ? (<div className="movie-card">
                <img
                    src= {`https://image.tmdb.org/t/p/w300${movie.poster_path}`}
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
                        <span className={"imbd"}>

                            Rating: {handleMovieRating()}
                        </span>
                    </div>

                </div>
            </div>
        ) : (<p> Caricamento...</p>)}
                    <button onClick={handleNextMovie}>Prossimo Film</button>

        </>
    );
}