import * as dotenv from 'dotenv';
dotenv.config();
import * as fs from 'fs';
import { compileStorageLayout } from '../src';
import { encoder } from '../src/utils/mapping';

const files = fs.readdirSync('test/samples/');

const assertions = {
  'basic-mapping.sol': {
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
      const layout = await compileStorageLayout(
        'test/samples/' + file,
        'Basic'
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
