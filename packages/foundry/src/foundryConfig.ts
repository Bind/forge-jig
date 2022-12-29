import * as fs from "fs";
import { findNearest } from "./findNearest";
import * as toml from "toml";
import { ok } from "neverthrow";

const foundryConfigDefaults = {
  default: {
    src: "src",
  },
};

export function parseToml(fileContent: string) {
  //woop-de-do
  return toml.parse(fileContent);
}

export function getFoundryConfig() {
  const result = findNearest("foundry.toml", process.cwd());
  if (result.isOk()) {
    const foundryConfigPath = result.value;
    const fileContent = fs.readFileSync(foundryConfigPath, "utf-8");
    return ok({
      default: {
        ...foundryConfigDefaults.default,
        ...parseToml(fileContent).profile.default,
      },
    });
  }
  return result;
}
