import * as fs from "fs";
import * as path from "path";
import { Injectable } from "injection-js";

@Injectable()
export class LoggerService {
  private logFilePath: string;

  constructor() {
    // Default log file path, you might want to make this configurable
    this.logFilePath = path.join(
      __dirname,
      "..",
      "..",
      "..",
      "logs",
      "extension.log"
    );
    // Ensure the logs directory exists
    const logDir = path.dirname(this.logFilePath);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  private _log(level: string, message: string, ...args: any[]): void {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message} ${
      args.length > 0 ? JSON.stringify(args) : ""
    }\n`;

    fs.appendFile(this.logFilePath, logMessage, (err) => {
      if (err) {
        console.error("Failed to write to log file:", err);
      }
    });
  }

  log(message: string, ...args: any[]): void {
    this._log("log", message, ...args);
  }

  info(message: string, ...args: any[]): void {
    this._log("info", message, ...args);
  }

  warn(message: string, ...args: any[]): void {
    this._log("warn", message, ...args);
  }

  error(message: string, ...args: any[]): void {
    this._log("error", message, ...args);
  }
}
