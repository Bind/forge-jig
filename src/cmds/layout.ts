import type { Arguments, CommandBuilder } from 'yargs';

type Options = {
  contractName: string;
  file: string;
};

export const command: string = 'layout <contract name> <path>';
export const desc: string = 'generate layout for solidity contract';

export const builder: CommandBuilder<Options, Options> = (yargs) =>
  yargs
    .positional('contractName', { type: 'string', demandOption: true })
    .positional('file', { type: 'string', demandOption: true });

export const handler = (argv: Arguments<Options>): void => {
  const { contractName, file } = argv;
  const greeting = `generate storage for ${contractName} from at ${file}!`;
  process.stdout.write(greeting);
  process.exit(0);
};
