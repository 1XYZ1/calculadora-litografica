# Litografía Pro - AI Coding Agent Instructions

NO HAGAS DOCUMENTOS DE RESUMEN AL FINALIZAR LA ITERACION DE MODO AGENTE

## Project Overview
React + Vite application for lithographic printing quotations. Uses **Firebase Firestore** for data persistence, **MinIO (S3-compatible)** for PDF storage, and **Tailwind CSS** for styling. The app manages price profiles, clients, and generates itemized quotations with complex printing calculations.

## Critical Architecture Patterns

### Multi-Tenant Firestore Structure
Data is scoped by user with a specific hierarchy:
```
artifacts/{appId}/users/{userId}/
  ├── priceProfiles/{profileId}/
  │   ├── papers/
  │   ├── plateSizes/
  │   ├── machineTypes/
  │   ├── finishingPrices/
  │   └── settings/{profit, bcvRate, ivaRate}
  ├── clients/
  └── quotations/
```

**Always use this path pattern** when working with Firestore. See `src/config/firebase.js` for `appId` retrieval and `FirebaseContext.jsx` for the context provider that exposes `db`, `appId`, `userId`.

### Context Hierarchy (Nested Providers)
In `App.jsx`, contexts are nested in this specific order:
1. `FirebaseProvider` (outermost - provides auth, db, storage)
2. `BrowserRouter` (React Router for navigation)
3. `ClientsProvider` (global client data cache)

**Navigation**: Use React Router hooks (`useNavigate`, `useLocation`, `useParams`) and components (`<Link>`, `<Navigate>`) for all navigation needs.

**Never** call Firebase hooks outside the FirebaseProvider tree.

### Price Profiles & Client Association
- Each **client** has a `priceProfileId` that determines which prices are used for their quotations
- When calculating quotations, use `useDynamicPriceData(clientId)` to automatically load the correct price profile
- Price profiles contain: papers, plateSizes, machineTypes, finishingPrices, profit%, BCV rate, IVA%

### Calculation Engine Flow
The core calculation lives in `src/utils/calculationEngine.js`:
1. `calculateBestFit()` - Determines optimal piece layout on sheets
2. `calculatePaperCost()` - Sheet count × paper price
3. `calculatePlateCost()` - Plates needed based on colors (tiro/retiro/work-and-turn)
4. `calculateDigitalCost()` - Digital printing uses finishing prices, not paper/plates
5. Apply profit margin and convert to Bs using BCV rate

**Digital vs Offset:** Check `printingAreaOption === 'quarter_sheet_digital'` to determine flow. Digital bypasses paper/plate/machine costs entirely.

## Key Conventions

### Component Organization
- **Pages** (`src/pages/`): Top-level routes with their own component/hooks subdirectories
- **Router** (`src/router/`): React Router configuration and route definitions
- **Layouts** (`src/layouts/`): Layout components (e.g., MainLayout with navigation)
- **Shared components** (`src/components/`): Modals, Header, Toast system
- **Hooks pattern**: Custom hooks are co-located with pages (e.g., `Calculator/hooks/useQuotation.js`)

### Stepper Pattern (Calculator Page)
Calculator uses a 4-step wizard (`src/pages/Calculator/components/Stepper/`):
1. `Step1Complete.jsx` - Basic info + printing config
2. `Step2MaterialsFinishing.jsx` - Paper/plates (offset only) + finishing options
3. `Step3ItemSummary.jsx` - Review single item with inline cost breakdown
4. `Step4QuotationSummary.jsx` - All items + grand total

Navigation is handled by `useStepperNavigation` and `useStepValidation` hooks. **Do not** modify step order without updating validation dependencies.

### Constants Usage
`src/utils/constants.js` exports all sheet dimensions, printing areas, and finishing keys:
- Use `PRINTING_AREAS` object for area configs (contains width, height, divisor, machineMatch, plateSizeMatch)
- Use `FINISHING_KEYS` for consistent finishing price lookups
- Use `QUOTATION_STATUS` for status field values

### Toast System (Not Modal)
This project uses a **Toast notification system** (`ToastContainer.jsx`), not traditional modals for feedback messages. Use `useToast()` hook in Calculator:
```javascript
const { addToast } = useToast();
addToast("Mensaje", "success"); // or "error", "info"
```

## Development Workflows

### Running the App
```bash
npm run dev      # Start Vite dev server (localhost:5173)
npm run build    # Production build
npm run preview  # Preview production build
```

### Environment Variables
Required in `.env` (never commit):
- Firebase: `VITE_FIREBASE_*` (6 variables)
- MinIO: `VITE_STORAGE_*` (endpoint, credentials, bucket)
- App: `VITE_APP_ID`

See `README.md` for complete list and setup instructions.

### Data Migration
When schema changes occur, use migration utilities in `src/utils/migrateFirestoreData.js`:
- `runAllMigrations()` - Run all pending migrations
- `checkMigrationStatus()` - Verify migration state
- Add new migration functions for schema evolution

The `MigrationPanel.jsx` component provides a UI for running migrations (temporary dev tool).

## Special Considerations

### Talonarios (Carbonless Forms)
When `isTalonarios` is true, pieces are calculated as:
```javascript
totalPieces = numTalonarios × sheetsPerSet × copiesPerSet
```
This affects layout calculations and must be reflected in quotation display.

### Work-and-Turn Printing
When `isWorkAndTurn` is true:
- Only `numColorsTiro` is used (same plates print both sides)
- Plate count = `numColorsTiro` (not tiro + retiro)
- This is **only** for offset printing

### PDF Generation & Storage
PDFs are generated client-side (jsPDF + html2canvas), then uploaded to MinIO using S3 SDK:
```javascript
import { uploadPdfToStorage } from '../config/storage';
const url = await uploadPdfToStorage(pdfBlob, userId, pdfId);
```
**Do not** use Firebase Storage - this project uses MinIO exclusively.

### Navigation & Routing
This project uses **React Router** for all navigation:
```javascript
import { useNavigate, useLocation, useParams, Link } from 'react-router-dom';

// Programmatic navigation
const navigate = useNavigate();
navigate('/clients/123');
navigate(-1); // Go back

// Declarative navigation
<Link to="/calculator/new">Nueva Cotización</Link>

// Route parameters
const { clientId } = useParams();

// Current location
const location = useLocation();
```
All routes are defined in `src/router/index.jsx`. Use `MainLayout` for pages that need the shared navigation/header.

## Common Pitfalls
- ❌ Don't query Firestore without the full `artifacts/{appId}/users/{userId}/` path
- ❌ Don't mix Firebase Storage with MinIO - only use MinIO via `storage.js`
- ❌ Don't hardcode sheet dimensions - use `PRINTING_AREAS` constants
- ❌ Don't create validation logic outside `useStepValidation` hook for stepper steps
- ❌ Don't use `ModalMessage.jsx` - it's deprecated, use `useToast()` instead
- ❌ Don't create custom navigation contexts - use React Router hooks (`useNavigate`, `useLocation`, `useParams`)
- ❌ Don't use `window.location` or hash routing - use React Router's declarative navigation

## Recent Refactorings
Per `RESUMEN_ITERACION_1.md`, the following were completed:
- ✅ React Router configuration with nested routes
- ✅ ClientsContext for global client state
- ✅ Schema migration for quotations (isTemplate, usageCount fields) and clients (stats fields)
- ✅ Stepper integration replacing old ItemFormPanel

When working with clients or quotations, expect these new fields in the schema. All navigation must use React Router APIs (`useNavigate`, `Link`, etc.).
