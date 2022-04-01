export type FoundryConfig = {
  default: {
    lib: string[];
    out: string;
    remappings: string[];
    src: string;
  };
};
export type FoundryContext = {
  config: FoundryConfig;
  rootPath: string;
  processPath: string;
};
