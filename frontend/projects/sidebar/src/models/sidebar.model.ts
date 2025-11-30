import {RedirectPath} from '@shared/models/redirect.model';

export interface SidebarItem{
  title: string,
  redirectPath: RedirectPath,
  active?: boolean,
  children?: SidebarItem[]
}
