import pc from 'picocolors';
import { Colors } from 'picocolors/types';
import { getLogsDir } from '../configs';
import { generateLogsFilePath } from '../configs/get-logs-dir';
import * as fs from 'node:fs';
import * as path from 'node:path';

export class Logger {
  private static _logsFile: string | null = null;

  private static getLogsFile(): string {
    if (!Logger._logsFile) {
      Logger._logsFile = generateLogsFilePath();
    }
    return Logger._logsFile;
  }

  static initGlobalErrorHandlers(): void {
    const logger = new Logger('GLOBAL_ERROR', 'red');

    process.on('uncaughtException', (error) => {
      logger.logError(error);
    });

    process.on('unhandledRejection', (reason) => {
      logger.logErrorMessage('Unhandled Promise Rejection', {
        reason: String(reason),
      });
    });
  }

  static cleanOldLogs(maxFilesToKeep: number = 5): void {
    try {
      const logDir = getLogsDir();
      if (!fs.existsSync(logDir)) return;

      const files = fs
        .readdirSync(logDir)
        .filter((file) => file.endsWith('.log'))
        .map((file) => {
          const filePath = path.join(logDir, file);
          return {
            name: file,
            path: filePath,
            mtime: fs.statSync(filePath).mtimeMs,
          };
        })
        .sort((a, b) => b.mtime - a.mtime);

      if (files.length > maxFilesToKeep) {
        const filesToDelete = files.slice(maxFilesToKeep);
        for (const file of filesToDelete) {
          fs.unlinkSync(file.path);
        }
      }
    } catch (err) {
      console.error(
        Logger.createMessage('Failed to clean old logs', 'Logger', {
          error: err,
        })
      );
    }
  }

  static log(message: string, owner?: string): void {
    const logMessage = Logger.createMessage(message, owner);
    console.log(logMessage);
    Logger.writeToLogFile(logMessage);
  }

  private static createMessage(
    message: string,
    owner?: string,
    additionalFields?: Record<string, any>
  ): string {
    return JSON.stringify({
      time: new Date().toISOString(),
      ...(owner && { owner: `[${owner}]` }),
      message,
      ...additionalFields,
    });
  }

  private static writeToLogFile(message: string): void {
    try {
      const filePath = Logger.getLogsFile();
      const logDir = path.dirname(filePath);
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }
      fs.appendFileSync(filePath, message + '\n', 'utf-8');
    } catch (err) {
      console.error(
        Logger.createMessage('Failed to write log to file', 'Logger', {
          error: err,
        })
      );
    }
  }

  constructor(
    private owner: string,
    private color?: keyof Omit<Colors, 'isColorSupported'>
  ) {}

  log(message: string, additionalFields?: Record<string, any>): void {
    const logMessage = Logger.createMessage(
      message,
      this.owner,
      additionalFields
    );
    console.log(this.color ? pc[this.color](logMessage) : logMessage);
    Logger.writeToLogFile(logMessage);
  }

  logErrorMessage(
    message: string,
    additionalFields?: Record<string, any>
  ): void {
    const logMessage = Logger.createMessage(message, this.owner, {
      type: 'ERROR',
      ...additionalFields,
    });
    console.log(pc.red(logMessage));
    Logger.writeToLogFile(logMessage);
  }

  logError(error: Error): void {
    this.logErrorMessage(error.message, {
      ...error,
      message: undefined,
      stack: error.stack,
    });
  }

  logWarning(message: string, additionalFields?: Record<string, any>): void {
    const logMessage = Logger.createMessage(message, this.owner, {
      type: 'WARNING',
      ...additionalFields,
    });
    console.log(pc.yellow(logMessage));
    Logger.writeToLogFile(logMessage);
  }
}
