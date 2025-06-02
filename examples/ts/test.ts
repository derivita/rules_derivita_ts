import * as goog from 'closure-library/closure/goog/goog.js';

import {EMPTY} from 'closure-library/closure/goog/functions/functions.js';

console.log(EMPTY());
if (goog.DEBUG) {
    console.log('Debug mode is enabled');
} else {
    console.log('Debug mode is disabled');
}
