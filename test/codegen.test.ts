import * as dotenv from 'dotenv';
dotenv.config();
import * as fs from 'fs';
import { compileStorageLayout } from '../src/ast';
import { generateJig } from '../src/codegen';

const CONTRACT_DIR = process.env.CONTRACT_DIR || './contracts/';
const files = fs.readdirSync(CONTRACT_DIR);

const assertions = {
  'basic.sol': {},
} as const;

for (let idx in files) {
  let file = files[idx] as keyof typeof assertions;
  if (typeof assertions?.[file] == 'undefined') continue;
  describe('code gen works', () => {
    it('successfully generates jig contract', async () => {
      const layout = await compileStorageLayout(CONTRACT_DIR + file, 'Basic');
      console.log(generateJig('Basic', layout));
    });
  });
}
