#!/usr/bin/env node

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
//@ts-ignore
import {} from './cmds/layout';
yargs(hideBin(process.argv))
  // Use the commands directory to scaffold.
  .commandDir('cmds')
  // Enable strict mode.l
  .strict()
  // Useful aliases.
  .alias({ h: 'help' }).argv;
