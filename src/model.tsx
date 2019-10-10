
export interface Participant {
    givenName: string;
    familyName: string;
    company?: string;
    emailAddress?: string;
    frontTagline?: string;
    frontTagline2?: string;
    backTagline?: string;
    backTagline2?: string;
    footnote?: string;
}

export interface BadgeStyle {
    title: string;
    backgroundImage?: string;
}

export interface BadgeSpecification {
    style: BadgeStyle;
    participants: Participant[];
}
