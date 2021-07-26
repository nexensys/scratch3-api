import * as babel from "@babel/core";
import fs from "fs";
import path from "path";

const __dirname = path.dirname(import.meta.url);

let files = fs.readdirSync("./src");

if (!fs.existsSync("./dist")) fs.mkdirSync("./dist");
if (!fs.existsSync("./dist/cjs")) fs.mkdirSync("./dist/cjs");
if (!fs.existsSync("./dist/mjs")) fs.mkdirSync("./dist/mjs");
if (!fs.existsSync("./dist/cjs/package.json"))
  fs.writeFileSync(
    "./dist/cjs/package.json",
    `{
  "type": "module"
}`
  );
if (!fs.existsSync("./dist/mjs/package.json"))
  fs.writeFileSync(
    "./dist/mjs/package.json",
    `{
  "type": "module"
}`
  );

for (const file in files) {
  let p = path.resolve(__dirname, "src", file);
  fs.writeFileSync(
    path.resolve(__dirname, "dist/cjs", file),
    babel.transformFileSync(p, {
      configFile: path.resolve(__dirname, "config.json")
    }).code
  );
  fs.writeFileSync(
    path.resolve(__dirname, "dist/mjs", file),
    babel.transformFileSync(p, {
      configFile: path.resolve(__dirname, "moduleconfig.json")
    }).code
  );
}
