import React from "react";

/**
 * Componente para mostrar mensajes de validación inline
 * Se muestra debajo de los campos del formulario con errores
 */
export default function ValidationMessage({
  message,
  type = "error",
  show = true,
}) {
  if (!show || !message) return null;

  // Estilos según el tipo de mensaje
  const getStyles = () => {
    switch (type) {
      case "error":
        return {
          container: "bg-red-50 border-red-200 text-red-700",
          icon: "text-red-500",
          iconPath: "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
        };
      case "warning":
        return {
          container: "bg-yellow-50 border-yellow-200 text-yellow-700",
          icon: "text-yellow-500",
          iconPath:
            "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
        };
      case "info":
        return {
          container: "bg-blue-50 border-blue-200 text-blue-700",
          icon: "text-blue-500",
          iconPath: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
        };
      case "success":
        return {
          container: "bg-green-50 border-green-200 text-green-700",
          icon: "text-green-500",
          iconPath: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
        };
      default:
        return {
          container: "bg-gray-50 border-gray-200 text-gray-700",
          icon: "text-gray-500",
          iconPath: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
        };
    }
  };

  const styles = getStyles();

  return (
    <div
      className={`
        flex items-start gap-2 p-3 mt-2 rounded-lg border
        ${styles.container}
        animate-in fade-in slide-in-from-top-1 duration-200
      `}
      role="alert"
    >
      {/* Icono */}
      <svg
        className={`w-5 h-5 flex-shrink-0 mt-0.5 ${styles.icon}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d={styles.iconPath}
        />
      </svg>

      {/* Mensaje */}
      <p className="text-sm font-medium flex-1">{message}</p>
    </div>
  );
}

/**
 * Componente para mostrar un campo con validación integrada
 * Muestra el label, input y mensaje de error automáticamente
 */
export function ValidatedInput({
  label,
  error,
  type = "text",
  value,
  onChange,
  onBlur,
  placeholder,
  required = false,
  disabled = false,
  min,
  max,
  step,
  className = "",
  inputClassName = "",
  ...props
}) {
  const hasError = !!error;

  return (
    <div className={`flex flex-col ${className}`}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Input */}
      <input
        type={type}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        disabled={disabled}
        min={min}
        max={max}
        step={step}
        className={`
          w-full px-4 py-2 rounded-lg border transition-all duration-200
          ${
            hasError
              ? "border-red-300 focus:border-red-500 focus:ring-red-500 bg-red-50"
              : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          }
          ${disabled ? "bg-gray-100 cursor-not-allowed" : "bg-white"}
          focus:outline-none focus:ring-2
          ${inputClassName}
        `}
        aria-invalid={hasError}
        aria-describedby={hasError ? `${props.id}-error` : undefined}
        {...props}
      />

      {/* Mensaje de error */}
      {hasError && (
        <ValidationMessage message={error} type="error" show={true} />
      )}
    </div>
  );
}

/**
 * Componente para mostrar múltiples errores de validación
 */
export function ValidationSummary({
  errors = {},
  title = "Se encontraron los siguientes errores:",
}) {
  const errorList = Object.entries(errors).map(([field, message]) => ({
    field,
    message,
  }));

  if (errorList.length === 0) return null;

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
      <div className="flex items-start gap-3">
        <svg
          className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>

        <div className="flex-1">
          <h3 className="text-sm font-semibold text-red-800 mb-2">{title}</h3>
          <ul className="space-y-1">
            {errorList.map(({ field, message }) => (
              <li
                key={field}
                className="text-sm text-red-700 flex items-start gap-2"
              >
                <span className="text-red-500 mt-1">•</span>
                <span>{message}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
