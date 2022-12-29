import * as path from "path";
import * as fs from "fs";
import { Result } from "neverthrow";

export type UnableToFindFileError = {
  filename: string;
  start: string | undefined;
};

export function findNearest(filename: string, start: string | undefined) {
  const safeImpl = Result.fromThrowable(
    findNearestImpl,
    (): UnableToFindFileError => {
      return {
        filename,
        start,
      };
    }
  );
  return safeImpl(filename, start);
}

function findNearestImpl(filename: string, start: string | undefined): string {
  let pathSegments: string[] = [];
  if (typeof start === "string") {
    if (start[start.length - 1] !== path.sep) {
      start += path.sep;
    }
    start = path.normalize(start);
    pathSegments = start.split(path.sep);
  } else if (require.main?.path) {
    pathSegments = require.main?.path.split(path.sep);
  }
  if (!pathSegments.length) {
    throw new Error(filename + " not found in path");
  }
  // remove trailing '' element
  pathSegments.pop();
  let dir = pathSegments.join(path.sep);
  let fullPath = path.join(dir, filename);

  if (fs.existsSync(fullPath)) {
    return path.normalize(fullPath);
  } else {
    // pop current dir, recurse one dir closer to root
    pathSegments.pop();
    return findNearestImpl(filename, pathSegments.join(path.sep));
  }
}
