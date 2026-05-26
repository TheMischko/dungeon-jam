import { Component, computed, inject, OnInit } from '@angular/core';
import { RedirectPath, RedirectRequest } from '@shared/models/redirect.model';
import { SidebarItem } from '../../models/sidebar.model';
import { SidebarItemComponent } from './sidebar-item/sidebar-item.component';
import { RedirectService } from '@general';
import { PlaylistStore } from '@general/stores/playlist.store';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import { StreamSettingsComponent } from '../stream-settings/stream-settings.component';

@Component({
  selector: 'app-sidebar',
  imports: [SidebarItemComponent, StreamSettingsComponent],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent implements OnInit {
  private readonly redirectService = inject(RedirectService);
  readonly playlistStore = inject(PlaylistStore);
  readonly playlists = this.playlistStore.entities;

  readonly activePath = toSignal(
    this.redirectService.redirect$.pipe(filter((v) => v !== null)),
    { initialValue: null }
  );

  readonly items = computed<SidebarItem[]>(() => {
    const activeRequest = this.activePath();
    const activePath = activeRequest?.path ?? RedirectPath.HOME;
    return [
      {
        title: 'Home',
        redirectRequest: { path: RedirectPath.HOME },
        active: activePath === RedirectPath.HOME,
      },
      {
        title: 'Library',
        redirectRequest: { path: RedirectPath.LIBRARY },
        active: activePath === RedirectPath.LIBRARY,
      },
      {
        title: 'Playlists',
        redirectRequest: { path: RedirectPath.PLAYLISTS },
        active: activePath === RedirectPath.PLAYLISTS,
        children: this.playlists().map((playlist) => ({
          title: playlist.name,
          redirectRequest: {
            path: RedirectPath.PLAYLISTS,
            params: { playlistId: playlist.id },
          },
          active:
            activePath === RedirectPath.PLAYLISTS &&
            activeRequest?.params?.['playlistId'] === playlist.id,
        })),
      },
      {
        title: 'Sound Effects',
        redirectRequest: { path: RedirectPath.SOUND_EFFECTS },
        active: activePath === RedirectPath.SOUND_EFFECTS,
      },
      {
        title: 'Scenes',
        redirectRequest: { path: RedirectPath.SCENES },
        active:
          activePath === RedirectPath.SCENES ||
          activePath === RedirectPath.SESSIONS,
        children: [
          {
            title: 'Scenes',
            redirectRequest: { path: RedirectPath.SCENES },
            active: activePath === RedirectPath.SCENES,
          },
          {
            title: 'Sessions',
            redirectRequest: { path: RedirectPath.SESSIONS },
            active: activePath === RedirectPath.SESSIONS,
          },
        ],
      },
      {
        title: 'Tags',
        redirectRequest: { path: RedirectPath.TAGS },
        active: activePath === RedirectPath.TAGS,
      },
      {
        title: 'Settings',
        redirectRequest: { path: RedirectPath.SETTINGS },
        active: activePath === RedirectPath.SETTINGS,
      },
    ];
  });

  ngOnInit() {
    setTimeout(() => {
      this.playlistStore.load({});
    }, 250);
  }

  triggerRedirect(request: RedirectRequest) {
    this.redirectService.triggerRedirect(request);
  }
}
