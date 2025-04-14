/**
 * @fileoverview Normal source that imports from generated file
 */

import {generateMessage} from 'test.generated/gen_exportable.js';
import {greetFromGenerated} from './gen_importer.js';  // Test relative import of generated file

// Call both generated functions
console.log(generateMessage());
greetFromGenerated('Test');
