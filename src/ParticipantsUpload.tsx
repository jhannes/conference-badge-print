import * as React from "react";
import {FileUpload} from "./FileUpload";
import * as XLSX from "xlsx";
import {Participant} from "./model";

export const ParticipantsUpload: React.FC<{ onSetParticipants(participants: Participant[]): void }> = ({onSetParticipants}) => {
    const handleDataFile = (data?: string) => {
        if (!data) {
            return onSetParticipants([]);
        }
        const workBook = XLSX.read(data.split(",")[1]);
        const worksheet = workBook.Sheets[workBook.SheetNames[0]];
        const participantsRaw = XLSX.utils.sheet_to_json(worksheet);
        participantsRaw.reverse();

        const participants = participantsRaw.map(p => {
            let twitter = p["Twitter handle to print on your badge"];
            if (twitter && !twitter.startsWith("@")) twitter = "@" + twitter;

            const footnote = p["Crew type"];

            const participant: Participant = {
                givenName: p["Ticket First Name"],
                familyName: p["Ticket Last Name"],
                company: p["Ticket Company Name"],
                frontTagline: twitter,
                backTagline: p["Twitter handle to print on your badge"],
                emailAddress: p["Ticket Email"],
                footnote
            };
            return participant;
        });
        onSetParticipants(participants.slice(0, 10));
    };

    return <>
        <h2>Upload file with participants</h2>

        <FileUpload onChangeValue={handleDataFile} localStorageKey="dataFile" />

    </>;
};
