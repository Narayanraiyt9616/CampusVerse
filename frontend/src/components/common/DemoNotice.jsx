import React from 'react';
import { Info } from 'lucide-react';

/**
 * Notice banner displayed on dashboards
 */
export const DemoNotice = ({
  roleName = 'Dashboard',
  customMessage = null,
  className = 'mb-6',
}) => {
  return (
    <div
      className={`rounded-2xl border border-[#F1E7CF] bg-[#FFF8E6] p-4 text-xs sm:text-sm text-[#111827] flex items-start gap-3.5 shadow-subtle ${className}`}
      role="note"
      aria-label="System Notice"
    >
      <div className="p-1.5 rounded-xl bg-white text-[#D99A00] shrink-0 mt-0.5 shadow-sm border border-[#F1E7CF]">
        <Info className="w-4 h-4" />
      </div>
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold uppercase tracking-wider text-[11px] bg-[#D99A00] text-white px-2 py-0.5 rounded-lg">
            CampusVerse AI
          </span>
          <span className="text-[#111827] font-bold">
            {roleName} Architecture
          </span>
        </div>
        <p className="text-[#4B5563] leading-relaxed font-medium">
          {customMessage || 'Live production data synchronized with MongoDB database.'}{' '}
          <span className="font-bold text-[#111827]">
            Integrated unified platform.
          </span>
        </p>
      </div>
    </div>
  );
};

export default DemoNotice;
