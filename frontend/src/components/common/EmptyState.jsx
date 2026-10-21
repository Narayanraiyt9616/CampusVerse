import React from 'react';
import { Inbox } from 'lucide-react';
import Button from './Button';

/**
 * Standard Empty State Component for tables, lists, and cards
 * Strictly adhering to 5 colors: #102A43, #0D9488, #F0FDFA, #FFFFFF, #CCFBF1
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
    <div className={`flex flex-col items-center justify-center p-8 text-center bg-white rounded-2xl border-2 border-dashed border-[#CCFBF1] ${className}`}>
      <div className="p-3.5 bg-[#CCFBF1] rounded-2xl text-[#0D9488] mb-3.5">
        {icon || <Inbox className="w-6 h-6" />}
      </div>
      <h4 className="text-base font-bold text-[#102A43]">{title}</h4>
      <p className="text-xs sm:text-sm text-[#102A43]/75 max-w-sm mt-1.5 mb-4 font-medium">{description}</p>
      {actionLabel && onAction && (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
