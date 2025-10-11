// src/pages/QuotationDetail/hooks/usePDFGeneration.js
import { useState } from 'react';
import { uploadPdfToStorage } from '../../../config/storage';
import { useFirebase } from '../../../context/FirebaseContext';

/**
 * Hook para generar y compartir PDFs de presupuestos
 * @param {Object} quotation - Datos del presupuesto
 * @returns {Object} { isGeneratingPdf, pdfMessage, downloadPDF, shareViaPDFWhatsApp, shareViaTextWhatsApp }
 */
export function usePDFGeneration(quotation) {
  const { userId } = useFirebase();
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfMessage, setPdfMessage] = useState('');

  /**
   * Genera el PDF desde el elemento HTML
   * @param {string} elementId - ID del elemento a convertir en PDF
   * @returns {Promise<jsPDF>} Objeto PDF generado
   */
  const generatePDF = async (elementId = 'quotation-print-area') => {
    if (!window.jspdf || !window.html2canvas) {
      throw new Error('Librerías PDF no encontradas. Verifica que jsPDF y html2canvas estén cargadas.');
    }

    const { jsPDF } = window.jspdf;
    const input = document.getElementById(elementId);

    if (!input) {
      throw new Error(`Elemento con ID "${elementId}" no encontrado`);
    }

    // Capturar HTML como canvas
    const canvas = await window.html2canvas(input, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    return pdf;
  };

  /**
   * Descarga el PDF localmente
   */
  const downloadPDF = async () => {
    if (!quotation) return;

    setIsGeneratingPdf(true);
    setPdfMessage('Generando PDF...');

    try {
      const pdf = await generatePDF();
      const fileName = `presupuesto-${quotation.name.replace(/\s+/g, '-')}-${Date.now()}.pdf`;
      pdf.save(fileName);
      setPdfMessage('¡PDF descargado!');

      setTimeout(() => {
        setIsGeneratingPdf(false);
        setPdfMessage('');
      }, 2000);
    } catch (error) {
      console.error('Error al generar PDF:', error);
      setPdfMessage(`Error: ${error.message}`);
      setTimeout(() => {
        setIsGeneratingPdf(false);
        setPdfMessage('');
      }, 5000);
    }
  };

  /**
   * Comparte el PDF por WhatsApp (sube a MinIO y genera link)
   */
  const shareViaPDFWhatsApp = async () => {
    if (!quotation) return;

    setIsGeneratingPdf(true);
    setPdfMessage('Generando PDF...');

    try {
      const pdf = await generatePDF();

      setPdfMessage('Subiendo PDF a MinIO...');
      const pdfBlob = pdf.output('blob');
      const pdfId = `presupuesto-${Date.now()}.pdf`;
      const downloadURL = await uploadPdfToStorage(pdfBlob, userId, pdfId);

      const { grandTotals = {}, clientName, name } = quotation;
      const whatsappText = encodeURIComponent(
        `¡Hola! Aquí está tu presupuesto de ${name}:\n\n` +
        `Cliente: ${clientName || 'Cliente'}\n` +
        `Precio Total: $${grandTotals.totalGeneral?.toFixed(2) || '0.00'}\n` +
        `En Bs.: Bs. ${grandTotals.totalCostInBs?.toFixed(2) || '0.00'}\n\n` +
        `Puedes descargar el presupuesto completo aquí:\n${downloadURL}\n\n` +
        `¡Gracias por tu confianza!\n- Litografía Pro`
      );

      setPdfMessage('¡Listo! Abriendo WhatsApp...');
      window.open(`https://wa.me/?text=${whatsappText}`, '_blank');

      setTimeout(() => {
        setIsGeneratingPdf(false);
        setPdfMessage('');
      }, 3000);
    } catch (error) {
      console.error('Error al compartir PDF por WhatsApp:', error);
      setPdfMessage(`Error: ${error.message}`);
      setTimeout(() => {
        setIsGeneratingPdf(false);
        setPdfMessage('');
      }, 8000);
    }
  };

  /**
   * Comparte resumen por WhatsApp (solo texto, sin PDF)
   * @param {Array} items - Items del presupuesto
   * @param {Array} paperTypes - Tipos de papel (opcional)
   */
  const shareViaTextWhatsApp = (items = [], paperTypes = []) => {
    if (!quotation) return;

    const itemsText = items
      .map((item) => {
        const pieceSize = `${item.pieceWidthCm}cm x ${item.pieceHeightCm}cm`;
        const paper = paperTypes.find((p) => p.id === item.paperId);
        const paperName = paper?.name || 'N/A';
        const description = `${item.printingAreaLabel || item.printingAreaOption}, papel ${paperName}`;
        return `- ${item.quotationName} (${item.totalPieces} piezas de ${pieceSize}), ${description}`;
      })
      .join('\n');

    const { grandTotals = {}, clientName, name } = quotation;
    const whatsappText = encodeURIComponent(
      `¡Hola! Aquí está tu presupuesto de impresión de Litografía Pro:\n\n` +
      `Cliente: ${clientName || 'Cliente'}\n` +
      `Concepto: ${name}\n\n` +
      `Items:\n${itemsText}\n\n` +
      `Precio Total: $${grandTotals.totalGeneral?.toFixed(2) || '0.00'}\n` +
      `En Bs.: Bs. ${grandTotals.totalCostInBs?.toFixed(2) || '0.00'} ` +
      `(Tasa BCV: ${quotation.bcvRate?.toFixed(2) || '0.00'} Bs./$)\n\n` +
      `¡Gracias por tu confianza!\n\n` +
      `Para ver el presupuesto detallado, por favor solicita el PDF.`
    );

    window.open(`https://wa.me/?text=${whatsappText}`, '_blank');
  };

  return {
    isGeneratingPdf,
    pdfMessage,
    downloadPDF,
    shareViaPDFWhatsApp,
    shareViaTextWhatsApp,
  };
}
