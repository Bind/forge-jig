Jig: a tool used to expedite some repetitive task and ensure that the results do not vary from project to project.

# Why

`vm.store(address, slot, data)` is still fairly hard to reason about.
Forge-fixtures aims to ingest an solidity AST, determine the storage layout, and generate a HelperContract to be consumed in your tests write to specific storage slots.

[forge-std](https://github.com/brockelmore/forge-std) is a major improvement over the native vm.store, but doesn't quite handle writing data to packed slots.

# TODO

- [x] parse out top level contract storage
- [x] parse out struct declarations
- [x] automate testing of slot parsing
- [ ] map contract storage vars to slots

  - [x] Mappings
  - [x] Arrays
  - [ ] Custom structs
    - [ ] Packed Struct
    - [ ] Multi Slot Struct

- [x] generate HelperContract
  - [x] helper methods per variable for better DX
  - [x] nested mapping helpers
  - [ ] store custom struct into packed slot
  - [ ] nested mapping custom struct into packed slot
  - [ ] generate contract imports for helper functions to consume
- [ ] improve DX with storage slot shenanigans
  - [ ] Make sure to increase the length an array when adding an element

## About

- uses [pnpm](https://pnpm.io/)
- uses [tsdx](https://tsdx.io/)

Storage Slot Tricks

- multiple structs will not be packed into 1 slot
- structs will always start in a new storage slot
- in order to add an element to an arraym you must also increment the length
-
