"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Employee = exports.Person = void 0;
const decorators_1 = require("./decorators");
let Person = class Person {
    constructor(name) {
        this.name_ = name;
    }
    get name() {
        return this.name_;
    }
    get age() {
        return 42;
    }
    greet() {
        console.log(`Hello, my name is ${this.name}.`);
    }
};
exports.Person = Person;
__decorate([
    (0, decorators_1.accessorDecorator)(true)
], Person.prototype, "name", null);
__decorate([
    (0, decorators_1.annotatedAccessorDecorator)(true)
], Person.prototype, "age", null);
__decorate([
    (0, decorators_1.methodDecorator)(true)
], Person.prototype, "greet", null);
exports.Person = Person = __decorate([
    decorators_1.classDecorator
], Person);
const p = new Person("Ron");
p.greet();
class Employee {
    constructor(age_) {
        this.age_ = age_;
    }
    get age() { return this.age_; }
}
exports.Employee = Employee;
//# sourceMappingURL=using_decorators.js.map