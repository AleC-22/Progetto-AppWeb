import {useState} from "react";
import {ConfirmParty} from "./ConfirmParty.jsx";
import {useI18n} from "./i18n/context.js";

export function Year({setChoose, genre, partyName, user, onPartyCreated}) {
    const {t} = useI18n();
    const [year, setYear] = useState(null);
    const [confirming, setConfirming] = useState(false);

    const currentYear = new Date().getFullYear();
    const choices = [
        {textKey: "year.thisYear", year: currentYear},
        {textKey: "year.last5", year: currentYear - 5},
        {textKey: "year.last10", year: currentYear - 10},
        {textKey: "year.last25", year: currentYear - 25},
        {textKey: "year.since1900", year: 1900},
    ];

    if (confirming) {
        return (
            <ConfirmParty
                year={year}
                genre={genre}
                partyName={partyName}
                user={user}
                onPartyCreated={onPartyCreated}
                onCancel={() => setConfirming(false)}
            />
        );
    }

    return (
        <div className="home-page background-image">
            <h1 className="header">{t("year.title")}</h1>

            {choices.map((choice) => (
                <div key={choice.textKey}>
                    <button
                        type="button"
                        className="btn btn-danger btn-year"
                        onClick={() => {
                            setYear(choice.year);
                            setConfirming(true);
                        }}
                    >
                        {t(choice.textKey)}
                    </button>
                </div>
            ))}

            <button type="button" className="btn btn-light btn-year" onClick={() => setChoose(false)}>
                {t("year.back")}
            </button>
        </div>
    );
}
