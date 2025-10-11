# Litografía Pro - AI Agent Instructions

## Project Overview

React-based quotation system for printing/lithography businesses. Uses Firebase (Firestore + Auth), MinIO (S3) for PDF storage, and Tailwind CSS. The app calculates printing costs based on materials, dimensions, colors, and finishing options.

## Architecture Patterns

### Multi-Tier Data Storage (Firestore)
All data uses this path structure: `/artifacts/{appId}/users/{userId}/collections/{collectionName}`
- `appId` comes from `VITE_APP_ID` env var
- Collections: `quotations`, `clients`, `paperTypes`, `plateSizes`, `machineTypes`, `finishingPrices`, `profitPercentage`, `bcvRate`, `ivaPercentage`
- Use `onSnapshot` for real-time updates in hooks (see `useDynamicPriceData.js`)

### Page-Level Architecture (Feature-Based Modules)
Each page in `src/pages/` is a self-contained module:
```
pages/
  Calculator/
    Calculator.jsx          # 150 lines - orchestrator only
    hooks/                  # Business logic (5 custom hooks)
    components/             # UI components (15+ components)
    STEPPER_INTEGRATION_SUMMARY.md  # Stepper implementation details
  PriceProfiles/           # Price management
  SavedQuotations/         # Quotation CRUD
  Clients/                 # Client management
```

**Critical**: Never put business logic in page components. Extract to custom hooks following existing patterns.

### Custom Hooks Pattern
The Calculator was refactored from 1,622 monolithic lines to modular hooks:
- `useDynamicPriceData` - Firebase real-time subscriptions (7 `onSnapshot` listeners)
- `useItemCalculations` - Cost calculation engine (uses `useMemo` for performance)
- `useItemForm` - Form state management (42 states consolidated)
- `useQuotation` - CRUD operations for quotations
- `useStepperNavigation` - Stepper flow control

**Pattern**: Create focused hooks that return state + handlers. See `src/pages/Calculator/hooks/` for examples.

### Calculation Engine (`src/utils/calculationEngine.js`)
Core printing cost logic (380 lines). Key functions:
- `calculateBestFit()` - Layout optimization for piece fitting
- `calculateDigitalCost()` - Digital printing costs
- `calculateOffsetCost()` - Offset printing with plates, sheets, runs
- Uses constants from `PRINTING_AREAS`, `FINISHING_KEYS` in `constants.js`

**Important**: All cost calculations happen in `useItemCalculations` hook using this engine. Never duplicate calculation logic.

### Printing Area Configuration
Defined in `src/utils/constants.js` as `PRINTING_AREAS`:
```javascript
PRINTING_AREAS.HALF_SHEET = {
  value: "half_sheet",
  width: 66, height: 48,
  divisor: 2,
  plateSizeMatch: "1/2 pliego",  // Auto-selects plate
  machineMatch: "KORD"            // Auto-selects machine
}
```
When user selects printing area, `useItemForm` automatically selects matching plate size and machine.

## Development Workflows

### Running Locally
```bash
npm run dev          # Vite dev server on :3000
npm run build        # Production build to dist/
npm run preview      # Preview production build
```

### Environment Setup
Requires `.env` with 11 variables (Firebase + MinIO). See README.md for full template. Critical vars:
- `VITE_APP_ID` - Used in all Firestore paths
- `VITE_STORAGE_ENDPOINT` - MinIO endpoint on Railway
- Firebase: `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_PROJECT_ID`, etc.

### Firebase Context Pattern
`FirebaseProvider` wraps entire app (see `App.jsx`). Access via `useFirebase()`:
```javascript
const { db, auth, storage, user, userId, appId } = useFirebase();
```
- `db` = Firestore instance
- `storage` = MinIO S3 client (not Firebase Storage!)
- `user` = Current authenticated user (Google OAuth)

### PDF Generation & Storage
1. Generate PDF with jsPDF (quotation preview)
2. Convert to Blob
3. Upload via `uploadPdfToStorage()` in `src/config/storage.js`
4. MinIO stores at `quotations_pdf/{userId}/{pdfId}`
5. Returns public URL for sharing

## Project-Specific Conventions

