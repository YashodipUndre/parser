// Master field schema to derive required/optional/system/formatting/order

export type FieldFormat = 'uppercase' | 'sentence' | 'capitalize' | 'email' | 'phone' | 'date' | 'text';

export interface FieldDef {
    name: string;
    required?: boolean;
    system?: boolean;
    isDate?: boolean;
    format?: FieldFormat; // preferred display format for headers
    order?: number;       // explicit ordering index
}

// Define schema in compact groups to minimize LOC
const schema: FieldDef[] = [];

function add(names: string, defaults: Partial<FieldDef> = {}) {
    const items = names.split('|').map((n) => n.trim()).filter(Boolean);
    for (const name of items) {
        schema.push({ name, ...defaults });
    }
}

// Core lead identification and status
add('ID', { required: true });
add('Lead Status|Status|Lead Stage|Territory', { required: true });
add('Lead Priority|Lead Owner|Lead Category|Request Type');

// Personal information
add('Salutation|First Name|Middle Name|Last Name');

// Professional details
add('Job Title|Gender|Source');

// Contact information
add('Email', { format: 'email' });
add('Website|Mobile No|WhatsApp|Phone|Phone Ext.|Alternate Phone(s)', { format: 'text' });

// Organization details
add('Organization Name', { required: true });
add('No of Employees|CASE Officer Remark|CASE Officer Note|Market Segment|Industry Type|Fax');

// Address information
add('Pincode|City|State/Province|Country|Ship To Address|Bill To Address|Full Address', { format: 'sentence' });

// Qualification workflow
add('Qualification Status|Qualified By');
add('Qualified on', { isDate: true, format: 'date' });

// Additional/system fields
add('Series', { system: true });
add('Annual Revenue');

// Assign order indices according to presentation grouping
schema.forEach((f, idx) => { f.order = idx; });

export const FIELD_SCHEMA: readonly FieldDef[] = schema;
