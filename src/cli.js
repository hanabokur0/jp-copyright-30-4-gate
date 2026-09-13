#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { evaluateArticle30_4 } from "./gate.js";
import { createReceipt } from "./receipt.js";

const path = process.argv[2];
if (!path) {
  console.error("Usage: node src/cli.js <input.json>");
  process.exit(2);
}

try {
  const input = JSON.parse(await readFile(path, "utf8"));
  const evaluation = evaluateArticle30_4(input);
  const receipt = createReceipt(input, evaluation);
  process.stdout.write(`${JSON.stringify(receipt, null, 2)}\n`);
} catch (error) {
  console.error(error?.stack ?? String(error));
  process.exit(1);
}
