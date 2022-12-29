import * as fs from "fs";
import { ok } from "neverthrow";
import { findNearest } from "./findNearest";

export function parseRemappings(fileContent: string) {
  // Filter out empty lines
  return fileContent.split("\n").filter((l) => l !== "");
}

export function getRemappings() {
  const result = findNearest("remappings.txt", process.cwd());
  if (result.isOk()) {
    const remappings_path = result.value;
    const fileContent = fs.readFileSync(remappings_path, "utf-8");
    return ok(parseRemappings(fileContent));
  }
  return result;
}
