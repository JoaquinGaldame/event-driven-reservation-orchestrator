type LogLevel = "debug" | "info" | "warn" | "error";

type LogContext = Record<string, unknown>;

function writeLog(level: LogLevel, message: string, context?: LogContext) {
  const log = {
    level,
    message,
    timestamp: new Date().toISOString(),
    service: process.env.SERVICE_NAME ?? "unknown-service",
    ...context
  };

  console.log(JSON.stringify(log));
}

export const logger = {
  debug: (message: string, context?: LogContext) => writeLog("debug", message, context),
  info: (message: string, context?: LogContext) => writeLog("info", message, context),
  warn: (message: string, context?: LogContext) => writeLog("warn", message, context),
  error: (message: string, context?: LogContext) => writeLog("error", message, context)
};