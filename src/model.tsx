
export interface Participant {
    fullName: string;
    company?: string;
    emailAddress?: string;
    frontTagline?: string;
    backTagline?: string;
    footnote?: string;
}

export interface BadgeStyle {
    backgroundImage?: string;
}

export interface BadgeSpecification {
    style: BadgeStyle;
    participants: Participant[];
}
