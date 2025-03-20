
import {Year} from "./Year.jsx";

export function Home() {
    const [choose, setChoose] = useState("");

    return (
        <>
        <div className={"home-page background-image"}>
        {choose === "year" ? <Year setChoose={setChoose} choose={choose}/> :
            <>
                <h1 className={"header"}>How do you feel?</h1>

                <button type={"button"} className={"btn btn-danger btn-home"}
                        onClick={()=>{
                            setChoose("year");
                        }}>
                    Dramatic<br/>
                    (Action, Adventure, Drama)
                </button>

                <button type={"button"} className={"btn btn-danger btn-home"}
                        onClick={()=>{
                            setChoose("year");
                        }}>
                    Anxiety<br/>
                    (Horror, Thriller, Mystery)
                </button>

                <button type={"button"} className={"btn btn-danger btn-home"}
                        onClick={()=>{
                            setChoose("year");
                        }}>
                    Gentle<br/>
                    (Comedy, Family, Romance)
                </button>

                <button type={"button"} className={"btn btn-danger btn-home"}
                        onClick={()=>{
                            setChoose("year");
                        }}>
                    Curious<br/>
                    (History, Documentary)
                </button>

                <button type={"button"} className={"btn btn-danger btn-home"}
                        onClick={()=>{
                            setChoose("year");
                        }}>
                    Out of this world<br/>
                    (Fantasy, Sci-Fi)
                </button>
            </>
            }
        </div>
        </>
    );
}