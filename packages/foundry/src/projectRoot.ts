import { ok } from "neverthrow";
import * as path from "path";
import { findNearest } from "./findNearest";

export function getProjectRoot() {
  const result = findNearest("foundry.toml", process.cwd());
  if (result.isOk()) {
    const foundryConfig = result.value;
    const foundryConfigPathSegments = path
      .normalize(foundryConfig)
      .split(path.sep);
    foundryConfigPathSegments.pop();

    return ok(foundryConfigPathSegments.join(path.sep));
  }
  return result;
}
