export const classDecorator = (constructor: Function) => {
  Object.seal(constructor);
  Object.seal(constructor.prototype);
};

export const methodDecorator = (value: boolean) =>{
  return (target: unknown, propertyKey: string, descriptor?: PropertyDescriptor) => {
    if (descriptor) {
      descriptor.enumerable = value;
    }
  };
};

export const accessorDecorator = (value: boolean) => {
  return (target: unknown, propertyKey: string, descriptor?: PropertyDescriptor) => {
    if (descriptor) {
      descriptor.configurable = value;
    }
  };
};


@classDecorator
export class Person {
    private name_: string;
    constructor(name: string) {
        this.name_ = name;
    }

    @accessorDecorator(true)
    get name() {
        return this.name_;
    }
  
    @methodDecorator(true)
    greet() {
        console.log(`Hello, my name is ${this.name}.`);
    }
  }
  
  const p = new Person("Ron");
  p.greet();