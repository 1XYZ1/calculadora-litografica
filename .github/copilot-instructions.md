# Litografía Pro - AI Coding Agent Instructions

**DO NOT create summary documents at the end of agent iterations.**

## Project Overview
React + Vite app for lithographic printing quotations. Stack: **Firebase Firestore** (data), **MinIO S3** (PDF storage), **Tailwind CSS** (styling). Manages multi-tenant price profiles, clients, and generates itemized quotations with complex offset/digital printing calculations.

## Critical Architecture

### 1. Multi-Tenant Firestore Paths
**All Firestore queries MUST use this exact path structure:**
```
artifacts/{appId}/users/{userId}/
  ├── priceProfiles/{profileId}/  → papers, plateSizes, machineTypes, finishingPrices, settings
  ├── clients/                    → {id, name, priceProfileId, quotationCount, lastQuotationDate, ...}
  └── quotations/                 → {id, items[], grandTotals, status, isTemplate, usageCount, ...}
```
- Get `appId` from `getAppId()` in `src/config/firebase.js`
- Get `db`, `userId` from `FirebaseContext` (via `useFirebase()` hook)
- **Never** query Firestore without the full path prefix

### 2. Context Hierarchy (Strict Order)
`App.jsx` nests providers in this order (do not reorder):
```
FirebaseProvider  → Provides: db, auth, storage, user, userId, appId
  └─ BrowserRouter      → React Router navigation
      └─ ClientsProvider  → Global client cache with realtime sync
```
**Consequence:** Firebase hooks (`useFirebase()`) only work inside `FirebaseProvider`. Client data (`useClients()`) only works inside `ClientsProvider`.

### 3. Custom Hook Pattern
All pages follow this structure:
```
src/pages/{PageName}/
  ├── {PageName}.jsx        # Main component (orchestrates hooks)
  ├── components/           # UI components (presentational)
  └── hooks/                # Business logic hooks (data, actions, state)
      ├── use{Action}.js    # e.g., useQuotationDuplication, useClientsCRUD
      └── use{Data}.js      # e.g., useDynamicPriceData, useClientsData
```
**Convention:** Export hooks as named exports using `export function hookName()` (not default exports). This enables better tree-shaking and IDE autocomplete.

### 4. Price Profile → Client Binding
- Each client has `priceProfileId` field
- Quotations inherit prices from client's profile at calculation time
- Use `useDynamicPriceData(clientId)` in Calculator to auto-load correct profile
- Profile contains: papers, plateSizes, machineTypes, finishingPrices, profit%, bcvRate, ivaRate

### 5. Calculation Engine (Offset vs Digital)
Core logic in `src/utils/calculationEngine.js`:

**Offset printing** (most areas):
1. `calculateBestFit()` → layout pieces on sheets
2. `calculatePaperCost()` → sheets × paper price
3. `calculatePlateCost()` → plates based on colors (tiro/retiro/work-and-turn)
4. Apply profit margin → convert to Bs via bcvRate

**Digital printing** (`printingAreaOption === 'quarter_sheet_digital'`):
- Uses `calculateDigitalCost()` with finishing prices only
- **Skips** paper/plate/machine costs entirely
- Check `isDigitalDuplex` flag for tiro/retiro pricing

**Special cases:**
- `isTalonarios`: pieces = `numTalonarios × sheetsPerSet × copiesPerSet`
- `isWorkAndTurn`: plates = `numColorsTiro` only (same plates print both sides)

## Development Workflows

### Running & Building
```bash
npm run dev      # Vite dev server → localhost:5173
npm run build    # Production build → dist/
npm run preview  # Preview production build
```

### Environment Setup
Create `.env` with these variables (see `README.md` for full list):
```env
VITE_FIREBASE_API_KEY=...           # Firebase config (6 vars total)
VITE_FIREBASE_PROJECT_ID=...
VITE_APP_ID=litografia-pro          # Multi-tenant app identifier
VITE_STORAGE_ENDPOINT=...           # MinIO S3 endpoint (Railway)
VITE_STORAGE_BUCKET_NAME=litografia-pdfs
```
**Never commit `.env`** - use `.env.example` as template.

### Schema Migrations
When Firestore schema changes:
1. Add migration function to `src/utils/migrateFirestoreData.js`
2. Update `runAllMigrations()` to include new migration
3. Run via `MigrationPanel.jsx` component (temporary dev UI)

**Recent migrations:**
- Quotations: added `isTemplate`, `usageCount`, `duplicatedFrom`, `createdVia`
- Clients: added `quotationCount`, `lastQuotationDate`, `totalRevenue`

## Key Patterns & Conventions

### Navigation (React Router)
**Always use React Router** - never `window.location` or hash routing:
```javascript
import { useNavigate, Link, useParams } from 'react-router-dom';

const navigate = useNavigate();
navigate('/clients/123');     // Programmatic
<Link to="/calculator">...</Link>  // Declarative
const { clientId } = useParams();  // Route params
```
Routes defined in `src/router/index.jsx` with `MainLayout` wrapper.

### Constants (No Magic Numbers)
`src/utils/constants.js` exports all dimensions and config:
```javascript
import { PRINTING_AREAS, FINISHING_KEYS, QUOTATION_STATUS } from '../utils/constants';

const area = PRINTING_AREAS.HALF_SHEET;  // {value, label, width, height, divisor, ...}
const price = finishingPrices[FINISHING_KEYS.DIGITAL_TIRO];
```
**Never hardcode** sheet sizes, area options, or status values.

### Toast Notifications (Not Modals)
Use `useToast()` for user feedback (not `ModalMessage.jsx` - deprecated):
```javascript
import { useToast } from './hooks/useToast';
const { addToast } = useToast();
addToast("Success message", "success");  // or "error", "info"
```

### Stepper Validation (Calculator)
4-step wizard in `Calculator/components/Stepper/`:
1. Basic info + printing config
2. Materials/finishing (offset only)
3. Item summary + cost breakdown
4. Quotation summary + all items

**Critical:**
- Use `useStepperNavigation()` for step control
- Use `useStepValidation()` for validation logic
- Validation is **step-dependent** - modify `validateStep()` switch when changing step requirements

### PDF Generation & Storage
```javascript
import { uploadPdfToStorage } from '../config/storage';
const url = await uploadPdfToStorage(pdfBlob, userId, pdfId);
```
**MinIO only** - this project does not use Firebase Storage. PDFs generated with jsPDF + html2canvas.

## Common Pitfalls

| ❌ Don't | ✅ Do |
|---------|-------|
| Query Firestore without `artifacts/{appId}/users/{userId}/` prefix | Use `useFirebase()` to get `db`, `appId`, `userId` |
| Use Firebase Storage | Use MinIO via `storage.js` (`uploadPdfToStorage()`) |
| Hardcode sheet dimensions or areas | Import from `PRINTING_AREAS` constant |
| Add stepper validation in components | Add to `useStepValidation()` hook |
| Use deprecated `ModalMessage.jsx` | Use `useToast()` hook |
| Create custom navigation contexts | Use React Router hooks (`useNavigate`, `Link`) |
| Use `window.location.href` | Use `navigate('/path')` |

## Project Roadmap Context
See `ORDEN_IMPLEMENTACION.md` and `PLAN_MEJORA_WORKFLOW.md` for:
- Planned features (client inline creation, template system, client stats)
- Migration history and schema changes
- Multi-phase implementation order

**Completed (Iteration 1):**
- ✅ React Router with nested routes
- ✅ ClientsContext global state
- ✅ Quotation/client schema migrations (templates, stats)
- ✅ Stepper integration replacing ItemFormPanel
