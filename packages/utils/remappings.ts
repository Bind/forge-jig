import * as fs from 'fs';
import { findNearest } from './findNearest';

export function parseRemappings(fileContent: string) {
  //woop-de-do
  return fileContent.split('\n');
}

export function getRemappings() {
  try {
    const remappings_path = findNearest('remappings.txt', process.cwd());
    const fileContent = fs.readFileSync(remappings_path, 'utf-8');
    return parseRemappings(fileContent);
  } catch (err) {
    return [];
  }
}
