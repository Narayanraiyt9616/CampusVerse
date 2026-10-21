import React from 'react';
import { Inbox } from 'lucide-react';
import Button from './Button';

/**
 * Standard Empty State Component for tables, lists, and cards
 */
export const EmptyState = ({
  icon = null,
  title = 'No items found',
  description = 'There are currently no records or updates to display in this section.',
  actionLabel = null,
  onAction = null,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center bg-white rounded-xl border border-dashed border-slate-200 ${className}`}>
      <div className="p-3 bg-slate-100 rounded-full text-slate-500 mb-3">
        {icon || <Inbox className="w-6 h-6" />}
      </div>
      <h4 className="text-sm font-semibold text-slate-900">{title}</h4>
      <p className="text-xs text-slate-500 max-w-sm mt-1 mb-4">{description}</p>
      {actionLabel && onAction && (
        <Button variant="secondary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
