import type { Arguments, CommandBuilder } from 'yargs';
import { compileStorageLayout } from '../ast';
import { generateJig } from '../codegen';
import * as fs from 'fs';

type Options = {
  contractName: string;
  file: string;
  out: string | undefined;
};

export const command: string = 'layout <contractName> <file> [options]';
export const desc: string = 'generate layout for solidity contract';

export const builder: CommandBuilder<Options, Options> = (yargs) =>
  yargs
    .options({ out: { type: 'string', alias: 'o' } })
    .positional('contractName', { type: 'string', demandOption: true })
    .positional('file', { type: 'string', demandOption: true });

export const handler = async (argv: Arguments<Options>): Promise<void> => {
  const { out, contractName, file } = argv;
  const greeting = `generate storage contract for ${contractName} from ${file}`;
  process.stdout.write(greeting);

  const layout = await compileStorageLayout(file, contractName);
  const jig = generateJig(contractName, layout);
  if (out) {
    fs.writeFileSync(out, jig);
  } else {
    console.log(jig);
  }
  process.exit(0);
};
