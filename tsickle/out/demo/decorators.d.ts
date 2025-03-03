export declare const classDecorator: (constructor: Function) => void;
export declare const methodDecorator: (value: boolean) => (target: unknown, propertyKey: string, descriptor?: PropertyDescriptor) => void;
export declare const accessorDecorator: (value: boolean) => (target: unknown, propertyKey: string, descriptor?: PropertyDescriptor) => void;
/**
 * @Annotation
 * @param {boolean} value
 * @return {function(?, string, (PropertyDescriptor|undefined)): void}
 */
export declare const annotatedAccessorDecorator: (value: boolean) => (target: unknown, propertyKey: string, descriptor?: PropertyDescriptor) => void;
