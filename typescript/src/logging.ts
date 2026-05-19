const LOGGER_NAME = "algopay";

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  SILENT = 4,
}

function parseLevel(level: string | number): LogLevel {
  if (typeof level === "number") return level;
  switch (level.toUpperCase()) {
    case "DEBUG":
      return LogLevel.DEBUG;
    case "INFO":
      return LogLevel.INFO;
    case "WARN":
    case "WARNING":
      return LogLevel.WARN;
    case "ERROR":
      return LogLevel.ERROR;
    case "SILENT":
      return LogLevel.SILENT;
    default:
      return LogLevel.INFO;
  }
}

let globalLevel: LogLevel = LogLevel.INFO;

export function configureLogging(level: string | number = "INFO"): void {
  globalLevel = parseLevel(level);
}

export interface Logger {
  debug(message: string, ...args: unknown[]): void;
  info(message: string, ...args: unknown[]): void;
  warn(message: string, ...args: unknown[]): void;
  error(message: string, ...args: unknown[]): void;
}

export function getLogger(name?: string): Logger {
  const prefix = name ? `${LOGGER_NAME}.${name}` : LOGGER_NAME;

  function fmt(levelTag: string, message: string): string {
    const ts = new Date().toISOString();
    return `[${ts}] ${levelTag} [${prefix}] ${message}`;
  }

  return {
    debug(message: string, ...args: unknown[]) {
      if (globalLevel <= LogLevel.DEBUG) console.debug(fmt("DEBUG", message), ...args);
    },
    info(message: string, ...args: unknown[]) {
      if (globalLevel <= LogLevel.INFO) console.info(fmt("INFO", message), ...args);
    },
    warn(message: string, ...args: unknown[]) {
      if (globalLevel <= LogLevel.WARN) console.warn(fmt("WARN", message), ...args);
    },
    error(message: string, ...args: unknown[]) {
      if (globalLevel <= LogLevel.ERROR) console.error(fmt("ERROR", message), ...args);
    },
  };
}
