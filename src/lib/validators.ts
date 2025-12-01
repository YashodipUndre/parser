import { z } from 'zod';
import type { ValidationError } from '@/types/validation.types';
import { DROPDOWN_OPTIONS, isRequiredField, isDateField } from '@/constants';
import { generateId, isEmpty, trimSpaces, isEmptyRow } from './utils';

// Regex cache
const DATE_REGEX = /^(\d{2})-(\d{2})-(\d{4})$/;
const ALPHA_REGEX = /^[A-Za-z0-9]+$/;
const emailSchema = z.string().email();

// Fuzzy match cache
const matchCache = new Map<string, string | null>();

const findClosestMatch = (value: string, options: readonly string[]): string | null => {
    const key = `${value}:${options.length}`;
    if (matchCache.has(key)) return matchCache.get(key)!;
    const valueLower = value.toLowerCase();
    const result = options.find(o => o.toLowerCase() === valueLower) ||
        options.find(o => o.toLowerCase().includes(valueLower) || valueLower.includes(o.toLowerCase())) || null;
    matchCache.set(key, result);
    return result;
};

const createError = (rowIndex: number, columnName: string, cellValue: string, errorType: string, message: string, suggestedFix: string | null = null): ValidationError => ({
    id: generateId(), rowIndex, columnName, cellValue, errorType: errorType as ValidationError['errorType'],
    severity: 'error', message, suggestedFix, canAutoFix: !!suggestedFix,
});

export function validateRow(rowData: Record<string, unknown>, rowIndex: number): ValidationError[] {
    if (isEmptyRow(rowData)) return [];
    const errors: ValidationError[] = [];

    for (const [field, value] of Object.entries(rowData)) {
        const val = String(value || '').trim();
        const hasValue = !isEmpty(value);

        // Required field check
        if (isRequiredField(field) && !hasValue) {
            errors.push(createError(rowIndex, field, val, 'REQUIRED_FIELD_EMPTY', `⚠️ "${field}" cannot be empty - it's required!`));
            continue;
        }

        if (!hasValue) continue;

        // Dropdown validation
        const opts = DROPDOWN_OPTIONS[field as keyof typeof DROPDOWN_OPTIONS];
        if (opts && !opts.includes(val as never)) {
            const match = findClosestMatch(val, opts as readonly string[]);
            const msg = opts.length <= 2 ? `🔽 Pick from: ${opts.join(' or ')}` : `🔽 Choose from ${opts.length} options (${opts.slice(0, 2).join(', ')}, ...)`;
            errors.push(createError(rowIndex, field, val, 'INVALID_DROPDOWN', msg, match));
        }

        // ID validation
        if (field === 'ID' && !ALPHA_REGEX.test(val)) {
            errors.push(createError(rowIndex, 'ID', val, 'INVALID_FORMAT', '🆔 ID must contain only letters and numbers (no spaces or special characters).'));
        }

        // Email validation
        if (field === 'Email') {
            if (val !== trimSpaces(val)) {
                errors.push(createError(rowIndex, field, val, 'LEADING_TRAILING_SPACES', '✂️ Email has extra spaces - remove them', trimSpaces(val)));
            }
            if (!emailSchema.safeParse(val).success) {
                errors.push(createError(rowIndex, field, val, 'INVALID_EMAIL', '📧 Email format is incorrect (should be name@company.com)'));
            }
        }

        // Date validation
        if (isDateField(field)) {
            const match = val.match(DATE_REGEX);
            if (!match) {
                errors.push(createError(rowIndex, field, val, 'INVALID_FORMAT', '📅 Date should be DD-MM-YYYY format (e.g., 27-10-2025)'));
            } else {
                const [, day, month, year] = match;
                const d = new Date(+year, +month - 1, +day);
                if (d.getFullYear() !== +year || d.getMonth() !== +month - 1 || d.getDate() !== +day) {
                    errors.push(createError(rowIndex, field, val, 'INVALID_FORMAT', `📅 This date doesn't exist. Check the day and month.`));
                }
            }
        }
    }

    return errors;
}

export function detectDuplicateIDs(data: Array<Record<string, unknown>>): ValidationError[] {
    const idMap = new Map<string, number[]>();
    data.forEach((row, i) => {
        const id = String(row['ID'] || '').trim();
        if (id) (idMap.get(id) || idMap.set(id, []).get(id)!).push(i + 2);
    });

    const errors: ValidationError[] = [];
    idMap.forEach((rows, id) => {
        if (rows.length > 1) {
            rows.forEach(r => errors.push(createError(r, 'ID', id, 'DUPLICATE_VALUE', `🔁 ID "${id}" appears ${rows.length} times. Each ID must be unique!`)));
        }
    });
    return errors;
}
