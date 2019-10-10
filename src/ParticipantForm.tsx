import * as React from "react";
import {useState} from "react";

import {Participant} from "./model";

export const ParticipantForm: React.FC<{ onSetParticipants(participants: Participant[]): void }> = ({onSetParticipants}) => {
    const [givenName, setGivenName] = useState("");
    const [familyName, setFamilyName] = useState("");
    const [emailAddress, setEmailAddress] = useState("");
    const [company, setCompany] = useState("");
    const [frontTagline, setFrontTagline] = useState("");
    const [footnote, setFootnote] = useState("");

    function handleSubmit(e) {
        e.preventDefault();
        const participant: Participant = {
            givenName, familyName, emailAddress, company, frontTagline, footnote
        };
        onSetParticipants([participant]);
    }

    return <form onSubmit={handleSubmit}>
        <h2>Enter participant manually</h2>
        <InputField label="First name:" value={givenName} onValueChange={setGivenName}/>
        <InputField label="Last name:" value={familyName} onValueChange={setFamilyName}/>
        <InputField label="Email address:" value={emailAddress} onValueChange={setEmailAddress} type="email"/>
        <InputField label="Company:" value={company} onValueChange={setCompany}/>
        <InputField label="Twitter:" value={frontTagline} onValueChange={setFrontTagline}/>
        <InputField label="Partipant type:" value={footnote} onValueChange={setFootnote}/>
        <div>
            <button>Show badge</button>
        </div>
    </form>;
};
const InputField: React.FC<{
    label: string, value: any, onValueChange(o: any): void, type: "text" | "email"
}> = ({label, value, onValueChange, type = "text"}) => {
    return <div><label>
        <div>{label}</div>
        <div><input value={value} onChange={e => onValueChange(e.target.value)} type={type}/></div>
    </label></div>
};
