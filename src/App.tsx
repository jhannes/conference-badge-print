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
        <header>
            <h1>Badge Maker</h1>
            <h2>Generate conference badges in the browser</h2>
        </header>
        <nav>
            <h3>Instructions</h3>
            <ol>
                <li>Upload an image. It will be stretched to the 315x436 format of the badge</li>
                <li>To preview, enter participant details and press "Create badge"</li>
                <li>Select "Upload XLSX" to upload a list of participants</li>
                <li>Use the provided template as a starting point</li>
            </ol>
        </nav>
        <main id="control">
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
        </main>
        <main id="preview">
            {participants && <Badges participants={participants} backgroundImage={backgroundImage} /> }
        </main>
        <footer>
            <div>
                Created by Johannes Brodwall.
                Source code available on <a href="https://github.com/jhannes/conference-badge-print">GitHub</a>
            </div>
            <div>
                For privacy reasons this website only process the data in your browser and never uploads them to another location.
            </div>
        </footer>
    </>
};

const Badges: React.FC<{
    backgroundImage?: string,
    participants: Participant[]
}> = ({backgroundImage, participants}) => {

    const [pdf, setPdf] = useState();
    useEffect(() => {
        setPdf(undefined);
        (async () => {
            setPdf(await badgeGenerator({
                style: {backgroundImage},
                participants
            }));
        })();
    }, [backgroundImage, participants]);

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
