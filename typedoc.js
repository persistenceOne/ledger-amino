const packageJson = require("./package.json");

module.exports = {
  inputFiles: ["./src"],
  out: "docs",
  exclude: ["**/*.spec.ts", "./src/demo"],
  name: `${packageJson.name} Documentation`,
  readme: "README.md",
  mode: "file",
  excludeExternals: true,
  excludeNotExported: true,
  excludePrivate: true,
};
