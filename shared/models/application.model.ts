export enum OperatingSystem {
  Windows = 'Windows',
  MacOS = 'MacOS',
  Linux = 'Linux',
}

export interface AppUpdateInfo {
  version: string;
  note: string | null;
}
