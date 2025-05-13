/**
 * @fileoverview Simple test file for closure compiler
 */

/**
 * Says hello to the given name.
 * @param {string} name
 * @return {string}
 */
function sayHello(name) {
  return `Hello, ${name}!`;
}

/**
 * Main entry point.
 */
function main() {
  const message = sayHello('World');
  console.log(message);
}

main();
