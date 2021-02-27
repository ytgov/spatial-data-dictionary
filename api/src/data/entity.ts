

//Surface Management



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

let surfaceManagement: Program;

surfaceManagement = {
    name: "Surface Management",
    description: "Road surfaces",
    managers: [
        { name: "Ken", email: "ken@yukon.ca", role: "Data Steward" },
        { name: "Dave Comchi", email: "dave.comchi@yukon.ca", role: "Manager" }
    ]
}

export interface Repository { // database or ALRS
    id?: string;
    name: string;
    description: string;
    type: string;
    connection: string;
}

export interface Entity { // a table or layer or file
    id?: string;
    name: string;
    description: string;
    status: EntityStatus;
    location: any;
    attributes: Attribute[];
    properties: Property[];
    links: any;
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
    domain: Domain;
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