import { findNearest } from '../src/utils/findNearest';
import { getRemappings, parseRemappings } from '../src/utils/mappings';
const assertions = [
  'ds-test/=/Users/douglasbinder/workspace/forge-fixture/lib/ds-test/src/',
  'forge-std/=/Users/douglasbinder/workspace/forge-fixture/lib/forge-std/src/',
  'solmate/=/Users/douglasbinder/workspace/forge-fixture/lib/solmate/src/',
];
const remappingsFileContents = `ds-test/=/Users/douglasbinder/workspace/forge-fixture/lib/ds-test/src/
forge-std/=/Users/douglasbinder/workspace/forge-fixture/lib/forge-std/src/
solmate/=/Users/douglasbinder/workspace/forge-fixture/lib/solmate/src/`;

describe('successfully parse remappings', () => {
  it('finds local remappings.txt', () => {
    const path = findNearest('remappings.txt', process.cwd().toString());
    expect(path).toBe(process.cwd() + '/remappings.txt');
    const path2 = findNearest(
      'remappings.txt',
      process.cwd().toString() + '/test'
    );
    expect(path2).toBe(process.cwd() + '/remappings.txt');
  });
  it('parses mappings correctly', () => {
    const remappings = parseRemappings(remappingsFileContents);
    expect(assertions[0]).toBe(remappings[0]);
    expect(assertions[1]).toBe(remappings[1]);
    expect(assertions[2]).toBe(remappings[2]);
  });
  it('traverses files gets mappings and parses them out', () => {
    const remappings = getRemappings();
    expect(assertions[0]).toBe(remappings[0]);
    expect(assertions[1]).toBe(remappings[1]);
    expect(assertions[2]).toBe(remappings[2]);
  });
});
