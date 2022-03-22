import * as dotenv from 'dotenv';
import * as fs from 'fs';
import { compileContractLayout } from '../src/ast';
import { generateJig } from '../src/codegen';
import { assertions } from './AST.test';
import { getFoundryConfig } from '../src/utils/foundryConfig';
import { getProjectRoot } from '../src/utils/projectRoot';
import { FoundryContext } from '../src/utils/types';
dotenv.config();
const CONTRACT_DIR = process.env.CONTRACT_DIR || './contracts/';
const files = fs.readdirSync(CONTRACT_DIR);
const foundryConfig = getFoundryConfig();
const projectRoot = getProjectRoot();
const context: FoundryContext = {
  config: foundryConfig,
  rootPath: projectRoot,
  processPath: process.cwd(),
};
const isolate: string[] = ['basic-struct.sol'];
for (let idx in files) {
  let file = files[idx] as keyof typeof assertions;
  if (isolate.length > 0 && !isolate.includes(file as string)) continue;
  if (typeof assertions?.[file] == 'undefined') continue;
  describe(file + ': code gen works', () => {
    it('successfully generates jig contract', async () => {
      const layout = await compileContractLayout(
        CONTRACT_DIR + file,
        assertions[file].name
      );
      console.log(generateJig(assertions[file].name, layout, context));
    });
  });
}
