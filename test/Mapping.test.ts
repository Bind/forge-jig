import * as dotenv from 'dotenv';
dotenv.config();
import * as fs from 'fs';
import { compileStorageLayout } from '../src';

const files = fs.readdirSync('test/samples/');

const assertions = {
  'basic-mapping.sol': {
    'test-mapping': { typeName: 'mapping(uint256 => uint256)', slot: 0 },
  },
} as const;

for (let idx in files) {
  let file = files[idx];
  if (!assertions[file]) continue;
  describe('analyzed mapping', async () => {
    const layout = await compileStorageLayout('test/samples/' + file, 'Basic');
  });
}
