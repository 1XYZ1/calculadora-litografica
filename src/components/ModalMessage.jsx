import React from "react";
import BaseModal from "./BaseModal";

export default function ModalMessage({ message, onClose }) {
  if (!message) return null;

  return (
    <BaseModal
      isOpen={!!message}
      onClose={onClose}
      closeOnBackdrop={true}
      closeOnEscape={true}
      size="small"
      className="p-8 text-center"
    >
      <p className="text-xl font-semibold mb-6 text-gray-800">{message}</p>
      <button
        onClick={onClose}
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg"
      >
        Aceptar
      </button>
    </BaseModal>
  );
}
