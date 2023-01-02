#!/usr/bin/env node
/* eslint @typescript-eslint/no-unused-expressions:0 */
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { cmdArgs as makeArgs } from "./cmds/make";

yargs(hideBin(process.argv))
  .command(...makeArgs)
  .alias({ h: "help" }).argv;
