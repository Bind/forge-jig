#!/usr/bin/env node
/* eslint @typescript-eslint/no-unused-expressions:0 */
import { generateJig } from "codegen";
import * as glob from "glob";
import * as fs from "fs";
import { compileContractLayouts } from "layout";
import { FoundryContext, getFoundryConfig, getProjectRoot } from "utils";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
yargs(hideBin(process.argv))
  // Enable strict mode.l
  .command(
    "make <pattern> [options]",
    "generate a jig for solidity contract",
    () => {
      return yargs.positional("pattern", {
        type: "string",
        demandOption: true,
      });
    },
    async (argv) => {
      const { pattern } = argv;
      const foundryConfig = getFoundryConfig();
      const projectRoot = getProjectRoot();
      const context: FoundryContext = {
        config: foundryConfig,
        rootPath: projectRoot,
        processPath: process.cwd(),
      };
      const files = glob.sync(pattern);
      for (let i = 0; i < files.length; i++) {
        let file = files[i];
        const layouts = await compileContractLayouts(file);
        layouts.forEach((layout) => {
          const greeting = `crafting jig for ${file}\n`;
          process.stdout.write(greeting);
          const jig = generateJig(`${layout.name}`, layout, context);
          console.log(
            `writing to ${
              foundryConfig.default.src + `/jig/${layout.name}Jig.sol`
            }`
          );
          fs.mkdirSync(
            projectRoot + "/" + foundryConfig.default.src + `/jig/`,
            {
              recursive: true,
            }
          );
          fs.writeFileSync(
            projectRoot +
              "/" +
              foundryConfig.default.src +
              `/jig/${layout.name}Jig.sol`,
            jig,
            {}
          );
        });
      }

      process.exit(0);
    }
  )
  .strict()
  // Useful aliases.
  .alias({ h: "help" }).argv;
