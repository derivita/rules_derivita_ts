/**
 * @fileoverview Main application entry point
 */

import {createGreeting, createFormalGreeting} from 'test.lib.greeter/greeter.js';
import {log, LogLevel} from 'test.lib.logger/logger.js';
import {formatCurrency} from 'closure_test/src/default_pkg/util.js';

// Test basic greeting
const greeting = createGreeting('World');
log(greeting);

// Test formal greeting with different log level
const formalGreeting = createFormalGreeting('Distinguished Guest');
log(formalGreeting, LogLevel.INFO);

// Test direct package import without extension
const directGreeting = createGreeting('Direct Import');
log(directGreeting, LogLevel.WARN);

// Test default package import
const price = formatCurrency(42.99);
log(`Price: ${price}`, LogLevel.INFO);
