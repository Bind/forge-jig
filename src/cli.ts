#!/usr/bin/env node

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
yargs(hideBin(process.argv))
  // Use the commands directory to scaffold.
  .commandDir('cmds')
  // Enable strict mode.l
  .command(
    '$0',
    'Jig CLI usage',
    () => undefined,
    () => {
      yargs.showHelp();
    }
  )
  .strict()
  // Useful aliases.
  .alias({ h: 'help' }).argv;
