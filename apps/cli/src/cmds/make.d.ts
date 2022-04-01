import type { Arguments, CommandBuilder } from "yargs";
declare type Options = {
    pattern: string;
};
export declare const command: string;
export declare const desc: string;
export declare const builder: CommandBuilder<Options, Options>;
export declare const handler: (argv: Arguments<Options>) => Promise<void>;
export {};
//# sourceMappingURL=make.d.ts.map