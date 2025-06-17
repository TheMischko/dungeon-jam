import { Component } from '@angular/core';
import {SongsDropInZoneComponent} from './songs-drop-in-zone/songs-drop-in-zone.component';

@Component({
  selector: 'app-library-landing-page',
  imports: [
    SongsDropInZoneComponent
  ],
  templateUrl: './library-landing-page.component.html',
  styleUrl: './library-landing-page.component.scss'
})
export class LibraryLandingPageComponent {

}
