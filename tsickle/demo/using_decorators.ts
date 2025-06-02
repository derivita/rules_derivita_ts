import { accessorDecorator, annotatedAccessorDecorator, classDecorator, methodDecorator } from "./decorators";

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

    @annotatedAccessorDecorator(true)
    get age() {
        return 42;
    }
  
    @methodDecorator(true)
    greet() {
        console.log(`Hello, my name is ${this.name}.`);
    }
  }
  
  const p = new Person("Ron");
  p.greet();
  
  
  export class Employee {
    constructor(private age_: number) {}
    get age() { return this.age_; }
  }