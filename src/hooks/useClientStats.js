import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useFirebase } from '../context/FirebaseContext';

/**
 * Hook para calcular y obtener estadísticas de un cliente específico
 * Calcula métricas basadas en las cotizaciones del cliente
 *
 * @param {string} clientId - ID del cliente
 * @returns {Object} Estadísticas del cliente
 */
export const useClientStats = (clientId) => {
  const { db, appId, userId } = useFirebase();
  const [stats, setStats] = useState({
    quotationCount: 0,
    lastQuotationDate: null,
    totalRevenue: 0,
    pendingQuotations: 0,
    approvedQuotations: 0,
    rejectedQuotations: 0,
    averageQuotationValue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!db || !userId || !clientId) {
      setLoading(false);
      return;
    }

    const fetchClientStats = async () => {
      try {
        setLoading(true);
        setError(null);

        // Obtener todas las cotizaciones del cliente
        const quotationsRef = collection(
          db,
          `artifacts/${appId}/users/${userId}/quotations`
        );

        const q = query(quotationsRef, where('clientId', '==', clientId));
        const snapshot = await getDocs(q);

        // Calcular estadísticas
        let totalRevenue = 0;
        let pendingCount = 0;
        let approvedCount = 0;
        let rejectedCount = 0;
        let lastDate = null;

        snapshot.forEach((doc) => {
          const quotation = doc.data();
          const quotationDate = quotation.timestamp?.toDate() || new Date();

          // Contar por estado
          if (quotation.status === 'pending') pendingCount++;
          if (quotation.status === 'approved') approvedCount++;
          if (quotation.status === 'rejected') rejectedCount++;

          // Sumar ingresos de cotizaciones aprobadas
          if (quotation.status === 'approved' && quotation.grandTotals?.totalGeneral) {
            totalRevenue += quotation.grandTotals.totalGeneral;
          }

          // Actualizar última fecha
          if (!lastDate || quotationDate > lastDate) {
            lastDate = quotationDate;
          }
        });

        const totalQuotations = snapshot.size;
        const averageValue = totalQuotations > 0 ? totalRevenue / approvedCount || 0 : 0;

        setStats({
          quotationCount: totalQuotations,
          lastQuotationDate: lastDate,
          totalRevenue,
          pendingQuotations: pendingCount,
          approvedQuotations: approvedCount,
          rejectedQuotations: rejectedCount,
          averageQuotationValue: averageValue,
        });

        setLoading(false);
      } catch (err) {
        console.error('Error fetching client stats:', err);
        setError('Error al cargar estadísticas del cliente');
        setLoading(false);
      }
    };

    fetchClientStats();
  }, [db, appId, userId, clientId]);

  return { stats, loading, error };
};

/**
 * Hook para calcular estadísticas de todos los clientes
 * Retorna métricas agregadas y rankings
 *
 * @returns {Object} Estadísticas globales de clientes
 */
export const useAllClientsStats = () => {
  const { db, appId, userId } = useFirebase();
  const [stats, setStats] = useState({
    totalClients: 0,
    activeClients: 0, // Clientes con al menos 1 cotización
    topClientsByRevenue: [],
    topClientsByQuotations: [],
    recentClients: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!db || !userId) {
      setLoading(false);
      return;
    }

    const fetchAllStats = async () => {
      try {
        setLoading(true);
        setError(null);

        // Obtener todos los clientes
        const clientsRef = collection(
          db,
          `artifacts/${appId}/users/${userId}/clients`
        );
        const clientsSnapshot = await getDocs(clientsRef);

        const clientsData = [];
        clientsSnapshot.forEach((doc) => {
          clientsData.push({
            id: doc.id,
            ...doc.data(),
          });
        });

        // Calcular métricas
        const totalClients = clientsData.length;
        const activeClients = clientsData.filter(
          (client) => client.quotationCount > 0
        ).length;

        // Top 5 clientes por ingresos
        const topByRevenue = [...clientsData]
          .filter((client) => client.totalRevenue > 0)
          .sort((a, b) => b.totalRevenue - a.totalRevenue)
          .slice(0, 5)
          .map((client) => ({
            id: client.id,
            name: client.name,
            totalRevenue: client.totalRevenue,
            quotationCount: client.quotationCount,
          }));

        // Top 5 clientes por número de cotizaciones
        const topByQuotations = [...clientsData]
          .filter((client) => client.quotationCount > 0)
          .sort((a, b) => b.quotationCount - a.quotationCount)
          .slice(0, 5)
          .map((client) => ({
            id: client.id,
            name: client.name,
            quotationCount: client.quotationCount,
            totalRevenue: client.totalRevenue,
          }));

        // Clientes recientes (últimos 5 con cotizaciones)
        const recentClients = [...clientsData]
          .filter((client) => client.lastQuotationDate)
          .sort((a, b) => {
            const dateA = a.lastQuotationDate.toDate();
            const dateB = b.lastQuotationDate.toDate();
            return dateB - dateA;
          })
          .slice(0, 5)
          .map((client) => ({
            id: client.id,
            name: client.name,
            lastQuotationDate: client.lastQuotationDate.toDate(),
            quotationCount: client.quotationCount,
          }));

        setStats({
          totalClients,
          activeClients,
          topClientsByRevenue: topByRevenue,
          topClientsByQuotations: topByQuotations,
          recentClients,
        });

        setLoading(false);
      } catch (err) {
        console.error('Error fetching all clients stats:', err);
        setError('Error al cargar estadísticas de clientes');
        setLoading(false);
      }
    };

    fetchAllStats();
  }, [db, appId, userId]);

  return { stats, loading, error };
};

/**
 * Función helper para formatear valores monetarios
 */
export const formatCurrency = (value) => {
  return new Intl.NumberFormat('es-VE', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(value);
};

/**
 * Función helper para formatear fechas relativas
 */
export const formatRelativeDate = (date) => {
  if (!date) return 'Nunca';

  const now = new Date();
  const diff = now - date;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return 'Hoy';
  if (days === 1) return 'Ayer';
  if (days < 7) return `Hace ${days} días`;
  if (days < 30) return `Hace ${Math.floor(days / 7)} semanas`;
  if (days < 365) return `Hace ${Math.floor(days / 30)} meses`;
  return `Hace ${Math.floor(days / 365)} años`;
};
