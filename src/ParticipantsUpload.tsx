import * as React from "react";
import {FileUpload} from "./FileUpload";
import * as XLSX from "xlsx";
import {Participant} from "./model";

const undefIfBlank = (s: string) => s && s.trim().length > 1 ? s.trim() : undefined;

export const ParticipantsUpload: React.FC<{ onSetParticipants(participants: Participant[]): void }> = ({onSetParticipants}) => {
    const handleDataFile = (data?: string) => {
        if (!data) {
            return onSetParticipants([]);
        }
        const workBook = XLSX.read(data.split(",")[1]);
        const worksheet = workBook.Sheets[workBook.SheetNames[0]];
        const participantsRaw = XLSX.utils.sheet_to_json(worksheet);

        const participants = participantsRaw.map(p => {
            let twitter = p["Twitter handle to print on your badge"];
            if (twitter && twitter.length < 4) twitter = null;
            if (twitter && !twitter.startsWith("@")) twitter = "@" + twitter;

            const participant: Participant = {
                fullName: p["fullName"] || p["Ticket Full Name"],
                company: undefIfBlank(p["company"]) || undefIfBlank(p["Ticket Company Name"]),
                emailAddress: undefIfBlank(p["Ticket Email"]),
                frontTagline: undefIfBlank(p["frontTagline"]) || twitter,
                backTagline: undefIfBlank(p["backTagline"]),
                footnote: undefIfBlank(p["footnote"]) || undefIfBlank(p["Crew type"])
            };
            return participant;
        });
        onSetParticipants(participants.slice(0, 10));
    };

    const handleGenerateTemplate = () => {
        const workBook = XLSX.utils.book_new();
        const data = [
            ["fullName", "company", "emailAddress", "frontTagline", "backTagline", "footnote"],
            ["Firstname Lastname", "Trainers ltd", "someone@example.com", "@mytwitter", "Wed 13:15: Kick ass programming", "Speaker"],
            ["Conf Organizer", "", "organizer@conf.example.com", "@tweetme", "", "Organizer"],
            ["John Doe", "ACME corp", "john@example.com", "", "", ""],
        ];
        XLSX.utils.book_append_sheet(workBook, XLSX.utils.aoa_to_sheet(data));
        XLSX.writeFile(workBook, "conferences-badges.xlsx");
    };

    return <>
        <h2>Upload file with participants</h2>

        <FileUpload onChangeValue={handleDataFile} localStorageKey="dataFile" />

        <h3>Download template</h3>

        <button onClick={handleGenerateTemplate}>Download</button>
    </>;
};
