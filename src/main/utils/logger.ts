import pc from 'picocolors';
import { Colors } from 'picocolors/types';

export class Logger {
  static log(message: string, owner?: string): void {
    console.log(Logger.createMessage(message, owner));
  }

  private static createMessage(
    message: string,
    owner?: string,
    additionalFields?: Record<string, any>,
  ): string {
    return JSON.stringify({
      time: new Date().toISOString(),
      ...(owner && { owner: `[${owner}]` }),
      message,
      ...additionalFields,
    });
  }

  constructor(
    private owner: string,
    private color?: keyof Omit<Colors, 'isColorSupported'>,
  ) {}

  log(message: string, additionalFields?: Record<string, any>): void {
    const logMessage = Logger.createMessage(
      message,
      this.owner,
      additionalFields,
    );
    console.log(this.color ? pc[this.color](logMessage) : logMessage);
  }

  logErrorMessage(
    message: string,
    additionalFields?: Record<string, any>,
  ): void {
    console.log(
      pc.red(
        Logger.createMessage(message, this.owner, {
          type: 'ERROR',
          ...additionalFields,
        }),
      ),
    );
  }

  logError(error: Error): void {
    this.logErrorMessage(error.message, { ...error, message: undefined });
  }

  logWarning(message: string, additionalFields?: Record<string, any>): void {
    console.log(
      pc.yellow(
        Logger.createMessage(message, this.owner, {
          type: 'WARNING',
          ...additionalFields,
        }),
      ),
    );
  }
}
