/**
 * CampusVerse AI - Utility Formatters
 * Formats dates, currencies, percentages, and status badges consistently across modules.
 */

export const formatDate = (dateString, options = {}) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      ...options,
    }).format(date);
  } catch {
    return dateString;
  }
};

export const formatCurrency = (amount, currency = 'INR') => {
  if (amount === undefined || amount === null) return 'N/A';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatPercent = (value, decimals = 1) => {
  if (value === undefined || value === null) return '0%';
  return `${Number(value).toFixed(decimals)}%`;
};

export const getStatusBadgeVariant = (status) => {
  const s = String(status).toLowerCase();
  if (['present', 'completed', 'paid', 'approved', 'active', 'good', 'success', 'on time', 'graded', 'cleared', 'waived'].includes(s)) {
    return 'success';
  }
  if (['pending', 'in progress', 'upcoming', 'partial', 'reviewing', 'warning', 'medium'].includes(s)) {
    return 'warning';
  }
  if (['absent', 'overdue', 'failed', 'rejected', 'critical', 'danger', 'unpaid', 'high'].includes(s)) {
    return 'danger';
  }
  if (['submitted', 'scheduled', 'info', 'low'].includes(s)) {
    return 'info';
  }
  return 'neutral';
};
