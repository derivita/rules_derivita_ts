/**
 * @fileoverview Greeter module that provides greeting functionality
 */

/**
 * Creates a personalized greeting.
 * @param {string} name
 * @param {string=} prefix Optional prefix for the greeting
 * @return {string}
 */
export function createGreeting(name, prefix = 'Hello') {
  return `${prefix}, ${name}!`;
}

/**
 * Creates a formal greeting.
 * @param {string} name
 * @return {string}
 */
export function createFormalGreeting(name) {
  return createGreeting(name, 'Good day');
}
