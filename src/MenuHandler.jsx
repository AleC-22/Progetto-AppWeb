import {signOut} from "firebase/auth";
import {useState} from "react";
import {auth} from "./Firebase.js";
import {News} from "./News.jsx";
import {Profile} from "./Profile.jsx";
import {WatchParty} from "./WatchParty.jsx";
import {LanguageSwitcher} from "./LanguageSwitcher.jsx";
import {Credits} from "./Credits.jsx";
import {useI18n} from "./i18n/context.js";

export function MenuHandler({user, setUser}) {
    const {t} = useI18n();
    const [page, setPage] = useState("WatchParty");

    const signOutHandler = async () => {
        try {
            await signOut(auth);
            setUser(null);
        } catch (error) {
            console.log(error);
        }
    };

    const navItems = [
        {id: "WatchParty", label: t("nav.home")},
        {id: "News", label: t("nav.news")},
        {id: "Profile", label: t("nav.profile")},
    ];

    return (
        <div className="background-home">
            <nav className="app-nav">
                <div className="app-nav-links">
                    <span className="app-brand">🎬 {t("appName")}</span>
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            type="button"
                            className={page === item.id ? "active" : ""}
                            onClick={() => setPage(item.id)}
                            aria-current={page === item.id ? "page" : undefined}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>

                <div className="app-nav-actions">
                    <LanguageSwitcher/>
                    <button type="button" className="nav-logout" onClick={signOutHandler}>
                        {t("nav.logout")}
                    </button>
                </div>
            </nav>

            <main className="app-main">
                {page === "WatchParty" && <WatchParty user={user}/>}
                {page === "News" && <News/>}
                {page === "Profile" && <Profile user={user} setUser={setUser}/>}
            </main>

            <footer className="app-footer" aria-label={t("credits.title")}>
                <Credits compact/>
            </footer>
        </div>
    );
}
