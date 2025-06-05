import {Component, inject} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Howl } from 'howler';
import { MatButton } from '@angular/material/button';
import {RedirectService} from '../../../general/src/lib/redirect.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  imports: [MatButton],
})
export class AppComponent {
  private readonly redirectService = inject(RedirectService);
  title = 'main';

  private howler: Howl;
  playing: boolean = false;

  constructor() {
    this.howler = new Howl({
      src: ['lunatic.mp3'],
      volume: 0.5,
    });
  }

  togglePlay() {
    if (this.playing) {
      this.howler.pause();
      this.playing = false;
      return;
    }
    this.howler.play();
    this.playing = true;
  }
}
