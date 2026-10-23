import React from 'react';

/**
 * PortalHeroBanner - High-end welcome banner inspired by the Student Portal reference image
 * Features golden pill role badge, dark navy + golden yellow heading, subtitle, and golden accent dots
 */
export const PortalHeroBanner = ({
  portalName = 'Student Portal',
  roleTitle = 'Student',
  portalHighlight = 'Student Portal',
  headingPrefix = 'Welcome to',
  subtitle = 'Access your academic profile, course rosters, attendance, telemetry, and grades — all in one place.',
  icon = null,
  userName = '',
  userIdentifier = '',
  actions = null,
  className = '',
}) => {
  return (
    <div className={`relative overflow-hidden bg-white rounded-2xl sm:rounded-3xl border border-[#F1E7CF] p-6 sm:p-8 shadow-[0_4px_24px_rgba(217,119,6,0.04)] ${className}`}>
      {/* Decorative ambient radial golden light in background */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-[#FACC15]/10 via-[#F59E0B]/5 to-transparent rounded-full blur-2xl pointer-events-none -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-1/3 w-60 h-60 bg-[#D97706]/5 rounded-full blur-2xl pointer-events-none -mb-20" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="space-y-3 max-w-3xl">
          {/* Reference Image Pill Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#FFF8E6] text-[#B45309] border border-[#FDE68A] shadow-xs">
            {icon && <span className="text-[#D97706]">{icon}</span>}
            <span>{portalName}</span>
            <span className="text-[#D97706]/40">|</span>
            <span className="text-[#D97706] font-semibold">Role: {roleTitle}</span>
          </div>

          {/* Main Heading with Golden Highlight */}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#0F172A] tracking-tight leading-tight">
            {headingPrefix}{' '}
            <span className="bg-gradient-to-r from-[#D97706] via-[#F59E0B] to-[#D97706] bg-clip-text text-transparent">
              {portalHighlight}
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xs sm:text-sm text-[#64748B] font-medium leading-relaxed max-w-2xl">
            {subtitle}
          </p>

          {/* Golden divider dots inspired by reference image */}
          <div className="flex items-center gap-1.5 pt-1">
            <span className="w-2.5 h-1.5 rounded-full bg-[#D97706]" />
            <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
            <span className="w-1.5 h-1.5 rounded-full bg-[#FDE68A]" />
          </div>
        </div>

        {/* Right side: User card capsule or action buttons */}
        <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end justify-between gap-3 shrink-0">
          {(userName || userIdentifier) && (
            <div className="p-3.5 rounded-2xl bg-[#FFFDF5] border border-[#F1E7CF] flex items-center gap-3 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F59E0B] to-[#D97706] text-white font-black text-sm flex items-center justify-center shadow-xs ring-1 ring-[#FDE68A]">
                {userName ? userName.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="text-left">
                <p className="text-xs font-black text-[#0F172A] leading-tight truncate max-w-[160px]">
                  {userName || 'User'}
                </p>
                {userIdentifier && (
                  <p className="text-[11px] font-semibold text-[#B45309] font-mono mt-0.5 truncate max-w-[160px]">
                    {userIdentifier}
                  </p>
                )}
              </div>
            </div>
          )}

          {actions && (
            <div className="flex items-center gap-2 flex-wrap">
              {actions}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PortalHeroBanner;
