"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MyClass = exports.baz = exports.bar = exports.foo = void 0;
function foo() {
    return "foo";
}
exports.foo = foo;
function bar() {
    return "bar";
}
exports.bar = bar;
function baz() {
    return "baz";
}
exports.baz = baz;
class MyClass {
    constructor(objName) {
        this.objName = objName;
    }
    getName() {
        return this.objName;
    }
}
exports.MyClass = MyClass;
//# sourceMappingURL=demo_exports.js.map