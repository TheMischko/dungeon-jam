import {Component, computed, effect, inject, OnInit} from '@angular/core';
import {RedirectPath} from '@shared/models/redirect.model';
import {SidebarItem} from '../../models/sidebar.model';
import {SidebarItemComponent} from './sidebar-item/sidebar-item.component';
import {RedirectService} from '@general';
import {PlaylistStore} from '@general/stores/playlist.store';
import {SortDirection} from '@shared/models/common.model';
import {toSignal} from '@angular/core/rxjs-interop';
import {filter} from 'rxjs';
import {StreamSettingsComponent} from '../stream-settings/stream-settings.component';

@Component({
  selector: 'app-sidebar',
  imports: [
    SidebarItemComponent,
    StreamSettingsComponent
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent implements OnInit{
  private readonly redirectService = inject(RedirectService);
  readonly playlistStore = inject(PlaylistStore);
  readonly playlists = this.playlistStore.entities;

  readonly activePath = toSignal(this.redirectService.redirect$.pipe(filter(v => v !== null)), {initialValue: RedirectPath.HOME});

  readonly items = computed<SidebarItem[]>(() => {
    const activePath = this.activePath();
    return [
      {
        title: 'Home',
        redirectPath: RedirectPath.HOME,
        active: activePath === RedirectPath.HOME
      },
      {
        title: 'Library',
        redirectPath: RedirectPath.LIBRARY,
        active: activePath === RedirectPath.LIBRARY
      },
      {
        title: 'Playlists',
        redirectPath: RedirectPath.PLAYLISTS,
        active: activePath === RedirectPath.PLAYLISTS,
        children: this.playlists().map((playlist) => ({
          title: playlist.name,
          redirectPath: RedirectPath.PLAYLISTS
        }))
      }
    ]
  });


  ngOnInit() {
    setTimeout(() => {
      this.playlistStore.load({
        sortBy: 'name',
        sortDirection: SortDirection.ASC
      });
    }, 250);
  }

  constructor() {
    effect(() => {
      console.log('playlists', this.playlists());
    })
  }

  triggerRedirect(path: RedirectPath) {
    this.redirectService.triggerRedirect(path);
  }
}
