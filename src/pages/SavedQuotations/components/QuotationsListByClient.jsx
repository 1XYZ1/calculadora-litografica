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
  onDuplicate,
  onToggleTemplate,
  onUpdateTemplateName,
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
            onDuplicate={onDuplicate}
            onToggleTemplate={onToggleTemplate}
            onUpdateTemplateName={onUpdateTemplateName}
          />
        );
      })}
    </div>
  );
};

export default React.memo(QuotationsListByClient);
