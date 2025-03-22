import {useEffect, useState} from "react";
import {getMovies} from "./TMDb.js";

export function Decider({year, genre}) {

    const [movies, setMovies] = useState([]);

    useEffect(() => {
        if (year && genre) {
            console.log(`Fetching movies for genre: ${genre} and year: ${year}`);
            getMovies(genre, year).then(data => {
                console.log(data)
                setMovies(data.results);
            });
        }
    }, [year, genre]);

    return (
        <>
            <h1 className={"black-text"}>Ciao</h1>
            {movies.length > 0 && (
                <div>
                    <h2>Movies:</h2>
                    <ul>
                        {movies.map(movie => (
                            <li key={movie.id}>{movie.title}</li>
                        ))}
                    </ul>
                </div>
            )}
        </>
    )
}