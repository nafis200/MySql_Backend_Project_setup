import config from "../app/config";

type LogLevel = "error" | "warn" | "info" | "debug";
type LogMeta = Record<string, unknown>;

const LEVELS: Record<LogLevel, number> = { error: 0, warn: 1, info: 2, debug: 3 };

const COLORS: Record<LogLevel, string> = {
  error: "\x1b[31m",
  warn: "\x1b[33m",
  info: "\x1b[36m",
  debug: "\x1b[90m",
};
const RESET = "\x1b[0m";

const serializeError = (err: unknown) =>
  err instanceof Error ? { name: err.name, message: err.message, stack: err.stack } : err;

const write = (level: LogLevel, message: string, meta?: LogMeta) => {
  if (LEVELS[level] > LEVELS[config.logLevel]) return;

  const timestamp = new Date().toISOString();
  const data = meta?.error ? { ...meta, error: serializeError(meta.error) } : meta;
  const stream = level === "error" || level === "warn" ? process.stderr : process.stdout;

  if (config.isProduction) {
    // One JSON object per line: easy to ship to Loki / ELK / CloudWatch.
    stream.write(JSON.stringify({ timestamp, level, message, ...data }) + "\n");
    return;
  }

  const tag = `${COLORS[level]}${level.toUpperCase().padEnd(5)}${RESET}`;
  const extra = data && Object.keys(data).length ? ` ${JSON.stringify(data)}` : "";
  stream.write(`${timestamp} ${tag} ${message}${extra}\n`);

  const stack = (data?.error as { stack?: string } | undefined)?.stack;
  if (stack) stream.write(`${stack}\n`);
};

const logger = {
  error: (message: string, meta?: LogMeta) => write("error", message, meta),
  warn: (message: string, meta?: LogMeta) => write("warn", message, meta),
  info: (message: string, meta?: LogMeta) => write("info", message, meta),
  debug: (message: string, meta?: LogMeta) => write("debug", message, meta),
};

export default logger;
