import * as path from "path";
import { findNearest } from "./findNearest";

export function getProjectRoot() {
  const foundryConfig = findNearest("foundry.toml", process.cwd());
  const foundryConfigPathSegments = path
    .normalize(foundryConfig)
    .split(path.sep);
  foundryConfigPathSegments.pop();
  return foundryConfigPathSegments.join(path.sep);
}
