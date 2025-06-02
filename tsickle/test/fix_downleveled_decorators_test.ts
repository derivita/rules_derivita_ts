import * as ts from 'typescript';
import {fixDownleveledDecorators} from '../src/fix_downleveled_decorators';
import {transformCode} from './transformer_util';

describe('fixDownleveledDecorators', () => {
  it('converts class expression to class declaration in variable declaration', () => {
    const input = `let Person = class Person { 
      constructor() {}
      method() {}
    };`;
    const expected = `class Person {
    constructor() { }
    method() { }
};`;
    expect(transformCode(input, fixDownleveledDecorators()).trim()).toBe(expected);
  });

  it('preserves non-class variable declarations', () => {
    const input = `let x = 5;
let Person = class Person {};
let y = "test";`;
    const expected = `let x = 5;
class Person {
};
let y = "test";`;
    expect(transformCode(input, fixDownleveledDecorators()).trim()).toBe(expected);
  });

  it('handles multiple class expressions in the same file', () => {
    const input = `let Person = class Person {};
let Employee = class Employee {};`;
    const expected = `class Person {
};
class Employee {
};`;
    expect(transformCode(input, fixDownleveledDecorators()).trim()).toBe(expected);
  });

  it('preserves class methods and properties', () => {
    const input = `let Person = class Person {
      name: string;
      constructor(n: string) { this.name = n; }
      greet() { return "Hello " + this.name; }
    };`;
    const expected = `class Person {
    name: string;
    constructor(n: string) { this.name = n; }
    greet() { return "Hello " + this.name; }
};`;
    expect(transformCode(input, fixDownleveledDecorators()).trim()).toBe(expected);
  });

  it('ignores regular class declarations', () => {
    const input = `class Person { 
    constructor() { } 
}`;
    // Normalize whitespace for comparison
    const normalized = (s: string) => s.replace(/\s+/g, ' ').trim();
    expect(normalized(transformCode(input, fixDownleveledDecorators()))).toBe(normalized(input));
  });

  it('handles class expressions with decorators', () => {
    const input = `let Person = class Person {
      @propertyDecorator
      name: string;
      
      @methodDecorator
      greet() {}
    };`;
    const expected = `class Person {
    @propertyDecorator
    name: string;
    @methodDecorator
    greet() { }
};`;
    expect(transformCode(input, fixDownleveledDecorators()).trim()).toBe(expected);
  });

  it('preserves comments and decorators', () => {
    const input = `
    /** Person class documentation */
    let Person = class Person {
      /** name property */
      @propertyDecorator
      name: string;
    };`;
    const expected = `/** Person class documentation */
class Person {
    /** name property */
    @propertyDecorator
    name: string;
};`;
    expect(transformCode(input, fixDownleveledDecorators()).trim()).toBe(expected);
  });
});