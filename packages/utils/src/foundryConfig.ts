import * as fs from "fs";
import { findNearest } from "./findNearest";
var toml = require("toml");

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
  const foundryConfigPath = findNearest("foundry.toml", process.cwd());
  const fileContent = fs.readFileSync(foundryConfigPath, "utf-8");
  return {
    default: {
      ...foundryConfigDefaults.default,
      ...parseToml(fileContent).default,
    },
  };
}
