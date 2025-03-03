"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Person = exports.accessorDecorator = exports.methodDecorator = exports.classDecorator = void 0;
const classDecorator = (constructor) => {
    Object.seal(constructor);
    Object.seal(constructor.prototype);
};
exports.classDecorator = classDecorator;
const methodDecorator = (value) => {
    return (target, propertyKey, descriptor) => {
        if (descriptor) {
            descriptor.enumerable = value;
        }
    };
};
exports.methodDecorator = methodDecorator;
const accessorDecorator = (value) => {
    return (target, propertyKey, descriptor) => {
        if (descriptor) {
            descriptor.configurable = value;
        }
    };
};
exports.accessorDecorator = accessorDecorator;
let Person = class Person {
    constructor(name) {
        this.name_ = name;
    }
    get name() {
        return this.name_;
    }
    greet() {
        console.log(`Hello, my name is ${this.name}.`);
    }
};
exports.Person = Person;
__decorate([
    (0, exports.accessorDecorator)(true)
], Person.prototype, "name", null);
__decorate([
    (0, exports.methodDecorator)(true)
], Person.prototype, "greet", null);
exports.Person = Person = __decorate([
    exports.classDecorator
], Person);
const p = new Person("Ron");
p.greet();
//# sourceMappingURL=decorators.js.map