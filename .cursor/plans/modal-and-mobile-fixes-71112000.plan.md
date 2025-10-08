<!-- 71112000-1526-44ec-9b0c-58ae9be562c5 bc46d81c-c740-4f19-a44f-28498db54432 -->
# Plan: Arreglo de Modales y Diseño Responsive

## 1. Crear componente base de Modal reutilizable

**Objetivo:** Crear un componente `BaseModal` que maneje automáticamente:

- Bloqueo de scroll vertical cuando está abierto
- Cierre al hacer click en el backdrop (opcional via prop)
- Animaciones de entrada/salida
- Accesibilidad (ESC para cerrar)

**Archivo:** `src/components/BaseModal.jsx` (nuevo)

**Características:**

- Prop `closeOnBackdrop` (default: true)
- Prop `preventBodyScroll` (default: true)
- Usar `useEffect` para agregar/quitar clase de overflow al body
- Event listener para tecla ESC
- Backdrop con click handler condicional

## 2. Migrar todos los modales al componente base

**Modales a actualizar:**

### 2.1 AuthModal

- Archivo: `src/components/AuthModal.jsx`
- Cambio: Usar BaseModal wrapper
- `closeOnBackdrop`: true (puede cerrarse al hacer click fuera)

### 2.2 ModalMessage

- Archivo: `src/components/ModalMessage.jsx`
- Cambio: Usar BaseModal wrapper
- `closeOnBackdrop`: true

### 2.3 CostBreakdownModal

- Archivo: `src/components/CostBreakdownModal.jsx`
- Cambio: Usar BaseModal wrapper
- `closeOnBackdrop`: true

### 2.4 QuotationPreviewModal

- Archivo: `src/components/QuotationPreviewModal.jsx`
- Cambio: Usar BaseModal wrapper
- `closeOnBackdrop`: true

### 2.5 ConfirmationModal

- Archivo: `src/components/ConfirmationModal.jsx`
- Cambio: Usar BaseModal wrapper
- `closeOnBackdrop`: false (NO debe cerrarse accidentalmente)

### 2.6 ClientFormModal

- Archivo: `src/pages/Clients/components/ClientFormModal.jsx`
- Cambio: Usar BaseModal wrapper
- `closeOnBackdrop`: true

### 2.7 ProfileFormModal

- Archivo: `src/pages/PriceProfiles/components/ProfileFormModal.jsx`
- Cambio: Usar BaseModal wrapper
- `closeOnBackdrop`: true

## 3. Implementar menú hamburguesa en Header

**Archivo:** `src/components/Header.jsx`

**Cambios:**

- Estado `mobileMenuOpen` para controlar visibilidad del menú
- En pantallas < 1024px: mostrar botón hamburguesa
- Menu desplegable que aparece desde arriba/izquierda con overlay
- Mantener info de usuario visible en móviles
- Animación suave al abrir/cerrar

**Breakpoints:**

- `lg:` (1024px+): Menú horizontal tradicional
- `< lg`: Botón hamburguesa + menú desplegable

## 4. Mejorar diseño responsive de ProfileSelector

**Archivo:** `src/pages/PriceProfiles/components/ProfileSelector.jsx`

**Problemas actuales:**

- Botones "Nuevo", "Duplicar", "Cambiar nombre", "Eliminar" ocupan mucho espacio horizontal
- En móviles, el `flex-wrap` hace que se apilen mal

**Solución:**

- En móviles: Botones más compactos, solo íconos sin texto largo
- Usar grid layout para mejor distribución
- Texto más corto: "Nuevo", "Duplicar", "Editar", "Borrar"
- Responsive: 
  - Móvil: grid de 2 columnas, botones full-width
  - Tablet: grid de 4 columnas
  - Desktop: flex horizontal

## 5. Mejorar responsive de secciones de configuración

**Archivos afectados:**

- `src/pages/PriceProfiles/components/PapersSection.jsx`
- `src/pages/PriceProfiles/components/PlatesSection.jsx`
- `src/pages/PriceProfiles/components/MachinesSection.jsx`
- `src/pages/PriceProfiles/components/FinishingSection.jsx`
- Otros componentes de sección

**Mejoras:**

- Grid columns responsive: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`
- Botones de acción más compactos en móviles
- Inputs con mejor padding y tamaños en móviles
- Spacing reducido en pantallas pequeñas

## 6. Mejorar responsive de Calculator

**Archivo:** `src/pages/Calculator/Calculator.jsx`

**Áreas a mejorar:**

- Stepper header: compacto en móviles
- Botones de navegación: stack vertical en móviles
- Formulario de items: mejor distribución de campos
- Preview de costos: más compacto

## 7. Mejorar responsive de Clients

**Archivo:** `src/pages/Clients/components/ClientsList.jsx`

**Mejoras:**

- Cards de clientes: full-width en móviles
- Botones de acción: más compactos
- Grid responsive adecuado

## 8. Mejorar responsive de SavedQuotations

**Archivos:**

- `src/pages/SavedQuotations/components/QuotationCard.jsx`
- `src/pages/SavedQuotations/components/SavedQuotationsHeader.jsx`

**Mejoras:**

- Cards: mejor layout en móviles
- Filtros: stack vertical en móviles
- Botones: más compactos

## 9. Agregar estilos globales para body scroll lock

**Archivo:** `src/index.css`

**Agregar:**

```css
/* Clase para bloquear scroll cuando modal está abierto */
body.modal-open {
  overflow: hidden;
  padding-right: var(--scrollbar-width, 0px);
}
```

## 10. Optimizaciones adicionales

### Containers principales

- Usar `max-w-7xl` solo en desktop, full-width con padding en móviles
- Padding responsivo: `p-4 md:p-6 lg:p-8`

### Botones globales

- Altura mínima adecuada para touch: `min-h-[44px]`
- Padding responsive
- Texto que se adapta: `text-sm sm:text-base`

### Typography

- Títulos responsive: `text-2xl sm:text-3xl lg:text-4xl`
- Texto body: `text-sm sm:text-base`

## Orden de Implementación

1. Crear BaseModal (punto 1)
2. Agregar estilos CSS (punto 9)
3. Migrar modales al BaseModal (punto 2)
4. Header con menú hamburguesa (punto 3)
5. ProfileSelector responsive (punto 4)
6. Secciones de configuración (punto 5)
7. Calculator responsive (punto 6)
8. Clients responsive (punto 7)
9. SavedQuotations responsive (punto 8)
10. Optimizaciones finales (punto 10)

## Testing

Probar en cada paso:

- Móvil (< 640px)
- Tablet (640px - 1024px)
- Desktop (> 1024px)
- Scroll bloqueado en modales
- Cierre de modales al hacer click fuera
- Menú hamburguesa funcionando

### To-dos

- [ ] Crear componente BaseModal reutilizable con bloqueo de scroll y cierre por backdrop
- [ ] Agregar estilos CSS globales para modal-open en index.css
- [ ] Migrar todos los 7 modales para usar BaseModal (Auth, Message, Cost, Preview, Confirmation, ClientForm, ProfileForm)
- [ ] Implementar menú hamburguesa en Header para móviles
- [ ] Mejorar diseño responsive de ProfileSelector con botones compactos
- [ ] Mejorar responsive de todas las secciones de configuración de precios
- [ ] Mejorar diseño responsive del Calculator
- [ ] Mejorar diseño responsive de la página de Clientes
- [ ] Mejorar diseño responsive de SavedQuotations
- [ ] Aplicar optimizaciones finales de containers, botones y typography