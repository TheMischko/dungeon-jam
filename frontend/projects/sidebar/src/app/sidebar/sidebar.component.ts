import {Component, inject, signal} from '@angular/core';
import {RedirectPath} from '@shared/models/redirect.model';
import {SidebarItem} from '../../models/sidebar.model';
import {SidebarItemComponent} from './sidebar-item/sidebar-item.component';
import {RedirectService} from '../../../../general/src/lib/redirect.service';

@Component({
  selector: 'app-sidebar',
  imports: [
    SidebarItemComponent
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  private readonly redirectService = inject(RedirectService);
  readonly items = signal<SidebarItem[]>([
    {
      title: 'Home',
      redirectPath: RedirectPath.HOME,
    },
    {
      title: 'Library',
      redirectPath: RedirectPath.LIBRARY
    },
    {
      title: 'Playlists',
      redirectPath: RedirectPath.PLAYLISTS
    }
  ])

  triggerRedirect(path: RedirectPath) {
    this.redirectService.triggerRedirect(path);
  }
}
