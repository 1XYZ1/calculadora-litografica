# Litografía Pro - AI Coding Instructions

React + Vite quotation system for lithographic printing. Stack: **Firebase Firestore**, **MinIO S3** (PDFs), **Tailwind CSS**. Multi-tenant price profiles with offset/digital printing calculations.

---

## Critical Architecture Patterns

### 1. Multi-Tenant Firestore Path Structure
**ALL queries MUST use this exact path:**
```
artifacts/{appId}/users/{userId}/
  ├── priceProfiles/{profileId}/
  │   ├── papers/              → {id, name, pricePerSheet, ...}
  │   ├── plateSizes/          → {id, name, price, ...}
  │   ├── machineTypes/        → {id, name, costPerThousand, ...}
  │   ├── finishingPrices/     → {id, digital_quarter_tiro, ...}
  │   └── settings/            → profit, bcvRate, ivaRate
  ├── clients/                 → {id, name, priceProfileId, quotationCount, ...}
  └── quotations/              → {id, items[], status, isTemplate, ...}
```
Get `appId`, `userId`, `db` from `useFirebase()` hook. **Never** query Firestore without full path prefix.

### 2. Provider Hierarchy (DO NOT REORDER)
```jsx
<FirebaseProvider>        // Provides: db, auth, storage, user, userId, appId
  <ClientsProvider>       // Realtime client cache with onSnapshot
    <RouterProvider />    // React Router v6.21+ navigation
  </ClientsProvider>
</FirebaseProvider>
```
**In `src/main.jsx`:** Sequence matters - `useFirebase()` only works inside `FirebaseProvider`, `useClients()` only works inside `ClientsProvider`.

### 3. Page Structure Convention
```
src/pages/{PageName}/
  ├── {PageName}.jsx        # Orchestrates hooks, minimal logic
  ├── components/           # Presentational UI only
  ├── hooks/                # Business logic (data, CRUD, calculations)
  │   ├── use{Data}.js      # Data fetching: useDynamicPriceData
  │   └── use{Action}.js    # Actions: useClientsCRUD
  └── README.md             # (Optional) Page-specific documentation
```
**Export pattern:** `export function hookName()` (named exports only). No default exports for hooks.

### 4. Price Profile Binding
- Client has `priceProfileId` → Profile contains subcollections: `papers/`, `plateSizes/`, `machineTypes/`, `finishingPrices/`, `settings/`
- Use `useDynamicPriceData(clientId)` in Calculator to auto-load profile data via real-time listeners (`onSnapshot`)
- Prices are loaded dynamically when client is selected; quotations store **calculated values**, not references
- Override mechanism: `useDynamicPriceData(clientId, overridePriceProfileId)` for template/duplicate scenarios

### 5. Offset vs Digital Calculation Paths
**`src/utils/calculationEngine.js`:**

**Offset printing** (all areas except `quarter_sheet_digital`):
1. `calculateBestFit()` → layout pieces on sheet (from `src/utils/calculations.js`)
2. `calculatePaperCost()` → sheets × paper price + `sobrantePliegos`
3. `calculatePlateCost()` → colors × plate price (respect `isWorkAndTurn`)
4. `calculateMachineCost()` → runs × machine cost per thousand
5. `calculateFinishingCosts()` → optional finishing operations
6. Apply `profitPercentage` → convert USD to Bs via `bcvRate`

**Digital printing** (`printingAreaOption === 'quarter_sheet_digital'`):
- `calculateDigitalCost()` uses finishing prices only (`FINISHING_KEYS.DIGITAL_TIRO` or `DIGITAL_TIRO_RETIRO`)
- **Skips** paper/plate/machine costs entirely
- Check `isDigitalDuplex` for duplex pricing

**Special cases:**
- `isTalonarios`: pieces = `numTalonarios × sheetsPerSet × copiesPerSet`
- `isWorkAndTurn`: only `numColorsTiro` plates needed (same plates flip sheet for retiro)
- `isTroquel`: uses `TROQUEL_SHEET_WIDTH/HEIGHT` + `TROQUELADO_SEPARATION` for die-cut spacing

---

## Development Commands

```bash
npm run dev      # Vite dev → localhost:4000 (configured in vite.config.js)
npm run build    # Production → dist/
npm run preview  # Test production build locally
```

### Environment Variables
Create `.env` in root (never commit):
```env
# Firebase (6 required vars)
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_APP_ID=litografia-pro        # Multi-tenant app ID

# MinIO S3 (Railway deployment)
VITE_STORAGE_REGION=us-east-1
VITE_STORAGE_ENDPOINT=https://...railway.app
VITE_STORAGE_ACCESS_KEY_ID=...
VITE_STORAGE_SECRET_ACCESS_KEY=...
VITE_STORAGE_BUCKET_NAME=litografia-pdfs
VITE_STORAGE_PUBLIC_URL=https://...railway.app
```

### Schema Migrations
When changing Firestore structure:
1. Add migration function to `src/utils/migrateFirestoreData.js` (e.g., `migrateQuotations()`)
2. Update `runAllMigrations()` to call new function
3. Run via `MigrationPanel.jsx` component (temporary dev UI, shown in Calculator during development)
4. Use `writeBatch()` for bulk updates (max 500 docs per batch)

**Recent migrations:**
- Quotations: added `isTemplate`, `usageCount`, `duplicatedFrom`, `createdVia`
- Clients: added `quotationCount`, `lastQuotationDate`, `totalRevenue`

