import { MyClass, baz } from "./demo_exports";
import type { SpecialType } from "./demo_exports";

export * from "./demo_exports";

export * as decorators from "./decorators";

const myObj = new MyClass("myObj");

const bazValue: SpecialType = baz();