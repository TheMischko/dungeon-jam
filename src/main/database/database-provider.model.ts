export interface GetSomeOptions {
  match?: GetSomeMatch;
  limit?: number;
}

export enum GetSomeMatch {
  EXACT,
  CONTAINS,
  STARTS_WITH,
}

export const DefaultGetSomeOptions: GetSomeOptions = {
  match: GetSomeMatch.EXACT,
};
