import { getRemappings, parseRemappings } from "../src/remappings";
const assertions = [
  "ds-test/=/Users/douglasbinder/workspace/forge-fixture/lib/ds-test/src/",
  "forge-std/=/Users/douglasbinder/workspace/forge-fixture/lib/forge-std/src/",
  "solmate/=/Users/douglasbinder/workspace/forge-fixture/lib/solmate/src/",
];
const remappingsFileContents = `ds-test/=/Users/douglasbinder/workspace/forge-fixture/lib/ds-test/src/
forge-std/=/Users/douglasbinder/workspace/forge-fixture/lib/forge-std/src/
solmate/=/Users/douglasbinder/workspace/forge-fixture/lib/solmate/src/`;

describe("successfully parse remappings", () => {
  it("parses mappings correctly", () => {
    const remappings = parseRemappings(remappingsFileContents);
    expect(assertions[0]).toBe(remappings[0]);
    expect(assertions[1]).toBe(remappings[1]);
    expect(assertions[2]).toBe(remappings[2]);
  });
  it("traverses files gets mappings and parses them out", () => {
    const result = getRemappings();
    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value.length).toBeGreaterThan(0);
    }
  });
});
