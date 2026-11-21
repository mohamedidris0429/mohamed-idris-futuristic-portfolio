import bcrypt from "bcryptjs";
import readline from "node:readline/promises";

let password = process.argv[2];

if (!password) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  password = await rl.question("Owner password: ");
  rl.close();
}

if (!password || password.length < 8) {
  console.error("Choose a password with at least 8 characters.");
  process.exit(1);
}

console.log("");
console.log("Add this line to .env.local (and to your host's environment variables):");
console.log("");
console.log(`OWNER_PASSWORD_HASH=${bcrypt.hashSync(password, 12)}`);
