# Litografía Pro - AI Coding Instructions

React + Vite quotation system for lithographic printing. Stack: **Firebase Firestore**, **MinIO S3** (PDFs), **Tailwind CSS**. Multi-tenant price profiles with offset/digital printing calculations.

---

## Critical Architecture Patterns

### 1. Multi-Tenant Firestore Path Structure
**ALL queries MUST use this exact path:**
```
artifacts/{appId}/users/{userId}/
  ├── priceProfiles/{profileId}/  → papers, plateSizes, machineTypes, finishingPrices, settings
  ├── clients/                    → {id, name, priceProfileId, quotationCount, ...}
  └── quotations/                 → {id, items[], status, isTemplate, ...}
```
Get `appId`, `userId`, `db` from `useFirebase()` hook. **Never** query Firestore without full path prefix.

### 2. Provider Hierarchy (DO NOT REORDER)
```jsx
<FirebaseProvider>        // Provides: db, auth, storage, user, userId, appId
  <ClientsProvider>       // Realtime client cache with onSnapshot
    <RouterProvider />    // React Router v6 navigation
  </ClientsProvider>
</FirebaseProvider>
```
Consequence: `useFirebase()` only works inside `FirebaseProvider`. `useClients()` only works inside `ClientsProvider`.

### 3. Page Structure Convention
```
src/pages/{PageName}/
  ├── {PageName}.jsx        # Orchestrates hooks, minimal logic
  ├── components/           # Presentational UI only
  └── hooks/                # Business logic (data, CRUD, calculations)
      ├── use{Data}.js      # Data fetching: useDynamicPriceData
      └── use{Action}.js    # Actions: useClientsCRUD
```
**Export pattern:** `export function hookName()` (named exports only). No default exports for hooks.

### 4. Price Profile Binding
- Client has `priceProfileId` → Profile has `papers`, `plateSizes`, `machineTypes`, `finishingPrices`, `settings`
- Use `useDynamicPriceData(clientId)` in Calculator to auto-load profile
- Quotations inherit prices at calculation time (not stored directly)

### 5. Offset vs Digital Calculation Paths
**`src/utils/calculationEngine.js`:**

**Offset** (all areas except `quarter_sheet_digital`):
1. `calculateBestFit()` → layout pieces on sheet
2. `calculatePaperCost()` → sheets × paper price
3. `calculatePlateCost()` → colors × plate price (respect `isWorkAndTurn`)
4. Apply `profitPercentage` → convert USD to Bs via `bcvRate`

**Digital** (`printingAreaOption === 'quarter_sheet_digital'`):
- `calculateDigitalCost()` uses finishing prices only
- **Skips** paper/plate/machine costs entirely
- Check `isDigitalDuplex` for duplex pricing

**Special cases:**
- `isTalonarios`: pieces = `numTalonarios × sheetsPerSet × copiesPerSet`
- `isWorkAndTurn`: only `numColorsTiro` plates needed (same plates both sides)

---

## Development Commands

```bash
npm run dev      # Vite dev → localhost:5173 (default port 3000 is wrong)
npm run build    # Production → dist/
npm run preview  # Test production build locally
```

### Environment Variables
Create `.env` (never commit):
```env
# Firebase (6 vars)
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_PROJECT_ID=...
VITE_APP_ID=litografia-pro        # Multi-tenant app ID

# MinIO S3 (Railway deployment)
VITE_STORAGE_ENDPOINT=https://...railway.app
VITE_STORAGE_ACCESS_KEY_ID=...
VITE_STORAGE_SECRET_ACCESS_KEY=...
VITE_STORAGE_BUCKET_NAME=litografia-pdfs
VITE_STORAGE_PUBLIC_URL=https://...railway.app
```

### Schema Migrations
When changing Firestore structure:
1. Add function to `src/utils/migrateFirestoreData.js` (e.g., `migrateQuotations()`)
2. Update `runAllMigrations()` to call new function
3. Run via `MigrationPanel.jsx` (temporary dev UI in Calculator)

**Recent migrations:**
- Quotations: `isTemplate`, `usageCount`, `duplicatedFrom`, `createdVia`
- Clients: `quotationCount`, `lastQuotationDate`, `totalRevenue`

---

## Key Conventions

### Constants Over Magic Numbers
`src/utils/constants.js` exports ALL dimensions/config:
```javascript
import { PRINTING_AREAS, FINISHING_KEYS, QUOTATION_STATUS } from '../utils/constants';

PRINTING_AREAS.HALF_SHEET  // {value, label, width: 66, height: 48, divisor: 2, ...}
FINISHING_KEYS.DIGITAL_TIRO  // "digital_quarter_tiro"
```
**Never hardcode** sheet sizes, area values, or status strings.

### React Router Navigation
**Always use React Router** - never `window.location`:
```javascript
import { useNavigate, Link, useParams } from 'react-router-dom';

navigate('/clients/123');           // Programmatic
<Link to="/calculator">...</Link>   // Declarative
const { clientId } = useParams();   // URL params
```
Routes in `src/router/index.jsx` use `createBrowserRouter` + `MainLayout`.

### Toast Notifications (Not Modals)
```javascript
import { useToast } from './hooks/useToast';  // Calculator/hooks only
const { addToast } = useToast();
addToast("Success message", "success");  // "error" | "info" | "success"
```
**Deprecated:** `ModalMessage.jsx` (legacy modal component).

### Stepper Validation (Calculator)
4-step wizard (`Calculator/components/Stepper/`):
1. Basic info + printing config
2. Materials/finishing (offset only)
3. Item summary + cost breakdown
4. Quotation summary + all items

**Critical:**
- `useStepperNavigation()` manages current step, next/prev logic
- `useStepValidation()` has `validateStep(stepNum, currentItem, items)` switch statement
- When changing step requirements → update `validateStep()` case in `useStepValidation.js`

### PDF Generation & Storage
```javascript
import { uploadPdfToStorage } from '../config/storage';
const url = await uploadPdfToStorage(pdfBlob, userId, pdfId);
```
**MinIO S3 only** - Firebase Storage is NOT used. PDFs via jsPDF + html2canvas.

---

## Common Pitfalls

| ❌ Don't | ✅ Do |
|---------|-------|
| Query without `artifacts/{appId}/users/{userId}/` | Use `useFirebase()` → `{db, appId, userId}` |
| Use Firebase Storage APIs | Use MinIO via `uploadPdfToStorage()` in `config/storage.js` |
| Hardcode `66`, `48`, `"half_sheet"` | Import `PRINTING_AREAS.HALF_SHEET` from constants |
| Add validation in step components | Update `validateStep()` switch in `useStepValidation.js` |
| Use `ModalMessage.jsx` for feedback | Use `useToast()` hook |
| Navigate with `window.location.href` | Use `useNavigate()` from React Router |
| Default export hooks | Named exports: `export function useMyHook()` |

---

## Roadmap Context
See `ORDEN_IMPLEMENTACION.md` and `PLAN_MEJORA_WORKFLOW.md` for feature roadmap and implementation phases.

**Iteration 1 Complete:**
✅ React Router + nested routes
✅ ClientsContext global state
✅ Schema migrations (templates, stats)
✅ Stepper wizard integration
