# Why

`vm.store(address, slot, data)` is still fairly hard to reason about.
Forge-fixtures aims to ingest an solidity AST, determine the storage layout, and generate a HelperContract to be consumed in your tests write to specific storage slots.

[forge-std](https://github.com/brockelmore/forge-std) is a major improvement over the native vm.store, but doesn't quite handle writing data to packed slots.

# TODO

- [ ] parse out top level contract storage
- [ ] parse out struct declarations
- [ ] automate testing of slot parsing
- [ ] map contract storage vars to slots
  - [ ] Mappings
  - [ ] Arrays
  - [ ] Custom structs
- [ ] generate HelperContract
  - [ ] helper methods per variable for better DX
  - [ ] store custom struct into packed slot
- [ ] improve DX with storage slot shenanigans
  - [ ] Make sure to increase the length an array when adding an element

## About

- uses [pnpm](https://pnpm.io/)
- uses [tsdx](https://tsdx.io/)
