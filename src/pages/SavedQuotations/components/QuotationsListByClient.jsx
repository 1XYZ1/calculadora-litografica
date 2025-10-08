import React from "react";
import ClientGroupCard from "./ClientGroupCard";

/**
 * Lista de cotizaciones agrupadas por cliente
 */
const QuotationsListByClient = ({
  groupedQuotations,
  selectedQuotations,
  onToggleSelect,
  onEdit,
  onDelete,
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
            selectedQuotations={selectedQuotations}
            onToggleSelect={onToggleSelect}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        );
      })}
    </div>
  );
};

export default React.memo(QuotationsListByClient);
