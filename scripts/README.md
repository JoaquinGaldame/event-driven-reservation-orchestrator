# Scripts

This directory is organized by platform:

- `bash/`: scripts for Linux and macOS
- `powershell/`: scripts for Windows PowerShell
- `cmd/`: thin wrappers for `cmd.exe` that invoke the PowerShell scripts

For `pnpm`, use:

- Linux/macOS: `*:linux`
- Windows: `*:win`

Examples:

- `pnpm dev:up:linux`
- `pnpm dev:up:win`
- `pnpm db:migrate:linux`
- `pnpm db:migrate:win`

The default aliases (`dev:up`, `db:migrate`, etc.) currently point to the Bash variants for compatibility with the existing workflow.
