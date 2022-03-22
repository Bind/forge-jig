import * as dotenv from 'dotenv';
import * as fs from 'fs';
import { compileContractLayout } from '../src/ast';
import { encoder } from '../src/utils/mapping';
dotenv.config();
const CONTRACT_DIR = process.env.CONTRACT_DIR || './contracts/';

const files = fs.readdirSync(CONTRACT_DIR);

const assertions = {
  'basic-mapping.sol': {
    name: 'BasicMapping',
    variables: [
      {
        name: 'test-mapping',
        typeName: 'mapping(uint256 => uint256)',
        slot: 0,
      },
    ],
  },
} as const;

for (let idx in files) {
  let file = files[idx] as keyof typeof assertions;
  if (typeof assertions?.[file] == 'undefined') continue;
  describe('mappings are being handled correctly', () => {
    it('succefully recognizes mappings', async () => {
      const layout = await compileContractLayout(
        CONTRACT_DIR + file,
        assertions[file].name
      );
      for (let vidx in assertions[file].variables) {
        let variable = assertions[file].variables[vidx];
        layout.get(variable.name);
      }
    });
  });
}

describe('mapping slot math is correct', () => {
  it('calculates the basics correctly', () => {
    const hash = encoder('uint256', 'uint256');
    expect(hash(1, 0)).toBe(
      '0xada5013122d395ba3c54772283fb069b10426056ef8ca54750cb9bb552a59e7d'
    );
    expect(hash(2, 0)).toBe(
      '0xabbb5caa7dda850e60932de0934eb1f9d0f59695050f761dc64e443e5030a569'
    );
    expect(hash(3, 0)).toBe(
      '0x101e368776582e57ab3d116ffe2517c0a585cd5b23174b01e275c2d8329c3d83'
    );
  });
});
