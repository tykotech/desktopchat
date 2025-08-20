// src-deno/util/logger.ts
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

export class Logger {
  private static instance: Logger;
  private logLevel: LogLevel = LogLevel.INFO;
  private logToFile: boolean = false;
  private logFilePath: string = "";

  private constructor() {}

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  enableFileLogging(filePath: string): void {
    this.logToFile = true;
    this.logFilePath = filePath;
    
    // Ensure the directory exists
    const dir = filePath.substring(0, filePath.lastIndexOf('/'));
    try {
      Deno.mkdirSync(dir, { recursive: true });
    } catch (e) {
      if (!(e instanceof Deno.errors.AlreadyExists)) {
        console.error("Failed to create log directory:", e);
      }
    }
  }

  debug(message: string, ...args: any[]): void {
    if (this.logLevel <= LogLevel.DEBUG) {
      this.log("DEBUG", message, ...args);
    }
  }

  info(message: string, ...args: any[]): void {
    if (this.logLevel <= LogLevel.INFO) {
      this.log("INFO", message, ...args);
    }
  }

  warn(message: string, ...args: any[]): void {
    if (this.logLevel <= LogLevel.WARN) {
      this.log("WARN", message, ...args);
    }
  }

  error(message: string, ...args: any[]): void {
    if (this.logLevel <= LogLevel.ERROR) {
      this.log("ERROR", message, ...args);
    }
  }

  private log(level: string, message: string, ...args: any[]): void {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level}] ${message}`;
    
    // Log to console
    switch (level) {
      case "DEBUG":
        console.debug(logMessage, ...args);
        break;
      case "INFO":
        console.info(logMessage, ...args);
        break;
      case "WARN":
        console.warn(logMessage, ...args);
        break;
      case "ERROR":
        console.error(logMessage, ...args);
        break;
      default:
        console.log(logMessage, ...args);
    }
    
    // Log to file if enabled
    if (this.logToFile) {
      try {
        const formattedMessage = `${logMessage} ${args.map(arg => JSON.stringify(arg)).join(" ")}\n`;
        Deno.writeTextFileSync(this.logFilePath, formattedMessage, { append: true });
      } catch (error) {
        console.error("Failed to write to log file:", error);
      }
    }
  }
}

// Export a default logger instance
export const logger = Logger.getInstance();