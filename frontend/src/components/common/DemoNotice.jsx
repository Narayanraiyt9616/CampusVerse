import React from 'react';
import { Info } from 'lucide-react';
import { DEMO_METADATA } from '../../utils/demoData';

/**
 * Notice banner displayed on dashboards to guarantee transparency about demonstration data
 * and upcoming Part 2 (backend) / Part 3 (AI service) integration.
 */
export const DemoNotice = ({
  roleName = 'Dashboard',
  customMessage = null,
  className = 'mb-6',
}) => {
  return (
    <div
      className={`rounded-xl border border-amber-200/90 bg-amber-50/70 p-3.5 text-xs text-amber-900 flex items-start gap-3 shadow-subtle ${className}`}
      role="note"
      aria-label="Demonstration Notice"
    >
      <div className="p-1 rounded-md bg-amber-100 text-amber-700 shrink-0 mt-0.5">
        <Info className="w-4 h-4" />
      </div>
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold uppercase tracking-wider text-[11px] bg-amber-200/70 text-amber-900 px-1.5 py-0.5 rounded">
            Part 1 Demonstration Data
          </span>
          <span className="text-amber-800 font-medium">
            {roleName} Layout & Component Architecture
          </span>
        </div>
        <p className="text-amber-800/90 leading-relaxed">
          {customMessage || DEMO_METADATA.notice}{' '}
          <span className="font-medium text-amber-950">
            Backend API integration (Node/Express/MongoDB) is scheduled for Part 2.
          </span>
        </p>
      </div>
    </div>
  );
};

export default DemoNotice;
