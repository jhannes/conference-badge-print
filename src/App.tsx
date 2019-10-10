import * as React from "react";
import {useEffect, useState} from "react";
import {Participant} from "./model";
import {badgeGenerator} from "./badge-generator";

import {ParticipantForm} from "./ParticipantForm";
import {ParticipantsUpload} from "./ParticipantsUpload";
import {FileUpload} from "./FileUpload";

type participantSource = "xsls" | "input";


export const App = () => {
    const [source, setSource] = useState<participantSource>("input");
    const [backgroundImage, setBackgroundImage] = useState();
    const [participants, setParticipants] = useState<Participant[]>();

    return <>
        <div>
            <h1>Generate name badges</h1>

            <h2>Background image</h2>
            <ImageUpload value={backgroundImage} onChangeValue={setBackgroundImage}/>

            <h2>Participant source</h2>

            <div>
                <label>
                    <input type="radio" name="participantSource" value={"input"} checked={source == "input"}
                       onChange={e => setSource(e.target.value)}/>
                    Enter participant manually
                </label>
                <label>
                    <input type="radio" name="participantSource" value={"xlsx"} checked={source == "xlsx"}
                       onChange={e => setSource(e.target.value)} />
                    Upload XLSX
                </label>
            </div>
            {
                source == "xlsx" && <ParticipantsUpload onSetParticipants={setParticipants} />
            }
            {
                source == "input" && <ParticipantForm onSetParticipants={setParticipants} />
            }
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
        setPdf(undefined);
        (async () => {
            setPdf(await badgeGenerator({
                style: {title, backgroundImage},
                participants
            }));
        })();
    }, [title, participants]);

    return <>
        <iframe src={pdf} width="100%" height="100%" />
    </>;
};

const ImageUpload: React.FC<{ value: any, onChangeValue: any }> = ({value, onChangeValue}) => {
    const [loading, setLoading] = useState<boolean>(false);

    return <div>
        <FileUpload onChangeValue={onChangeValue} localStorageKey="backgroundImage" onLoading={setLoading} />
        {loading && <div>Loading</div>}
        {value && (
            <>
                <h3>Image preview</h3>
                <div>
                    <img width="200" src={value} border="1px solid black" alt="Uploaded image preview" />
                </div>
            </>
        )}
    </div>;
};
