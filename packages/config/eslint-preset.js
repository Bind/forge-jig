module.exports = {
  extends: ["prettier"],
  settings: {
    next: {
      rootDir: [
        "apps/cli/",
        "packages/ast/",
        "packages/utils/",
        "packages/layout/",
        "packages/config/",
        "packages/codegen/",
        "packages/tsconfig/",
      ],
    },
  },
};
