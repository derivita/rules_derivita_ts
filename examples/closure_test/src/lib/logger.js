/**
 * @fileoverview Logger module for consistent logging
 */

/**
 * Log levels
 * @enum {string}
 */
export const LogLevel = {
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR'
};

/**
 * Logs a message with a specific level.
 * @param {string} message
 * @param {LogLevel=} level
 */
export function log(message, level = LogLevel.INFO) {
  console.log(`[${level}] ${message}`);
}
