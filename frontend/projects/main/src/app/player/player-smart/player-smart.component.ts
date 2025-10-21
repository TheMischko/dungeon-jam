import {Component, inject} from '@angular/core';
import {PlayerComponent} from '../player/player.component';
import {PlaybackService} from '../../services/playback.service';
import {toSignal} from '@angular/core/rxjs-interop';
import {initialPlaybackState} from '../../models/playback.model';

@Component({
  selector: 'app-player-smart',
  imports: [
    PlayerComponent
  ],
  templateUrl: './player-smart.component.html',
  styles: ':host{ display: contents }'
})
export class PlayerSmartComponent {
  playbackService = inject(PlaybackService);
  playBackState = toSignal(this.playbackService.playback$, {
    initialValue: initialPlaybackState,
  });

  async play() {
    if(!this.playBackState().isPlaying){
      await this.playbackService.play();
    }
  }

  pause() {
    if(this.playBackState().isPlaying){
      this.playbackService.pause();
    }
  }

  async playNextTrack() {
    await this.playbackService.playNext();
  }

  async playPrevTrack() {
    await this.playbackService.playPrev();
  }

  async seek(newPos: number) {
    const currentTrack = this.playBackState().currentTrack
    if(newPos > 0 && currentTrack && newPos < currentTrack.duration){
      this.playbackService.seek(newPos);
    }
  }

  changeVolume(volume: number) {
    this.playbackService.changeVolume(volume);
  }

  changeRepeat() {
    this.playbackService.changeRepeat();
  }
}
