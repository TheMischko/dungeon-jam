import {Component, inject} from '@angular/core';
import { Howl } from 'howler';
import { MatButton } from '@angular/material/button';
import {RouterOutlet} from '@angular/router';
import {RoutingListenerService} from './services/routing-listener.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  imports: [MatButton, RouterOutlet],
})
export class AppComponent {
  private readonly routingListenerService = inject(RoutingListenerService);

  title = 'main';

  private howler: Howl;
  playing: boolean = false;

  constructor() {
    this.routingListenerService.initialize();
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
