import { IpcMainInvokeEvent } from 'electron';
import { AppError, ErrorCode } from '@shared/models/error.model';
import { createAppError } from './create-app-error';

type IpcHandlerFn<T> = (
  event: IpcMainInvokeEvent,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ...args: any[]
) => Promise<T>;

export function isAppError(error: unknown): error is AppError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error
  );
}

export function withAppError<T>(fn: IpcHandlerFn<T>): IpcHandlerFn<T> {
  return async (event, ...args) => {
    try {
      return await fn(event, ...args);
    } catch (error) {
      if (isAppError(error)) throw error;
      const message = error instanceof Error ? error.message : String(error);
      throw createAppError(ErrorCode.GenericError, message);
    }
  };
}
