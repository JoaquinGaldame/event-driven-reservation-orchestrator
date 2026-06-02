import { spawn } from "node:child_process";
import { platform } from "node:os";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");

const isWindows = platform() === "win32";

const command = isWindows ? "powershell" : "bash";
const args = isWindows
  ? [
      "-ExecutionPolicy",
      "Bypass",
      "-File",
      resolve(repoRoot, "scripts/powershell/services-up.ps1"),
    ]
  : [resolve(repoRoot, "scripts/bash/services-up.sh")];

const child = spawn(command, args, {
  cwd: repoRoot,
  stdio: "inherit",
  shell: false,
});

child.on("exit", (code) => {
  process.exit(code ?? 0);
});

child.on("error", (error) => {
  console.error("[services:up] Failed to launch platform script:", error.message);
  process.exit(1);
});
