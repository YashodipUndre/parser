// Column formatting + ordering utilities — compressed definitions
import { FIELD_SCHEMA } from './schema';

// Derive formatting groups from schema metadata
export const SENTENCE_CASE_COLUMNS = FIELD_SCHEMA.filter(f => f.format === 'sentence').map(f => f.name) as readonly string[];
export const CAPITALIZE_FIRST_COLUMNS = FIELD_SCHEMA.filter(f => f.format === 'capitalize').map(f => f.name) as readonly string[];
export const EMAIL_COLUMNS = FIELD_SCHEMA.filter(f => f.format === 'email').map(f => f.name) as readonly string[];

// Column order derived directly from schema 'order' indices
export const COLUMN_ORDER = FIELD_SCHEMA.slice().sort((a, b) => (a.order! - b.order!)).map(f => f.name) as readonly string[];

export const sortColumnsByOrder = (cols: string[]): string[] => {
    return [...cols].sort((a, b) => {
        const ai = COLUMN_ORDER.indexOf(a);
        const bi = COLUMN_ORDER.indexOf(b);
        if (ai === -1 && bi === -1) return 0;
        if (ai === -1) return 1;
        if (bi === -1) return -1;
        return ai - bi;
    });
};
