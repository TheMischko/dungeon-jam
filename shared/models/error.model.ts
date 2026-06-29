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
  // Database
  DatabaseInsertFailed: 'ERRORS.DATABASE.INSERT_FAILED',
  DatabaseUpdateFailed: 'ERRORS.DATABASE.UPDATE_FAILED',
  DatabaseDeleteFailed: 'ERRORS.DATABASE.DELETE_FAILED',
  DatabaseNotFound: 'ERRORS.DATABASE.NOT_FOUND',
  DatabaseQueryFailed: 'ERRORS.DATABASE.QUERY_FAILED',
  // Discord
  DiscordTokenConnectionFailed: 'ERRORS.DISCORD.TOKEN_CONNECTION_FAILED',
  DiscordChannelJoinFailed: 'ERRORS.DISCORD.CHANNEL_JOIN_FAILED',
  DiscordConnectionLost: 'ERRORS.DISCORD.CONNECTION_LOST',
  DiscordApiError: 'ERRORS.DISCORD.API_ERROR',
};

export type ErrorCodeType = (typeof ErrorCode)[keyof typeof ErrorCode];
