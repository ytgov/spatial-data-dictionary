
export interface Program { // asset category
    id?: string;
    name: string;
    description?: string;
    managers?: Person[];
}

export interface Person {
    id?: string;
    name: string;
    email: string;
    phone?: string;
    role?: string;
}

export interface Repository { // database or ALRS
    id?: string;
    name: string;
    description: string;
    type: string;
    connection: string;
}

export interface Entity { // a table or layer or file
    _id: any;
    id?: string;
    name: string;
    description: string;
    status: EntityStatus;
    location: any;
    attributes: Attribute[];
    properties: Property[];
    links: any;
    tags?: string[];
    search_reason?: string;
    create_date: Date;
    create_user: string;
}

export enum EntityStatus {
    DRAFT = "Draft",
    ACTIVE = "Active",
    INACTIVE = "Inactive",
    RETIRED = "Retired"
}

export interface Attribute {
    _id?: string;
    name: string;
    description?: string;
    type?: string;
    domain: Domain;
    source: any;
    properties: Property[];
}

export interface Property {
    name: string;
    value: any;
    type: string;
}

export interface Domain {
    id?: string;
    name: string;
    values: DomainValue[];
    manager: Person;
}

export interface DomainValue {
    id?: string;
    value: string | number;
    description: string;
}

export interface SearchResult {
    entities?: Entity[];
    programs?: Program[];
    attribute?: Attribute[];
}