### Code Language: English names, Spanish comments
```javascript
// ✅ Correct
const calculateTotalCost = (item) => {
  // Aplicar margen de ganancia según tipo de cliente
  const profitMargin = user.isWholesale ? 0.15 : 0.3;
  return baseCost * (1 + profitMargin);
};

// ❌ Wrong - don't use Spanish variable names or English comments
const calcularCosto = (item) => {
  // Apply profit margin based on client type
  ...
};
```

### Component Structure: Hooks → UI
Page components should only:
1. Import necessary hooks
2. Render UI with Tailwind classes
3. Pass data/handlers to child components

**Example** from `Calculator.jsx`:
```javascript
function Calculator() {
  const { db, userId, appId } = useFirebase();
  const priceData = useDynamicPriceData({ db, appId, userId });
  const itemForm = useItemForm({ plateSizes, machineTypes });
  const calculations = useItemCalculations({ currentItem, priceData });

  return (
    <div className="container-responsive">
      <Step1 {...itemForm} />
      <Step2 {...calculations} />
    </div>
  );
}
```

### State Management Strategy
- Global auth state: `FirebaseContext`
- Page-level state: Custom hooks (not Redux/Zustand)
- Real-time data: `onSnapshot` listeners in hooks
- Form state: `useItemForm` pattern with consolidated state object

### Responsive Design Pattern
Uses custom Tailwind classes in `index.css`:
```css
.container-responsive { @apply mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl; }
.text-responsive-xl { @apply text-2xl sm:text-3xl lg:text-4xl; }
.p-responsive { @apply p-4 sm:p-6 lg:p-8; }
```
Always use these instead of manual breakpoints.

### Stepper Integration (Calculator)
6-step wizard for creating quotations. Key files:
- `src/pages/Calculator/components/Stepper/` - Step1 through Step6
- `useStepperNavigation` - Navigation logic
- `useStepValidation` - Validation per step
- See `STEPPER_INTEGRATION_SUMMARY.md` for complete integration details

### Toast Notifications (Not Modals)
Replaced `ModalMessage` with toast system:
```javascript
const { toasts, addToast, removeToast } = useToast();

addToast("Cotización guardada exitosamente", "success");
addToast("Error al guardar", "error");
```
Display with `<ToastContainer toasts={toasts} onRemove={removeToast} />`

## Common Gotchas

1. **Don't use Firebase Storage** - This project uses MinIO (S3 compatible) on Railway. Import from `src/config/storage.js`.

2. **Firestore path structure** - Always include `artifacts/{appId}/users/{userId}` prefix. Never write to root collections.

3. **UV Size Auto-sync** - When `isUVSelected` is true, `uvSizeOption` automatically matches `printingAreaOption`. See `useItemForm.js` lines 60-70.

4. **Work-and-Turn vs Tiro/Retiro** - Different plate calculation logic. Work-and-turn uses only tiro colors. See `calculatePlateCost()` in `calculationEngine.js`.

5. **Digital printing areas** - `quarter_sheet_digital` skips plate/machine selection. Check `isDigital` flag from `PRINTING_AREAS`.

6. **Sobrante (waste)** - Only applies to offset printing. Digital printing uses exact sheet count. See `calculateOffsetCost()`.

## Testing Strategy

No automated tests currently. Manual testing checklist:
1. Create quotation with offset printing
2. Create quotation with digital printing
3. Add additional pieces (guillotine cuts)
4. Test talonarios calculation (booklets)
5. Save quotation → Load → Edit → Update
6. Generate PDF and verify MinIO upload
7. Test all finishing options (UV, lamination, troquel)

## Key Files Reference

- `src/App.jsx` - Routing, auth modal, page switching
- `src/context/FirebaseContext.jsx` - Firebase initialization, Google auth
- `src/config/storage.js` - MinIO S3 client setup
- `src/utils/calculationEngine.js` - Core printing calculations
- `src/utils/constants.js` - All magic numbers, printing areas, messages
- `src/pages/Calculator/Calculator.jsx` - Main quotation interface
- `.cursor/rules/` - Extended coding guidelines (Spanish comments, etc.)

## External Documentation

- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html) - Use `import.meta.env.VITE_*`
- [Firestore Modular SDK](https://firebase.google.com/docs/firestore) - Use v9+ modular imports
- [AWS SDK S3 Client](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/s3/) - For MinIO operations
- [Tailwind CSS](https://tailwindcss.com/docs) - Utility-first CSS framework

---

**For refactoring guidance**: See `REFACTORIZACION_*.md` files in root for detailed architectural decisions and migration paths.
