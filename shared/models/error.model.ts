export interface AppError {
  code: ErrorCodeType;
  message: string;
  payload?: unknown;
}

export const ErrorCode = {
  GenericUnknown: 'ERRORS.GENERIC_UNKNOWN',
};

export type ErrorCodeType = (typeof ErrorCode)[keyof typeof ErrorCode];
