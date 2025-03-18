export function HomePage({setUser}){

    return(
        <>
            <div className={"background-home"}>
                <div className="sidebar">
                    <a className="active" href="#">Home</a>
                    <a href="#">News</a>
                    <a href="#">Contact</a>
                    <a href="#">About</a>
                    <a href={"#"}>Profilo</a>
                    <div className={"logout-box"}>
                        <a href={"#"} onClick={()=>setUser(null)}>
                            Logout
                        </a>
                    </div>
                </div>
            </div>
        </>
    )
}