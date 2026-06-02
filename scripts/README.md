# Scripts

This directory is organized by platform:

- `bash/`: scripts for Linux and macOS
- `powershell/`: scripts for Windows PowerShell
- `cmd/`: thin wrappers for `cmd.exe` that invoke the PowerShell scripts

For `pnpm`, use:

- Linux/macOS: `*:linux`
- Windows: `*:win`

Examples:

- `pnpm services:up`
- `pnpm services:down`
- `pnpm dev:up:linux`
- `pnpm dev:up:win`
- `pnpm services:up:linux`
- `pnpm services:up:win`
- `pnpm services:down:linux`
- `pnpm services:down:win`
- `pnpm db:migrate:linux`
- `pnpm db:migrate:win`

The default aliases (`dev:up`, `db:migrate`, etc.) currently point to the Bash variants for compatibility with the existing workflow.

Additional notes:

- `dev:up*` starts shared infrastructure such as Docker services.
- `services:up*` starts the application services.
- `services:down*` stops the application services.
- `services:up` dispatches automatically to the platform-specific launcher.
- `services:down` dispatches automatically to the platform-specific shutdown script.
- On Windows, `services:up:win` tries to use Windows Terminal split panes first and falls back to separate PowerShell windows.
- On Linux, `services:up:linux` tries to use a tiled `tmux` session first and falls back to separate terminal windows.
