import * as React from "react";
import {useState} from "react";

import {Participant} from "./model";

export const ParticipantForm: React.FC<{ onSetParticipants(participants: Participant[]): void }> = ({onSetParticipants}) => {
    const [fullName, setFullName] = useState("");
    const [emailAddress, setEmailAddress] = useState("");
    const [company, setCompany] = useState("");
    const [frontTagline, setFrontTagline] = useState("");
    const [backTagline, setBackTagline] = useState("");
    const [footnote, setFootnote] = useState("");

    function handleSubmit(e) {
        e.preventDefault();
        const participant: Participant = {
            fullName, emailAddress, company, frontTagline, footnote, backTagline
        };
        onSetParticipants([participant]);
    }

    return <form onSubmit={handleSubmit}>
        <h2>Enter participant manually</h2>
        <InputField label="Full name:" value={fullName} onValueChange={setFullName}/>
        <InputField label="Email address:" value={emailAddress} onValueChange={setEmailAddress} type="email"/>
        <InputField label="Company:" value={company} onValueChange={setCompany}/>
        <InputField label="Twitter:" value={frontTagline} onValueChange={setFrontTagline}/>
        <InputField label="Partipant type:" value={footnote} onValueChange={setFootnote}/>
        <InputField label="Back detail:" value={backTagline} onValueChange={setBackTagline}
                    placeholder={"E.g. for speaker, talk time and location"}/>
        <div>
            <button>Create badge for {fullName}</button>
        </div>
    </form>;
};
const InputField: React.FC<{
    label: string, value: any, onValueChange(o: any): void, type: "text" | "email", placeholder?: string
}> = ({label, value, onValueChange, type = "text", placeholder}) => {
    return <div><label>
        <div>{label}</div>
        <div><input value={value} onChange={e => onValueChange(e.target.value)} type={type} placeholder={placeholder}/></div>
    </label></div>
};
