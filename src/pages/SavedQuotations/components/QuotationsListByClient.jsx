import React from "react";
import ClientGroupCard from "./ClientGroupCard";

/**
 * Lista de cotizaciones agrupadas por cliente
 */
const QuotationsListByClient = ({
  groupedQuotations,
  onEdit,
  onDelete,
  onStatusChange,
}) => {
  const clientNames = Object.keys(groupedQuotations);

  if (clientNames.length === 0) {
    return null;
  }

  return (
    <div className="mt-6">
      {clientNames.map((clientName) => {
        const group = groupedQuotations[clientName];

        return (
          <ClientGroupCard
            key={clientName}
            clientName={group.clientName}
            quotations={group.quotations}
            totalUSD={group.totalUSD}
            totalBs={group.totalBs}
            count={group.count}
            onEdit={onEdit}
            onDelete={onDelete}
            onStatusChange={onStatusChange}
          />
        );
      })}
    </div>
  );
};

export default React.memo(QuotationsListByClient);
