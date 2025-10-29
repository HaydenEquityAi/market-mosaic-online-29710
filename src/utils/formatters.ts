// Format currency: $68,810.15
export const formatCurrency = (value: number): string => {
  const safe = Number.isFinite(value) ? value : 0;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(safe);
};

// Format numbers with commas: 150,000,000.00
export const formatNumber = (value: number, decimals: number = 2): string => {
  const safe = Number.isFinite(value) ? value : 0;
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(safe);
};

// Format shares: 150,000,000.00 (always 2 decimals)
export const formatShares = (value: number): string => {
  return formatNumber(value, 2);
};

// Format percentage: +0.00%
export const formatPercent = (value: number): string => {
  const safe = Number.isFinite(value) ? value : 0;
  const sign = safe >= 0 ? '+' : '';
  return `${sign}${safe.toFixed(2)}%`;
};

// Optional: format large numbers with suffix (K, M, B, T)
export const formatWithSuffix = (value: number, decimals: number = 2): string => {
  const safe = Number.isFinite(value) ? value : 0;
  const abs = Math.abs(safe);
  const sign = safe < 0 ? '-' : '';
  if (abs >= 1e12) return `${sign}${(abs / 1e12).toFixed(decimals)}T`;
  if (abs >= 1e9) return `${sign}${(abs / 1e9).toFixed(decimals)}B`;
  if (abs >= 1e6) return `${sign}${(abs / 1e6).toFixed(decimals)}M`;
  if (abs >= 1e3) return `${sign}${(abs / 1e3).toFixed(decimals)}K`;
  return formatNumber(safe, decimals);
};

// Relative/readable date (e.g., 2h ago, Today, Oct 29)
export const formatNewsTime = (isoString: string): string => {
  const d = new Date(isoString);
  if (isNaN(d.getTime())) {
    return '—';
  }
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h ago`;
  if (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  ) {
    return 'Today';
  }
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};


