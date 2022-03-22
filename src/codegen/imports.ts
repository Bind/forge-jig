import { StorageLayout } from '../storage';
import { isStorageInfoStruct } from '../storage/predicate';
import { FoundryContext } from '../utils/types';

export function solidityImportFromStorage(
  layout: StorageLayout,
  context: FoundryContext
) {
  return `import {${layout.name}} from"${layout.sourceUnitPath.replace(
    context.rootPath + '/',
    ''
  )}";`;
}

export function generateJigImports(
  layout: StorageLayout,
  context: FoundryContext
) {
  let importsContent = '';
  const vars = Object.keys(layout.variables);
  vars.forEach(key => {
    const storageInfo = layout.variables[key];
    if (isStorageInfoStruct(storageInfo)) {
      importsContent += solidityImportFromStorage(storageInfo.layout, context);
    }
  });
  return importsContent;
}
