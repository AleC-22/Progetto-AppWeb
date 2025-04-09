import {Year} from "./Year.jsx";
import {useState} from "react";

export function Home({partyName}) {
    const [choose, setChoose] = useState(false);
    const [genre, setGenre] = useState("");

    function handleGenresChange(genre) {
        setGenre(genre);
        setChoose(true);
    }

    function buttonListCreator(){
        let buttonList = [];
        buttonList.push({genres: "Action, Adventure, Drama", macroCategory: "Dramatic"});
        buttonList.push({genres: "Horror, Thriller, Mystery", macroCategory: "Anxiety"});
        buttonList.push({genres: "Comedy, Family, Romance", macroCategory: "Gentle"});
        buttonList.push({genres: "History, Documentary", macroCategory: "Curious"});
        buttonList.push({genres: "Fantasy, Sci-Fi", macroCategory: "Out of this world"});
        return buttonList;
    }

    return (
        <>

            <div className={"home-page background-image"}>
                {choose ? <Year setChoose={setChoose} genre={genre} partyName={partyName} /> :
                    <>
                        <h1 className={"header"}>How do you feel?</h1>
                        {buttonListCreator().map((button, index) => (
                            <div key={index}>
                                <button className={"btn btn-danger btn-home"}
                                        onClick={() => handleGenresChange(button.genres)}>
                                    {button.macroCategory} <br/>
                                    ({button.genres})
                                </button>
                            </div>
                        ))}
                    </>
                }
            </div>
        </>
    );
}