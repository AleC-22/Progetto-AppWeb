export function Year({setChoose}) {
    return (
        <>
            <div className={"home-page"}>
                <h1>Which year of release?</h1>

                <button className={"btn btn-danger btn-year"}>
                    This year
                </button>

                <button className={"btn btn-danger btn-year"}>
                    Last few years
                </button>

                <button className={"btn btn-danger btn-year"}>
                    Last 10 years
                </button>

                <button className={"btn btn-danger btn-year"}>
                    Last 25 years
                </button>

                <button className={"btn btn-danger btn-year"}>
                    since 1900
                </button>

                <button className={"btn btn-light btn-year"} onClick={()=>setChoose("")}>
                    Back
                </button>

            </div>
        </>
    );
}