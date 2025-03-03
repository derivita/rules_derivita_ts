"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.annotatedAccessorDecorator = exports.accessorDecorator = exports.methodDecorator = exports.classDecorator = void 0;
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
/**
 * @Annotation
 * @param {boolean} value
 * @return {function(?, string, (PropertyDescriptor|undefined)): void}
 */
const annotatedAccessorDecorator = (value) => {
    return (target, propertyKey, descriptor) => {
        if (descriptor) {
            descriptor.configurable = value;
        }
    };
};
exports.annotatedAccessorDecorator = annotatedAccessorDecorator;
//# sourceMappingURL=decorators.js.map