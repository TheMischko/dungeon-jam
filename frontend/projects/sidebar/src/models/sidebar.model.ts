import { RedirectRequest } from '@shared/models/redirect.model';

export interface SidebarItem {
  title: string;
  redirectRequest: RedirectRequest;
  active?: boolean;
  children?: SidebarItem[];
}
