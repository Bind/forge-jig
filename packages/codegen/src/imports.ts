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

function getImportStoragePath(
  layout: StorageLayout,
  context: FoundryContext
): string {
  return layout.sourceUnitPath.replace(context.rootPath + "/", "");
}

export function solidityImportFromStorage(
  layout: StorageLayout,
  context: FoundryContext
) {
  return `import {${layout.importName}} from "${layout.sourceUnitPath.replace(
    context.rootPath + "/",
    ""
  )}";\n`;
}

export function solidityImport(contents: string[], path: string) {
  return `import {${contents.join(", ")}} from "${path}";\n`;
}
type ImportDict = {
  [key: string]: Set<string>;
};

const mergeImportDicts = (a: ImportDict, b: ImportDict) => {
  return Object.keys({ ...a, ...b }).reduce((acc: ImportDict, key: string) => {
    acc[key] = new Set([
      ...(a?.[key]?.values() ?? []),
      ...(b?.[key]?.values() ?? []),
    ]);
    return acc;
  }, {});
};

function addImport(imports: ImportDict, name: string, layout: string) {
  if (typeof imports[layout] == "undefined") {
    imports[layout] = new Set();
  }
  imports[layout].add(name);
  return imports;
}

export function parseImportDict(
  layout: StorageLayout,
  context: FoundryContext
): ImportDict {
  let imports = {};

  const vars = Object.keys(layout.variables);
  vars.forEach((key) => {
    const storageInfo = layout.variables[key];

    if (isStorageInfoStruct(storageInfo)) {
      console.log(storageInfo);
      if (hasMapping(storageInfo)) {
        imports = mergeImportDicts(
          imports,
          parseImportDict(storageInfo.layout, context)
        );
      } else {
        imports = addImport(
          imports,
          storageInfo.layout.importName,
          getImportStoragePath(storageInfo.layout, context)
        );
      }
    } else if (isStorageInfoMapping(storageInfo)) {
      const value = getMappingValue(storageInfo);
      if (isStorageInfoStruct(value)) {
        imports = addImport(
          imports,
          value.layout.importName,
          getImportStoragePath(value.layout, context)
        );
      }
    } else if (isStorageInfoArray(storageInfo)) {
      const value = getArrayValue(storageInfo);
      if (isStorageInfoStruct(value)) {
        imports = addImport(
          imports,
          value.layout.importName,
          getImportStoragePath(value.layout, context)
        );
      }
    }
  });
  return imports;
}

export const generateJigImports = (
  layout: StorageLayout,
  context: FoundryContext
) => {
  const imports = parseImportDict(layout, context);
  console.log(imports);
  return Object.keys(imports)
    .map((k) => {
      return solidityImport([...imports[k].values()], k);
    })
    .join("\n");
};