---

## Key Conventions

### Constants Over Magic Numbers
`src/utils/constants.js` exports ALL dimensions/config:
```javascript
import { PRINTING_AREAS, FINISHING_KEYS, QUOTATION_STATUS } from '../utils/constants';

PRINTING_AREAS.HALF_SHEET  // {value: "half_sheet", label, width: 66, height: 48, divisor: 2, plateSizeMatch: "1/2 pliego", machineMatch: "KORD"}
FINISHING_KEYS.DIGITAL_TIRO  // "digital_quarter_tiro"
QUOTATION_STATUS.APPROVED    // "approved"
```
**Never hardcode** `66`, `48`, `"half_sheet"`, `"approved"` - always import from constants.

### React Router Navigation
**Always use React Router v6** - never `window.location`:
```javascript
import { useNavigate, Link, useParams, useLocation } from 'react-router-dom';

const navigate = useNavigate();
navigate('/clients/123');                      // Programmatic
navigate('/calculator', { state: { clientId } }); // With state
<Link to="/calculator">...</Link>              // Declarative
const { clientId } = useParams();              // URL params
const location = useLocation();                // Access state
const clientId = location.state?.clientId;
```
Routes in `src/router/index.jsx` use `createBrowserRouter` + `MainLayout` with `<Outlet />`.

### Toast Notifications (Not Modals)
```javascript
import { useToast } from './hooks/useToast';  // Calculator/hooks only
const { toasts, showToast, removeToast } = useToast();
showToast("Success message", "success");  // "error" | "info" | "success"
```
Render: `<ToastContainer toasts={toasts} onRemove={removeToast} />`

**Deprecated:** `ModalMessage.jsx` (legacy modal component - don't use for new features).

### Stepper Validation (Calculator)
4-step wizard (`Calculator/components/Stepper/`):
1. **Step1Complete**: Basic info + printing config (name, dimensions, colors, printing area)
2. **Step2MaterialsFinishing**: Materials/finishing (paper, plates, machine - **skipped for digital**)
3. **Step3ItemSummary**: Item review + cost breakdown (read-only preview)
4. **Step4QuotationSummary**: All items + save quotation

**Critical validation flow:**
- `useStepperNavigation()` manages `currentStep`, `nextStep()`, `prevStep()`
- `useStepValidation()` has `validateStep(stepNum, currentItem, items)` switch statement
- When changing step requirements → update specific case in `useStepValidation.js`
- Digital printing **skips** Step 2 (no materials needed)

### PDF Generation & Storage
```javascript
import { uploadPdfToStorage } from '../config/storage';
const url = await uploadPdfToStorage(pdfBlob, userId, pdfId);
```
**MinIO S3 only** - Firebase Storage is NOT used. S3 client configured in `src/config/storage.js` using `@aws-sdk/client-s3` with `forcePathStyle: true` for MinIO compatibility.

### Real-time Data with onSnapshot
`ClientsContext` and `useDynamicPriceData` use Firestore real-time listeners:
```javascript
const unsubscribe = onSnapshot(collection(db, path), (snapshot) => {
  const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  setData(data);
});
return () => unsubscribe(); // Always cleanup in useEffect
```

---

## Common Pitfalls

| ❌ Don't | ✅ Do |
|---------|-------|
| Query without `artifacts/{appId}/users/{userId}/` prefix | Use `useFirebase()` → `{db, appId, userId}` in all collection refs |
| Use Firebase Storage APIs | Use MinIO via `uploadPdfToStorage()` in `config/storage.js` |
| Hardcode `66`, `48`, `"half_sheet"`, `"approved"` | Import `PRINTING_AREAS.HALF_SHEET`, `QUOTATION_STATUS.APPROVED` from constants |
| Add validation logic in Step components | Update `validateStep()` switch in `useStepValidation.js` |
| Use `ModalMessage.jsx` for user feedback | Use `useToast()` hook (Calculator) or `ToastContainer` pattern |
| Navigate with `window.location.href = '/path'` | Use `navigate('/path')` from `useNavigate()` |
| Default export hooks: `export default useMyHook` | Named exports: `export function useMyHook()` |
| Forget to cleanup `onSnapshot` listeners | Always `return () => unsubscribe()` in useEffect |
| Mutate state directly: `items.push(newItem)` | Immutable updates: `setItems([...items, newItem])` |

---

## Project Context & Roadmap

See `ORDEN_IMPLEMENTACION.md` and `PLAN_MEJORA_WORKFLOW.md` for feature roadmap and implementation phases.

**Current Status (Iteration 1 Complete):**
- ✅ React Router + nested routes with `MainLayout`
- ✅ `ClientsContext` global state with real-time sync
- ✅ Schema migrations (templates, client stats)
- ✅ 4-step Stepper wizard in Calculator
- ✅ `ClientDetail` page with tabs (info, quotations, price profile, history)

**Key Pages:**
- `/calculator` - Multi-step quotation creation wizard
- `/clients` - Client list + CRUD operations
- `/clients/:clientId` - Unified client detail view with tabs
- `/price-profiles` - Manage price profiles (papers, plates, machines, finishing)
- `/quotations` - Saved quotations repository

**Known Issues:**
- `ModalMessage.jsx` is deprecated but still used in some legacy code paths
- Migration panel (`MigrationPanel.jsx`) should be hidden in production
- Some validation messages are hardcoded (should use constants)
