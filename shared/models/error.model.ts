export interface AppError {
  code: ErrorCodeType;
  message: string;
  payload?: unknown;
}

// The values match i18n strings used on Frontend.
// The source of the translations is at `frontend/i18n/en.json`
export const ErrorCode = {
  GenericError: 'ERRORS.COMMON.GENERIC_ERROR',
  PlaylistIdRequired: 'ERRORS.PLAYLIST.ID_REQUIRED',
  PlaylistIdNotFound: 'ERRORS.PLAYLIST.ID_NOT_FOUND',
};

export type ErrorCodeType = (typeof ErrorCode)[keyof typeof ErrorCode];
