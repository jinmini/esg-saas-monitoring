import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Date formatting utilities
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMinutes < 1) {
    return '방금 전';
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes}분 전`;
  } else if (diffInHours < 24) {
    return `${diffInHours}시간 전`;
  } else if (diffInDays < 7) {
    return `${diffInDays}일 전`;
  } else {
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }
}

export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// URL utilities
export function isValidUrl(string: string): boolean {
  try {
    new URL(string);
    return true;
  } catch {
    return false;
  }
}

// Text utilities
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

// Period to date range conversion utilities
export interface DateRange {
  date_from: string;
  date_to: string;
}

/**
 * Convert period in days to ISO date range
 * @param periodDays - Number of days to look back (30, 90, 180, 365)
 * @returns Object with date_from and date_to in ISO format
 */
export function periodToDateRange(periodDays: number): DateRange {
  const now = new Date();
  const dateFrom = new Date();
  dateFrom.setDate(now.getDate() - periodDays);
  
  // Set to start of day for date_from
  dateFrom.setHours(0, 0, 0, 0);
  
  // Set to end of day for date_to
  now.setHours(23, 59, 59, 999);
  
  return {
    date_from: dateFrom.toISOString(),
    date_to: now.toISOString(),
  };
}

/**
 * Convert period in days to period_days parameter for Trends API
 * @param periodDays - Number of days (30, 90, 180, 365)
 * @returns Constrained period_days for API (max 365)
 */
export function periodToPeriodDays(periodDays: number): number {
  // Ensure it's within API limits (1-365)
  return Math.min(Math.max(periodDays, 1), 365);
}

/**
 * Get human readable period label
 * @param periodDays - Number of days
 * @returns Formatted period label
 */
export function getPeriodLabel(periodDays: number): string {
  switch (periodDays) {
    case 30:
      return '1개월';
    case 90:
      return '3개월';
    case 180:
      return '6개월';
    case 365:
      return '12개월';
    default:
      return `${periodDays}일`;
  }
}
