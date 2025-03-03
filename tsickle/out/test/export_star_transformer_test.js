"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const export_star_transformer_1 = require("../src/export_star_transformer");
const transformer_util_1 = require("./transformer_util");
describe('exportStarTransformer', () => {
    it('transforms export * as namespace', () => {
        const input = `export * as ns from './module';`;
        const expected = `import * as ns from './module';\nexport { ns };`;
        expect((0, transformer_util_1.transformCode)(input, (0, export_star_transformer_1.exportStarTransformer)()).trim()).toBe(expected);
    });
    it('ignores regular exports', () => {
        const input = `export { foo } from './module';`;
        expect((0, transformer_util_1.transformCode)(input, (0, export_star_transformer_1.exportStarTransformer)()).trim()).toBe(input);
    });
    it('ignores regular star exports', () => {
        const input = `export * from './module';`;
        expect((0, transformer_util_1.transformCode)(input, (0, export_star_transformer_1.exportStarTransformer)()).trim()).toBe(input);
    });
    it('handles multiple exports', () => {
        const input = `
export * as ns1 from './module1';
export * as ns2 from './module2';
`;
        const expected = `import * as ns1 from './module1';\nexport { ns1 };\nimport * as ns2 from './module2';\nexport { ns2 };`;
        expect((0, transformer_util_1.transformCode)(input, (0, export_star_transformer_1.exportStarTransformer)()).trim()).toBe(expected);
    });
    it('preserves other statements', () => {
        const input = `
import { foo } from './foo';
export * as ns from './module';
const x = 1;
`;
        const expected = `import { foo } from './foo';\nimport * as ns from './module';\nexport { ns };\nconst x = 1;`;
        expect((0, transformer_util_1.transformCode)(input, (0, export_star_transformer_1.exportStarTransformer)()).trim()).toBe(expected);
    });
});
//# sourceMappingURL=export_star_transformer_test.js.map