import { AppError, ErrorCodeType } from '@shared/models/error.model';

export function createAppError(
  code: ErrorCodeType,
  message: string,
  payload?: unknown
): AppError {
  return {
    code,
    message,
    payload,
  };
}
