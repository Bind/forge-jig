import {
  AddressType,
  ArrayType,
  ArrayTypeName,
  BoolType,
  BuiltinType,
  BytesType,
  ElementaryTypeName,
  FixedBytesType,
  FunctionType,
  IntLiteralType,
  IntType,
  Mapping,
  MappingType,
  ModuleType,
  PointerType,
  StringLiteralType,
  StringType,
  TupleType,
  TypeNameType,
  TypeNode,
  UserDefinedType,
  UserDefinedTypeName,
} from 'solc-typed-ast';

// VEERRRY ROUGH, will change

// Mapping, array, enum, structs
type StorageDeclaration = UserDefinedTypeName | Mapping | ArrayTypeName;

// Everything else
type StorageTypes =
  | AddressType
  | ArrayType
  | BoolType
  | BuiltinType
  | BytesType
  | FixedBytesType
  | FunctionType
  | IntLiteralType
  | IntType
  | MappingType
  | ModuleType
  | PointerType
  | StringLiteralType
  | StringType
  | TupleType
  | TypeNameType
  | TypeNode
  | UserDefinedType;
