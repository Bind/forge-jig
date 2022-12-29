import { findNearest } from "../src/findNearest";
describe("findNearest file in local folder structure", () => {
  findNearest("test_file.asdf", process.cwd().toString());
});
