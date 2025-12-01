# Excel Lead Parser - Copilot Instructions

## Project Overview
This is a Next.js 16 + React 19 app for parsing, validating, and cleaning Excel lead data. Built for performance (handles 1000+ rows with virtual scrolling), focused on ERPNext lead import workflow with 41 standardized fields.

## Architecture

### Data Flow
```
File Upload → Excel Parser (XLSX.js) → Auto-Fix Engine → Validation → Virtual Grid Display
                ↓                           ↓                 ↓
            ParsedExcelFile         AutoFixInfo[]     ValidationError[]
```

### Key Principles
1. **Schema-Driven**: All 41 fields defined in `src/constants/schema.ts` (FIELD_SCHEMA). User files may have extra columns but only these 41 are validated/exported.
2. **Auto-Fix First**: During parsing (`excel-parser.ts`), automatically fix spaces, name formatting, email lowercase, phone cleaning, fuzzy dropdown matching. Track all fixes in `AutoFixInfo[]`.
3. **Centralized State**: `useExcelParser` hook manages all state. Never duplicate state management.
4. **Virtual Scrolling**: Always use `@tanstack/react-virtual` for tables - renders only visible rows regardless of dataset size.
5. **Immutable Updates**: Use spread operators for data updates to trigger React re-renders properly.

## Critical Patterns

### Field System
- **Required Fields** (5): `ID`, `Lead Status`, `Status`, `Lead Stage`, `Territory` - cannot be empty (CRITICAL errors)
- **Optional Fields** (36): Only validated if value provided - empty is OK
- **Dropdown Fields**: Fuzzy matching with Levenshtein distance (threshold 0.8) in `excel-parser.ts`
- **Date Fields**: ERPNext format DD-MM-YYYY (e.g., 27-10-2025) validated in `validators.ts`
- Check field type with: `isRequiredField()`, `isOptionalField()`, `isDateField()` from `src/constants/fields.ts`

### Validation Severity
```typescript
'error' → Required field empty OR invalid format (email/phone/date)
'warning' → Dropdown mismatch but has suggested fix
'info' → Informational only
```
Users can export with errors/warnings but not with unfixed CRITICAL errors (required field empty).

### Auto-Fix Engine (`src/lib/auto-fix.ts`)
Applied automatically during parsing:
1. Trim all text fields (ALWAYS for ALL fields)
2. Email → lowercase
3. Name fields → Title Case (First Name, Last Name, Organization Name, City, State/Province, Country, CASE Officer fields)
4. Phone fields → remove spaces/hyphens/parentheses
5. Dropdown fields → fuzzy match to closest valid option

**Note**: Manual fixes via UI buttons have been removed. Auto-fix only works during initial upload and document changes.

### Performance Optimizations
- Virtual scrolling: `VIRTUAL_ROW_HEIGHT = 40`, renders ~15-20 rows at a time
- Error/AutoFix maps: Use `Map<string, T>` with key `${rowIndex}-${columnName}` for O(1) lookups
- Memoization: `useMemo` for error maps, `React.memo` for cell components
- Debounced search: 300ms delay in filter inputs
- **Target**: 1000 rows in <500ms, smooth 60fps scrolling

### Data Update Pattern
```typescript
// CORRECT - triggers re-validation
const handleCellUpdate = (rowIndex, columnName, value) => {
  const newData = [...sheet.data];
  newData[rowIndex - 2] = { ...newData[rowIndex - 2], [columnName]: value };
  handleDataUpdate(newData); // Re-validates entire sheet
};

// WRONG - direct mutation
sheet.data[rowIndex][columnName] = value; // NO!
```

## Development Commands
```bash
pnpm dev          # Start dev server (Next.js 16)
pnpm build        # Production build
pnpm lint         # ESLint check
```

## File Structure Guide
```
src/
├── constants/           # Single source of truth
│   ├── schema.ts       # FIELD_SCHEMA (41 fields) - MASTER DEFINITION
│   ├── dropdowns.ts    # DROPDOWN_OPTIONS - all valid values
│   ├── fields.ts       # Field classification helpers
│   └── formatting.ts   # Column display/ordering rules
├── lib/
│   ├── excel-parser.ts # XLSX parsing + auto-fix engine
│   └── validators.ts   # Validation rules (per field type)
├── hooks/
│   └── useExcelParser.ts # Master state hook - USE THIS, don't duplicate
├── components/excel-parser/
│   ├── LeadDataGrid.tsx    # Virtual table (TanStack + react-virtual)
│   └── ErrorList.tsx       # Filterable error sidebar
└── types/
    ├── excel.types.ts      # LeadDataRow, ParsedExcelFile, AutoFixInfo
    └── validation.types.ts # ValidationError, severity types
```

## Common Tasks

### Adding a New Field
1. Update `src/constants/schema.ts` → add to FIELD_SCHEMA array
2. Add to `LeadDataRow` interface in `src/types/excel.types.ts`
3. If dropdown: add to `DROPDOWN_OPTIONS` in `src/constants/dropdowns.ts`
4. If special validation: add case in `src/lib/validators.ts`

### Adding a New Validation Rule
1. Create validator function in `src/lib/validators.ts` returning `CellValidationResult`
2. Add condition in `validateRow()` function
3. Define error type in `src/types/validation.types.ts` if needed

### Modifying Auto-Fix Logic
Edit `processAutoFixes()` in `src/lib/excel-parser.ts` - runs during initial parse and document changes.

## Tech Stack Specifics
- **Next.js 16**: React 19 + React Compiler enabled (`babel-plugin-react-compiler`)
- **Tailwind v4**: Uses new `@tailwindcss/postcss` plugin, no config file needed
- **TanStack Table v8**: Column definitions, sorting state
- **Zod**: Schema validation (email format validation)
- **XLSX.js**: Excel parsing (SheetJS)
- **TypeScript 5**: Strict mode enabled

## Common Pitfalls
1. ❌ Don't add fields without updating schema.ts FIELD_SCHEMA
2. ❌ Don't mutate data arrays directly - always use spread operators
3. ❌ Don't create new state management - use `useExcelParser` hook
4. ❌ Don't render full dataset - always use virtual scrolling for tables
5. ❌ Don't call validation manually - handled automatically by `handleDataUpdate()`
6. ❌ Don't mix 0-based and 1-based indexing - row numbers are 1-based (+2 for header row), data arrays are 0-based

## Important Constants
- `VALID_COLUMNS`: Whitelist of 41 accepted columns
- `DROPDOWN_OPTIONS`: All dropdown field options (including 600+ industry types)
- `REQUIRED_FIELDS`: ['ID', 'Lead Status', 'Status', 'Lead Stage', 'Territory']
- `EMAIL_PATTERN`, `PHONE_PATTERN`: Regex validation patterns
- `COLUMN_ORDER`: Presentation order (from schema.ts)

## Testing Notes
- Test with 1000+ row files to verify virtual scrolling performance
- Verify auto-fixes appear in green highlight with border
- Check validation errors appear in red highlight
- Ensure export works with errors present (should show warning toast)

## Naming Conventions
- React components: PascalCase (`LeadDataGrid.tsx`)
- Hooks: camelCase with 'use' prefix (`useExcelParser.ts`)
- Constants: SCREAMING_SNAKE_CASE (`REQUIRED_FIELDS`)
- Types/Interfaces: PascalCase (`LeadDataRow`, `ValidationError`)
- Files: kebab-case for lib/utils (`excel-parser.ts`, `auto-fix.ts`)
