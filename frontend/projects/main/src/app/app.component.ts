import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Howl } from 'howler';
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  imports: [MatButton],
})
export class AppComponent {
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
