import type { Arguments, CommandBuilder } from "yargs";
import { compileContractLayouts } from "@forge-jig/layout";
import { generateJig } from "@forge-jig/codegen";
import * as glob from "glob";
import * as fs from "fs";
import {
  getFoundryConfig,
  FoundryContext,
  getProjectRoot,
} from "@forge-jig/foundry";
type Options = {
  pattern: string;
};

export const command: string = "make <pattern> [options]";
export const desc: string = "generate a jig for solidity contract";

export const builder: CommandBuilder<Options, Options> = (yargs) =>
  yargs.positional("pattern", { type: "string", demandOption: true });

export const handler = async (argv: Arguments<Options>): Promise<void> => {
  const { pattern } = argv;
  const foundryConfigResult = getFoundryConfig();
  const projectRootResult = getProjectRoot();

  if (foundryConfigResult.isOk() && projectRootResult.isOk()) {
    const foundryConfig = foundryConfigResult.value;
    const projectRoot = projectRootResult.value;

    console.log(foundryConfig);
    const context: FoundryContext = {
      config: foundryConfig,
      rootPath: projectRoot,
      processPath: process.cwd(),
    };
    const files = glob.sync(pattern);
    for (let i = 0; i < files.length; i++) {
      let file = files[i];
      const compileResults = await compileContractLayouts(file);
      if (compileResults.isOk()) {
        const layouts = compileResults.value;
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
      } else {
        // Handle Compilation Errors here
      }
    }
  } else {
    // Handle Setup Errors here
  }
  process.exit(0);
};
