import {useEffect, useState} from "react";
import {getUpcomingMovies} from "./TMDb.js";

export function News() {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    function handleNextPage(){
        setCurrentPage((prevPage) => prevPage === totalPages ? prevPage : prevPage + 1);
    }

    function handlePrevPage(){
        setCurrentPage((prevPage) => prevPage === 1 ? 1 : prevPage - 1);
    }

    useEffect(() => {
        getUpcomingMovies(currentPage).then(data =>{
            setMovies(data.results);
            setLoading(false);
            setTotalPages(data.totalPages);
        });
    }, [currentPage]);



    return (
        <div className={"news-container"}>
            <h2>Upcoming Movies</h2>
            {loading ? <p>Loading...</p> :
                (
                    <div className={"movies-grid"}>
                    {movies.map(movie => (
                        <div key={movie.id} className={"movie-card-news"}>
                            <img
                                src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`}
                                alt={movie.title}
                                className={"movie-poster-news"}
                                />
                            <h3-news>{movie.title}</h3-news>
                            <p>📅 Release: {movie.release_date}</p>
                        </div>
                    ))}
                    </div>
                )
            }
            <div className={"d-flex pt-3 justify-content-center gap-3"}>
                <button className="btn btn-dark" onClick={handlePrevPage}>⬅️</button>
                <button className="btn btn-dark" onClick={handleNextPage}>➡️</button>
            </div>
        </div>
        );
}