import type { Arguments, CommandBuilder } from 'yargs';
import { compileStorageLayouts } from '../ast';
import { generateJig } from '../codegen';
import * as glob from 'glob';
import * as fs from 'fs';

type Options = {
  pattern: string;
  out: string | undefined;
};

export const command: string = 'layout <pattern> [options]';
export const desc: string = 'generate layout for solidity contract';

export const builder: CommandBuilder<Options, Options> = (yargs) =>
  yargs
    .options({ out: { type: 'string', alias: 'o' } })
    .options({ all: { type: 'string', alias: 'a' } })
    .positional('pattern', { type: 'string', demandOption: true });

export const handler = async (argv: Arguments<Options>): Promise<void> => {
  const { out, pattern } = argv;

  const files = glob.sync(pattern);

  for (let i = 0; i < files.length; i++) {
    let file = files[i];

    const layouts = await compileStorageLayouts(file);
    layouts.forEach((layout) => {
      const greeting = `generate storage contract for ${layout.name} from ${file}\n`;
      process.stdout.write(greeting);
      const jig = generateJig(`${layout.name}`, layout);
      if (out) {
        console.log(`writing to ${out + `/${layout.name}Jig.sol`}`);
        fs.writeFileSync(out + `/${layout.name}Jig.sol`, jig);
      } else {
        console.log(jig);
      }
    });
  }

  process.exit(0);
};
