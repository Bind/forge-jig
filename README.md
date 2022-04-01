Jig: a tool used to expedite some repetitive task and ensure that the results do not vary from project to project.

# Why

`vm.store(address, slot, data)` is still fairly hard to reason about.
jig aims to ingest a solidity AST and determine the storage layout. With that layout, jig generates a helper contract that allows you to write to storage variables using the structs defined in your source code.

[forge-std](https://github.com/brockelmore/forge-std) is a major improvement over the native vm.store, but doesn't quite handle writing data to packed slots.

# TODO

- [x] generate storage layout from contract source

  - [x] parse out top level contract storage
  - [x] parse out struct declarations
  - [x] map contract storage vars to slots

    - [x] Mappings
    - [x] Arrays
    - [x] Custom structs
      - [x] packed
      - [x] multi-slot
      - [x] nested

- [x] generate JigContract

  - [x] generate struct imports for helper contract to consume
  - [x] codegen slot storage helper per storage variable

    - [x] builtin solidity type
    - [x] mapping
      - [x] nested mapping
      - [x] struct
      - [x] solidity type
      - [x] array
    - [x] array
      - [x] manage array length
      - [x] nested array
      - [x] struct
      - [x] solidity type
    - [x] struct
      - [x] packed
      - [x] multi-slot
      - [x] nested
      - [x] array
      - [x] solidity type

- [] deep merge foundry.toml default values with local config
- [x] flatten structs to better handle AppStorage pattern

- [] migrate to mono repo
  - [] split out storage layout processing into own package
  - [] split out built-in type processing into own package
- [] refactor codegen to be more recursion focused
  - [] move magic strings into constants file

## About

- uses [pnpm](https://pnpm.io/)
- uses [tsdx](https://tsdx.io/)

Storage Slot Tricks

- multiple structs will not be packed into 1 slot
- structs will always start in a new storage slot
- in order to add an element to an array you must also increment the length
-
