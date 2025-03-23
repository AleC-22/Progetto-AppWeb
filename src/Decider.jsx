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
        setCurrentIndex((prevIndex) => prevIndex === movies.length-1 ? 0 : prevIndex + 1);
    }

    const movie = movies[currentIndex];

    return (
        <>
        {movie ? (<div className="movie-card">
                <div className="movie-info">
                    <h3 className={"text-black"}>
                        {movie.title}<br/>
                        {movie.id}<br/>
                    </h3>
                    {/*<p className={"movie-genre"}>*/}

                    {/*</p>*/}
                </div>
        </div>
        ) : (<p> Caricamento...</p>)}
                {/*<div className="movie-info">*/}
                {/*    <h3>{movie.title}</h3>*/}
                {/*    /!*<p className="movie-genre">*!/*/}
                {/*    /!*    {}*!/*/}
                {/*    /!*</p>*!/*/}
                {/*</div>*/}
            <button onClick={handleNextMovie}>Prossimo Film</button>
        </>
    );
}