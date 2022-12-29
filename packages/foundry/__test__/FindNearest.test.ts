import { findNearest } from "../src/findNearest";
describe("findNearest file in local folder structure", () => {
  it("returns an error result if not found", () => {
    const test_file = "test_file.asdf";
    const result = findNearest(test_file, process.cwd().toString());
    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error.filename).toBe(test_file);
    }
  });
  it("finds local remappings.txt", () => {
    const result = findNearest("remappings.txt", process.cwd().toString());
    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value).toBeTruthy();
    }
  });
  it("finds remappings in parent folder", () => {
    const result = findNearest(
      "remappings.txt",
      process.cwd().toString() + "/test"
    );
    expect(result.isOk()).toBe(true);
  });
});
