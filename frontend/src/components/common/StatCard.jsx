import React from 'react';

/**
 * Metric Stat Card Component for CampusVerse AI Dashboards
 * CampusVerse Gold & Yellow Theme (#D99A00, #FFC107, #FFF8E6, #FFFDF5, #FFFEFA, #F1E7CF)
 */
export const StatCard = ({
  title,
  value,
  subtitle,
  change,
  changeType = 'increase', // 'increase' | 'decrease' | 'neutral'
  icon = null,
  colorVariant = 'gold',
  badge = null,
  id,
}) => {
  const iconVariants = {
    gold: 'bg-[#FFF8E6] text-[#D97706] border-[#FDE68A]',
    teal: 'bg-[#FFF8E6] text-[#D97706] border-[#FDE68A]',
    yellow: 'bg-[#FEF9C3] text-[#CA8A04] border-[#FDE047]',
    blue: 'bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]',
    emerald: 'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]',
    purple: 'bg-[#FAF5FF] text-[#7C3AED] border-[#DDD6FE]',
    navy: 'bg-[#0B132B] text-[#FACC15] border-[#1E293B]',
    amber: 'bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]',
  };

  const iconClasses = iconVariants[colorVariant] || iconVariants.gold;

  return (
    <div
      id={id}
      className="bg-white rounded-2xl sm:rounded-3xl border border-[#F1E7CF] p-5 sm:p-6 shadow-[0_4px_24px_rgba(217,119,6,0.04)] hover:shadow-[0_12px_32px_rgba(217,119,6,0.1)] hover:border-[#FDE68A] hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between group"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1.5 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">{title}</span>
            {badge}
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight truncate">{value}</div>
        </div>

        {icon && (
          <div className={`p-3 rounded-2xl border shrink-0 transition-transform duration-300 group-hover:scale-110 shadow-xs ${iconClasses}`}>
            {icon}
          </div>
        )}
      </div>

      {(subtitle || change) && (
        <div className="mt-4 pt-3.5 border-t border-[#F1E7CF] flex items-center justify-between text-xs text-[#64748B] font-medium gap-2">
          <span className="truncate">{subtitle}</span>
          {change && (
            <span
              className={`font-bold inline-flex items-center gap-1 shrink-0 px-2 py-0.5 rounded-full text-[11px] ${
                changeType === 'increase'
                  ? 'bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]'
                  : changeType === 'decrease'
                  ? 'bg-[#FEF2F2] text-[#E11D48] border border-[#FECDD3]'
                  : 'bg-[#FFF8E6] text-[#B45309] border border-[#FDE68A]'
              }`}
            >
              {changeType === 'increase' ? '↑' : changeType === 'decrease' ? '↓' : '•'} {change}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default StatCard;
