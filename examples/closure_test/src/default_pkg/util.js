/**
 * @fileoverview Test utility with default package name
 */

/**
 * Formats a number as currency.
 * @param {number} amount
 * @return {string}
 */
export function formatCurrency(amount) {
  return `$${amount.toFixed(2)}`;
}
