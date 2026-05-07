#!/usr/bin/env node
import { scryptSync, randomBytes } from "node:crypto";
import readline from "node:readline";

const SCRYPT_KEYLEN = 64;

function hash(password) {
  const salt = randomBytes(16);
  const out = scryptSync(password.normalize("NFKC"), salt, SCRYPT_KEYLEN);
  return `scrypt$${salt.toString("hex")}$${out.toString("hex")}`;
}

async function readPassword() {
  const arg = process.argv[2];
  if (arg) return arg;
  const rl = readline.createInterface({ input: process.stdin });
  process.stderr.write("Password: ");
  return new Promise((resolve) => {
    rl.once("line", (line) => {
      rl.close();
      resolve(line);
    });
  });
}

const password = await readPassword();
if (!password) {
  console.error("Empty password");
  process.exit(1);
}
console.log(hash(password));
