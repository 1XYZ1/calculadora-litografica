import React, { useState } from "react";
import { useFirebase } from "../context/FirebaseContext";
import { uploadPdfToStorage } from "../config/storage";
import BaseModal from "./BaseModal";

export default function QuotationPreviewModal({
  quotationData,
  onClose,
  paperTypes,
}) {
  const { storage, userId } = useFirebase();
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfMessage, setPdfMessage] = useState("");

  if (
    !quotationData ||
    !quotationData.items ||
    quotationData.items.length === 0
  )
    return null;

  const {
    clientName,
    date,
    items,
    totalGeneral,
    totalCostInBs,
    bcvRate,
    quotationName: mainQuotationName,
  } = quotationData;

  const handlePrint = () => {
    const printContent = document.getElementById(
      "quotation-print-area"
    ).innerHTML;
    const printWindow = window.open("", "_blank");
    const styleTags = document.querySelectorAll(
      'head style, head link[rel="stylesheet"]'
    );
    let stylesHtml = "";
    styleTags.forEach((tag) => {
      stylesHtml += tag.outerHTML;
    });

    printWindow.document.write(`
            <!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Presupuesto</title>${stylesHtml}
                <style> @media print { .no-print { display: none !important; } body { margin: 0; } #quotation-print-area { width: 100%; max-width: none; padding: 0; border: none; box-shadow: none; } table, th, td { border: 1px solid #ccc !important; } table { table-layout: fixed; width: 100%; } td, th { word-wrap: break-word; white-space: normal; } } </style>
            </head><body>${printContent}</body></html>`);

    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    };
  };

  const handleSharePdfViaWhatsApp = async () => {
    if (!window.jspdf || !window.html2canvas) {
      setPdfMessage(
        "Error: Librerías PDF no encontradas. Asegúrese de que estén en index.html."
      );
      return;
    }
    setIsGeneratingPdf(true);
    setPdfMessage("Generando PDF...");
    let hasError = false;

    try {
      const { jsPDF } = window.jspdf;
      const input = document.getElementById("quotation-print-area");
      const canvas = await window.html2canvas(input, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
      });
      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

      setPdfMessage("Subiendo PDF a MinIO...");
      const pdfBlob = pdf.output("blob");
      const pdfId = `presupuesto-${Date.now()}.pdf`;

      // Subir a MinIO en lugar de Firebase Storage
      const downloadURL = await uploadPdfToStorage(pdfBlob, userId, pdfId);

      const whatsappText = encodeURIComponent(
        `¡Hola! Aquí está tu presupuesto de ${mainQuotationName}:\n\n` +
          `Cliente: ${clientName || "Cliente"}\n` +
          `Total: $${totalGeneral.toFixed(2)}\n\n` +
          `Puedes ver y descargar el presupuesto completo en el siguiente enlace:\n` +
          `${downloadURL}\n\n` +
          `¡Gracias por tu confianza!\n- Litografía Pro`
      );

      hasError = false;
      setPdfMessage("¡Listo! Abriendo WhatsApp...");
      window.open(`https://wa.me/?text=${whatsappText}`, "_blank");
    } catch (error) {
      hasError = true;
      console.error("Error completo al generar/compartir PDF:", error);
      let errorMessage = "Ocurrió un error inesperado.";

      // Manejo de errores actualizado para MinIO
      if (error.message && error.message.includes("MinIO")) {
        errorMessage = `Error de almacenamiento: ${error.message}`;
      } else if (
        error.name === "SecurityError" ||
        (error.message && error.message.includes("CORS"))
      ) {
        errorMessage =
          "Error de seguridad (CORS) al generar la imagen. Intenta de nuevo.";
      } else if (error.$metadata) {
        // Error de AWS SDK/S3
        errorMessage = `Error al subir a MinIO: ${
          error.message || "Error desconocido"
        }`;
      } else {
        errorMessage = `Error al generar PDF: ${error.message}`;
      }
      setPdfMessage(errorMessage);
    } finally {
      setTimeout(
        () => {
          setIsGeneratingPdf(false);
          setPdfMessage("");
        },
        hasError ? 8000 : 3000
      );
    }
  };

  const handleShareTextWhatsApp = () => {
    const itemsText = items
      .map((item) => {
        const pieceSize = `${item.pieceWidthCm}cm x ${item.pieceHeightCm}cm`;
        const description = item.isDigital
          ? "Impresión Digital"
          : `impreso en ${
              paperTypes.find((p) => p.id === item.selectedPaperTypeId)?.name ||
              "N/A"
            }, a ${item.colorsDescription}`;
        return `- ${item.quotationName} (${item.totalPieces} piezas de ${pieceSize}), ${description}`;
      })
      .join("\n");

    const whatsappText = encodeURIComponent(
      `¡Hola! Aquí está tu presupuesto de impresión de Litografía Pro:\n\n` +
        `Cliente: ${clientName || "Cliente"}\n` +
        `Concepto: ${mainQuotationName}\n\n` +
        `Items:\n${itemsText}\n\n` +
        `Precio Total: $${totalGeneral.toFixed(2)}\n` +
        `En Bs.: Bs. ${totalCostInBs.toFixed(2)} (Tasa BCV: ${bcvRate.toFixed(
          2
        )} Bs./$)\n\n` +
        `¡Gracias por tu confianza!\n\n` +
        `Para ver el presupuesto detallado, por favor solicita el PDF.`
    );
    window.open(`https://wa.me/?text=${whatsappText}`, "_blank");
  };

  return (
    <BaseModal
      isOpen={true}
      onClose={onClose}
      closeOnBackdrop={true}
      closeOnEscape={true}
      size="large"
      className="p-8"
    >
      <div
        id="quotation-print-area"
        className="border border-gray-300 p-6 rounded-lg bg-white"
      >
        <div className="flex justify-between items-start mb-6">
          <div className="flex flex-col items-center">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 font-bold text-lg mb-2">
              LOGO
            </div>
            <p className="text-gray-800 text-lg font-bold">JPC</p>
            <p className="text-gray-600 text-xs">J-40543994-7</p>
            <p className="text-gray-600 text-xs text-center">
              SERVICE C.A.
              <br />
              PUBLICIDAD
            </p>
          </div>
          <div className="text-right text-sm">
            <p className="font-semibold">
              Carrera 9 entre calles 14 y 15 No. S/N ofic. 1
            </p>
            <p className="font-semibold">DUACA-EDO. LARA</p>
            <p className="font-semibold">CORREO JPGSERVICE@GMAIL.COM</p>
            <p className="font-semibold">CEL: 0414-538.41.12</p>
            <p className="mt-4">{`Barquisimeto ${date}`}</p>
          </div>
        </div>
        <p className="text-lg font-semibold mb-4">
          SEÑORES: {clientName || "CLIENTE"}
        </p>
        <table className="min-w-full bg-white border border-gray-300 mb-6 table-fixed">
          <colgroup>
            <col style={{ width: "10%" }} />
            <col style={{ width: "55%" }} />
            <col style={{ width: "17.5%" }} />
            <col style={{ width: "17.5%" }} />
          </colgroup>
          <thead>
            <tr className="bg-gray-100 border-b border-gray-300">
              <th className="py-2 px-4 text-center text-sm font-semibold text-gray-700">
                CANT
              </th>
              <th className="py-2 px-4 text-center text-sm font-semibold text-gray-700">
                DESCRIPCIÓN
              </th>
              <th className="py-2 px-4 text-center text-sm font-semibold text-gray-700">
                P/U
              </th>
              <th className="py-2 px-4 text-center text-sm font-semibold text-gray-700">
                TOTAL $
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const formatDimension = (cm) => {
                const val = parseFloat(cm);
                if (isNaN(val)) return "";
                if (val < 100) {
                  return `${parseFloat(val.toFixed(2))}cm`;
                }
                return `${parseFloat((val / 100).toFixed(2))}m`;
              };
              const pieceSizeFormatted = `${formatDimension(
                item.pieceWidthCm
              )} x ${formatDimension(item.pieceHeightCm)}`;
              const paperName = item.isDigital
                ? ""
                : `, impreso en ${
                    paperTypes.find((p) => p.id === item.selectedPaperTypeId)
                      ?.name || "N/A"
                  }`;
              const colorDesc = item.isDigital
                ? ", Impresión Digital"
                : `, a ${item.colorsDescription}`;

              const quantityDisplay = item.isTalonarios
                ? item.numTalonarios
                : item.totalPieces;
              const copiesNum = parseInt(item.copiesPerSet, 10) || 0;
              const copiesText =
                copiesNum > 0
                  ? `Original + ${copiesNum} ${
                      copiesNum > 1 ? "copias" : "copia"
                    }`
                  : "Solo Original";

              const fullDescription = item.isTalonarios
                ? `${item.quotationName} (Talonarios de ${item.sheetsPerSet}h, ${copiesText}), Tamaño ${pieceSizeFormatted}${paperName}${colorDesc}`
                : `${item.quotationName}, Tamaño ${pieceSizeFormatted}${paperName}${colorDesc}`;

              const pricePerUnit =
                item.totalPieces > 0
                  ? item.costWithProfit / parseFloat(item.totalPieces)
                  : 0;
              return (
                <tr key={item.id} className="border-b border-gray-200">
                  <td className="py-2 px-4 text-sm text-gray-800 text-center">
                    {quantityDisplay}
                  </td>
                  <td className="py-2 px-4 text-sm text-gray-800 text-left">
                    {fullDescription}
                  </td>
                  <td className="py-2 px-4 text-sm text-gray-800 text-center">
                    ${pricePerUnit.toFixed(4)}
                  </td>
                  <td className="py-2 px-4 text-sm text-gray-800 text-center">
                    ${item.costWithProfit.toFixed(2)}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr>
              <td
                colSpan="3"
                className="py-2 px-4 text-right text-lg font-semibold text-gray-800"
              >
                Total General
              </td>
              <td className="py-2 px-4 text-center text-lg font-bold text-blue-700">
                ${totalGeneral.toFixed(2)}
              </td>
            </tr>
          </tfoot>
        </table>
        <div className="text-xs text-gray-700 space-y-2 mb-6">
          <p className="font-semibold">Precios no incluyen IVA.</p>
          <p className="font-semibold">
            Nota: Toda orden de trabajo comenzará al Abonar el 70% del
            presupuesto.
          </p>
        </div>
        <div className="text-center mt-8 mb-6">
          <p className="text-gray-800 font-semibold text-lg border-b border-gray-400 inline-block px-12 pb-1">
            JOSE OCHOA
          </p>
          <p className="text-gray-600 text-sm mt-1">GERENTE</p>
        </div>
        <p className="text-center text-xs text-gray-500 mt-6">
          Todos nuestros productos son elaborados en material de primera calidad
          especial para este tipo de trabajo.
        </p>
      </div>
      <div className="flex flex-col space-y-3 mt-8 no-print">
        <button
          onClick={handleSharePdfViaWhatsApp}
          disabled={isGeneratingPdf}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg disabled:bg-red-300 disabled:cursor-not-allowed"
        >
          {isGeneratingPdf ? pdfMessage : "Compartir PDF por WhatsApp"}
        </button>
        <button
          onClick={handleShareTextWhatsApp}
          className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg"
        >
          Compartir Texto por WhatsApp
        </button>
        <button
          onClick={handlePrint}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg"
        >
          Imprimir Presupuesto
        </button>
        <button
          onClick={onClose}
          className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 px-6 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg"
        >
          Cerrar Vista Previa
        </button>
      </div>
    </BaseModal>
  );
}
