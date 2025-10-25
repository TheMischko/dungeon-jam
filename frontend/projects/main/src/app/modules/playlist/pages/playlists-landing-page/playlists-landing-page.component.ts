import { Component } from '@angular/core';
import { PlaylistGridSmartComponent } from './playlist-grid/playlist-grid-smart/playlist-grid-smart.component';

@Component({
  selector: 'app-playlists-landing-page',
  imports: [PlaylistGridSmartComponent],
  templateUrl: './playlists-landing-page.component.html',
  styleUrl: './playlists-landing-page.component.scss',
})
export class PlaylistsLandingPageComponent {}
