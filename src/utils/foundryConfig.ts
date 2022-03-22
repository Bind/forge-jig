import * as fs from 'fs';
import { findNearest } from './findNearest';
var toml = require('toml');

export function parseToml(fileContent: string) {
  //woop-de-do
  return toml.parse(fileContent);
}

export function getFoundryConfig() {
  const foundryConfigPath = findNearest('foundry.toml', process.cwd());
  const fileContent = fs.readFileSync(foundryConfigPath, 'utf-8');
  return parseToml(fileContent);
}
