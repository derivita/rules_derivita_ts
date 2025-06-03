export function foo() {
  return "foo";
}

export function bar() {
  return "bar";
}

export type SpecialType = string | number;
export function baz() : SpecialType {
  return "baz";
}

export class MyClass {
  constructor(private objName: string) {}

  getName() {
    return this.objName;
  }
}