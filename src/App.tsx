import * as React from "react";
import {useEffect, useState} from "react";
import {Participant} from "./model";
import {badgeGenerator} from "./badge-generator";

import * as XLSX from 'xlsx';


export const App = () => {
    const [title, setTitle] = useState();
    const [backgroundImage, setBackgroundImage] = useState();
    const [participants, setParticipants] = useState<Participant[]>();

    const handleDataFile = (data: string) => {
        const workBook = XLSX.read(data.split(",")[1]);
        const worksheet = workBook.Sheets[workBook.SheetNames[0]];
        const participantsRaw = XLSX.utils.sheet_to_json(worksheet);
        participantsRaw.reverse();
        console.log(participantsRaw);


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
        setParticipants(participants.slice(0, 10));
    };

    return <>
        <div>
            <h2>Hello world</h2>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} />
            <ImageUpload value={backgroundImage} onChangeValue={setBackgroundImage}/>
            <FileUpload onChangeValue={handleDataFile} localStorageKey="dataFile" />
        </div>
        <div>
            {participants && <Badges participants={participants} backgroundImage={backgroundImage} /> }
        </div>
    </>
};

const Badges: React.FC<{
    title: string,
    backgroundImage?: string,
    participants: Participant[]
}> = ({title, backgroundImage, participants}) => {

    const [pdf, setPdf] = useState();
    useEffect(() => {
        (async () => {
            setPdf(await badgeGenerator({
                style: {title, backgroundImage},
                participants
            }));
        })();
    }, [title]);

    return <>
        <iframe src={pdf} width="100%" height="100%" />
    </>;
};

const FileUpload: React.FC<{
    onChangeValue: (value:string) => void,
    localStorageKey?: string,
    onLoading?: (value: boolean) => void
}> = ({onChangeValue, onLoading, localStorageKey}) => {
    useEffect(() => {
        if (localStorageKey) {
            onChangeValue(localStorage.getItem(localStorageKey));
        }
    }, []);
    const handleChange = e => {
        const reader = new FileReader();
        const filename = e.target.files[0].name;
        onLoading && onLoading(true);
        reader.onloadend = () => {
            const value: string = reader.result as string;
            localStorageKey && localStorage.setItem(localStorageKey, value);
            localStorageKey && localStorage.setItem(localStorageKey + ".name", filename);
            onChangeValue(value);
            onLoading && onLoading(false);
        };
        console.log(e.target.files[0]);
        reader.readAsDataURL(e.target.files[0]);
    };

    return <input type="file" onChange={handleChange}  />;
};

const ImageUpload: React.FC<{ value: any, onChangeValue: any }> = ({value, onChangeValue}) => {
    const [loading, setLoading] = useState<boolean>(false);

    return <div>
        <h3>Background image</h3>
        <FileUpload onChangeValue={onChangeValue} localStorageKey="backgroundImage" onLoading={setLoading} />
        {loading && <div>Loading</div>}
        {value && (
            <>
                <h2>Preview</h2>
                <div>
                    <img width="200" src={value} border="1px solid black" alt="Uploaded image preview" />
                </div>
            </>
        )}
    </div>;
};
