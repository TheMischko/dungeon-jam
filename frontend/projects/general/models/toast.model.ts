export interface ToastData {
  title: string;
  description?: string;
  type: ToastType;
}

export enum ToastType {
  Error,
  Success,
  Info,
}
