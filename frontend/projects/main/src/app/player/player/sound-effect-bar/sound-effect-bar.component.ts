import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { ActiveSoundEffect } from '../../../services/sound-effects-player.service';
import { SoundEffectBarPillComponent } from './sound-effect-bar-pill/sound-effect-bar-pill.component';
import { SoundEffect } from '@shared/models/sound-effect.model';
import { LucideAngularModule } from 'lucide-angular';
import { SoundEffectControlPillComponent } from './sound-effect-control-pill/sound-effect-control-pill.component';

@Component({
  selector: 'app-sound-effect-bar',
  imports: [
    SoundEffectBarPillComponent,
    LucideAngularModule,
    SoundEffectControlPillComponent,
  ],
  templateUrl: './sound-effect-bar.component.html',
  styleUrl: './sound-effect-bar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SoundEffectBarComponent {
  readonly playingEffects = input<ActiveSoundEffect[]>();
  readonly playingEffectsPositions = input<Record<string, number>>();

  readonly stopSoundEffect = output<string>();
  readonly showDetail = output<SoundEffect>();

  readonly showEffects = signal<boolean>(true);
  readonly wrapperDiv = viewChild<ElementRef<HTMLDivElement>>('wrapper');

  protected toggleShowEffects(): void {
    this.showEffects.update((v) => !v);
  }

  protected emitStopAll() {
    this.playingEffects()?.forEach((soundEffect) => {
      this.stopSoundEffect.emit(soundEffect.id);
    });
  }

  protected scrollPills(event: WheelEvent) {
    const deltaY = event.deltaY;
    const wrapper = this.wrapperDiv();
    if (!wrapper) {
      return;
    }
    wrapper.nativeElement.scrollBy(deltaY * 0.75, 0);
  }
}
