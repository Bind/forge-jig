import {
  StorageLayout,
  isStorageInfoArray,
  isStorageInfoMapping,
  isStorageInfoStruct,
  hasMapping,
} from "layout";
import { FoundryContext } from "foundry";
import { getArrayValue } from "./array";
import { getMappingValue } from "./mapping";

export function solidityImportFromStorage(
  layout: StorageLayout,
  context: FoundryContext
) {
  return `import {${layout.name}} from"${layout.sourceUnitPath.replace(
    context.rootPath + "/",
    ""
  )}";\n`;
}

export function generateJigImports(
  layout: StorageLayout,
  context: FoundryContext
) {
  let importsContent = "";
  const vars = Object.keys(layout.variables);
  vars.forEach((key) => {
    const storageInfo = layout.variables[key];
    if (isStorageInfoStruct(storageInfo)) {
      importsContent += solidityImportFromStorage(storageInfo.layout, context);
      if (hasMapping(storageInfo)) {
        importsContent += generateJigImports(storageInfo.layout, context);
      } else {
        importsContent += solidityImportFromStorage(
          storageInfo.layout,
          context
        );
      }
    } else if (isStorageInfoMapping(storageInfo)) {
      const value = getMappingValue(storageInfo);
      if (isStorageInfoStruct(value)) {
        importsContent += solidityImportFromStorage(value.layout, context);
      }
    } else if (isStorageInfoArray(storageInfo)) {
      const value = getArrayValue(storageInfo);
      if (isStorageInfoStruct(value)) {
        importsContent += solidityImportFromStorage(value.layout, context);
      }
    }
  });
  return importsContent;
}
