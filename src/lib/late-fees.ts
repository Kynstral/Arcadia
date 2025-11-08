/**
 * Late Fee Calculation Utilities
 */

export interface LibrarySettings {
  daily_late_fee_rate: number;
  grace_period_days: number;
  max_late_fee_cap: number;
}

/**
 * Calculate late fee for an overdue book
 * @param dueDate - The due date of the book
 * @param returnDate - The actual return date (or current date if not returned)
 * @param settings - Library settings with fee rates and policies
 * @returns The calculated late fee amount
 */
export function calculateLateFee(
  dueDate: Date | string,
  returnDate: Date | string,
  settings: LibrarySettings
): number {
  const due = new Date(dueDate);
  const returned = new Date(returnDate);

  // Calculate days overdue
  const diffTime = returned.getTime() - due.getTime();
  const daysOverdue = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // If not overdue, no fee
  if (daysOverdue <= 0) {
    return 0;
  }

  // Apply grace period
  const chargeableDays = Math.max(0, daysOverdue - settings.grace_period_days);

  // If within grace period, no fee
  if (chargeableDays <= 0) {
    return 0;
  }

  // Calculate fee
  let fee = chargeableDays * settings.daily_late_fee_rate;

  // Apply maximum cap if set
  if (settings.max_late_fee_cap > 0) {
    fee = Math.min(fee, settings.max_late_fee_cap);
  }

  // Round to 2 decimal places
  return Math.round(fee * 100) / 100;
}

/**
 * Get days overdue for a book
 * @param dueDate - The due date of the book
 * @param currentDate - The current date (defaults to now)
 * @returns Number of days overdue (negative if not yet due)
 */
export function getDaysOverdue(dueDate: Date | string, currentDate: Date = new Date()): number {
  const due = new Date(dueDate);
  const diffTime = currentDate.getTime() - due.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Check if a book is overdue
 * @param dueDate - The due date of the book
 * @param currentDate - The current date (defaults to now)
 * @returns True if the book is overdue
 */
export function isOverdue(dueDate: Date | string, currentDate: Date = new Date()): boolean {
  return getDaysOverdue(dueDate, currentDate) > 0;
}

/**
 * Format late fee amount as currency
 * @param amount - The fee amount
 * @returns Formatted currency string
 */
export function formatLateFee(amount: number): string {
  return `$${amount.toFixed(2)}`;
}
