import React from 'react';
import { Info } from 'lucide-react';
import { DEMO_METADATA } from '../../utils/demoData';

/**
 * Notice banner displayed on dashboards
 * Strictly adhering to the 5 colors: #102A43, #0D9488, #F0FDFA, #FFFFFF, #CCFBF1
 */
export const DemoNotice = ({
  roleName = 'Dashboard',
  customMessage = null,
  className = 'mb-6',
}) => {
  return (
    <div
      className={`rounded-2xl border border-[#0D9488]/40 bg-[#CCFBF1] p-4 text-xs sm:text-sm text-[#102A43] flex items-start gap-3.5 shadow-subtle ${className}`}
      role="note"
      aria-label="Demonstration Notice"
    >
      <div className="p-1.5 rounded-xl bg-white text-[#0D9488] shrink-0 mt-0.5 shadow-sm">
        <Info className="w-4 h-4" />
      </div>
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold uppercase tracking-wider text-[11px] bg-[#0D9488] text-white px-2 py-0.5 rounded-lg">
            CampusVerse AI
          </span>
          <span className="text-[#102A43] font-bold">
            {roleName} Architecture
          </span>
        </div>
        <p className="text-[#102A43] leading-relaxed font-medium">
          {customMessage || DEMO_METADATA.notice}{' '}
          <span className="font-bold text-[#102A43]">
            Integrated unified platform.
          </span>
        </p>
      </div>
    </div>
  );
};

export default DemoNotice;
