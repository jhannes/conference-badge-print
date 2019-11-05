
export interface Participant {
    fullName: string;
    subtitle?: string;
    emailAddress?: string;
    backSubtitle?: string;
    frontTagline?: string;
    backTagline?: string;
    footnote?: string;
}

export interface BadgeStyle {
    backgroundImage?: string;
    fontRegular?: ArrayBuffer|string;
    font500?: ArrayBuffer|string;
}

export interface BadgeSpecification {
    style: BadgeStyle;
    participants: Participant[];
}

const undefIfBlank = (s: string) => s && s.trim().length > 1 ? s.trim() : undefined;

export function convertParticipants(participantsRaw) {
    return participantsRaw.map(p => {
        let twitter = p["Twitter handle to print on your badge"];
        if (twitter && twitter.length < 4) twitter = null;
        if (twitter && !twitter.startsWith("@")) twitter = "@" + twitter;

        const participant: Participant = {
            fullName: p["fullName"] || p["Ticket Full Name"],
            subtitle: undefIfBlank(p["subtitle"]) || undefIfBlank(p["Ticket Company Name"]),
            backSubtitle: undefIfBlank(p["backSubtitle"]),
            emailAddress: undefIfBlank(p["Ticket Email"]),
            frontTagline: undefIfBlank(p["frontTagline"]) || twitter,
            backTagline: undefIfBlank(p["backTagline"]),
            footnote: undefIfBlank(p["footnote"]) || undefIfBlank(p["Crew type"]) || "Attendee"
        };
        return participant;
    });
}
