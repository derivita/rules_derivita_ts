export declare const classDecorator: (constructor: Function) => void;
export declare const methodDecorator: (value: boolean) => (target: unknown, propertyKey: string, descriptor?: PropertyDescriptor) => void;
export declare const accessorDecorator: (value: boolean) => (target: unknown, propertyKey: string, descriptor?: PropertyDescriptor) => void;
export declare class Person {
    private name_;
    constructor(name: string);
    get name(): string;
    greet(): void;
}
