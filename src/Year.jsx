import {useState} from "react";
import {Decider} from "./Decider.jsx";

export function Year({setChoose, genre}) {
    const [year, setYear] = useState(null);
    const [decider, setDecider] = useState(false);

    function handleYearChange(year) {
        setYear(year);
        setDecider(true);
    }

    function buttonListCreator(){
        const date = new Date();
        const currentYear = date.getFullYear();
        let buttonList= [];
        buttonList.push({text: "This year", year: currentYear});
        buttonList.push({text: "Last few years", year: currentYear - 5});
        buttonList.push({text: "Last 10 years", year: currentYear - 10});
        buttonList.push({text: "Last 25 years", year: currentYear - 25});
        buttonList.push({text: "Since 1900", year: 1900});
        return buttonList;
    }


    return (
        <>
            {decider ? <Decider year = {year} genre = {genre}/>:
                <>
                    <div className={"home-page"}>
                        <h1>Which year of release?</h1>
                        {buttonListCreator().map((button, index) => (
                            <div key={index}>
                                <button className={"btn btn-danger btn-year"}
                                        onClick={() => handleYearChange(button.year)}>
                                    {button.text}
                                </button>
                            </div>
                        ))}

                        <button className={"btn btn-light btn-year"} onClick={()=>{
                            setChoose("");
                        }}>
                            Back
                        </button>
                    </div>
                </>
            }
        </>
    );
}