import React from 'react';
import { Badge } from '../ui/badge';

export const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const isGood = ['Qualified', 'Active', 'Won', 'Completed', 'Paid', 'Sent'].includes(status);
  const isWarn = ['Contacted', 'Proposal', 'Partial', 'Pending', 'Scheduled'].includes(status);
  const isBad = ['Lost', 'Unqualified', 'Unpaid', 'Cancelled'].includes(status);

  return (
    <Badge variant={isGood ? 'success' : isWarn ? 'warning' : isBad ? 'danger' : 'default'}>
      {status}
    </Badge>
  );
};
