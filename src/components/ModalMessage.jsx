import React from "react";

export default function ModalMessage({ message, onClose }) {
  if (!message) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-8 rounded-xl shadow-2xl max-w-sm w-full text-center transform scale-95 animate-fade-in">
        <p className="text-xl font-semibold mb-6 text-gray-800">{message}</p>
        <button
          onClick={onClose}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg"
        >
          Aceptar
        </button>
      </div>
    </div>
  );
}
