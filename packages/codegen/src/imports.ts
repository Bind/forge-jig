import {
  StorageLayout,
  isStorageInfoArray,
  isStorageInfoMapping,
  isStorageInfoStruct,
  StorageInfoStruct,
  StorageInfos,
  isStorageInfo,
  isStorageInfoEnum,
} from "layout";
import { FoundryContext } from "foundry";
import { isSolidityType } from "types";

export function flattenStructLayouts(info: StorageInfos): StorageInfoStruct[] {
  if (isStorageInfoStruct(info)) {
    const structs: StorageInfoStruct[] = Object.keys(info.layout.variables)
      .map((k) => flattenStructLayouts(info.layout.variables[k]))
      .flat();
    return [info, ...structs];
  } else if (isStorageInfo(info)) {
    return [];
  } else if (isStorageInfoEnum(info)) {
    return [];
  } else {
    let value = info.value;
    console.log(info, value);

    if (isSolidityType(value)) {
      return [];
    } else if (isStorageInfoMapping(value)) {
      return flattenStructLayouts(value);
    } else if (isStorageInfoArray(value)) {
      return flattenStructLayouts(value);
    } else if (isStorageInfoStruct(value)) {
      return flattenStructLayouts(value);
    } else {
      console.log(info);
      throw new Error(
        "unhandled type in soliditySetMappingFunctionFromStorageInfo"
      );
    }
  }
}

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

  const storageInfoStructs = Object.keys(layout.variables)
    .map((k) => {
      return flattenStructLayouts(layout.variables[k]);
    })
    .flat();

  storageInfoStructs.forEach((storageInfo) => {
    imports = addImport(
      imports,
      storageInfo.layout.importName,
      getImportStoragePath(storageInfo.layout, context)
    );
  });
  return imports;
}

export const generateJigImports = (
  layout: StorageLayout,
  context: FoundryContext
) => {
  console.log(layout);
  const imports = parseImportDict(layout, context);
  return Object.keys(imports)
    .map((k) => {
      return solidityImport([...imports[k].values()], k);
    })
    .join("\n");
};
