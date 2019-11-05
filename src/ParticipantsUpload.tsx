import * as React from "react";
import {FileUpload} from "./FileUpload";
import * as XLSX from "xlsx";
import {convertParticipants, Participant} from "./model";

export const ParticipantsUpload: React.FC<{ onSetParticipants(participants: Participant[]): void }> = ({onSetParticipants}) => {
    const handleDataFile = (data?: string) => {
        if (!data) {
            return onSetParticipants([]);
        }
        const workBook = XLSX.read(data.split(",")[1]);
        const worksheet = workBook.Sheets[workBook.SheetNames[0]];
        onSetParticipants(convertParticipants(XLSX.utils.sheet_to_json(worksheet)));
    };

    const handleGenerateTemplate = () => {
        const workBook = XLSX.utils.book_new();
        const data = [
            ["fullName", "subtitle", "backSubtitle", "emailAddress", "frontTagline", "backTagline", "footnote"],
            ["Firstname Lastname", "Trainers ltd", "Wed 13:15\nAuditorium 1", "someone@example.com", "@mytwitter", "Kick ass programming", "Speaker"],
            ["Conf Organizer", "AweConf", "", "organizer@conf.example.com", "@tweetme", "", "Organizer"],
            ["John Doe", "ACME corp", "", "john@example.com", "", "", ""],
        ];
        XLSX.utils.book_append_sheet(workBook, XLSX.utils.aoa_to_sheet(data));
        XLSX.writeFile(workBook, "conferences-badges.xlsx");
    };

    return <>
        <h2>Upload file with participants</h2>

        <FileUpload onChangeValue={handleDataFile} localStorageKey="dataFile" accept={".xlsx"} />

        <h3>Download template</h3>

        <button onClick={handleGenerateTemplate}>Download</button>
    </>;
};
