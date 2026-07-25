import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { SoundEffect } from '@shared/models/sound-effect.model';
import { NgStyle } from '@angular/common';
import { actionsIconSet } from '@general/icons/icons';
import { LucideAngularModule } from 'lucide-angular';
import { SoundEffectPillIconButtonComponent } from '../sound-effect-pill-stop-icon/sound-effect-pill-icon-button.component';
import { ScrollOverflowTextDirective } from '@general/directives/scroll-overflow-text.directive';

@Component({
  selector: 'app-sound-effect-bar-pill',
  imports: [
    NgStyle,
    LucideAngularModule,
    SoundEffectPillIconButtonComponent,
    ScrollOverflowTextDirective,
  ],
  templateUrl: './sound-effect-bar-pill.component.html',
  styleUrl: './sound-effect-bar-pill.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SoundEffectBarPillComponent {
  readonly soundEffect = input.required<SoundEffect>();
  readonly position = input<number>(0);

  readonly close = output<void>();
  readonly click = output<SoundEffect>();

  readonly stopIcon = actionsIconSet.CrossIcon;

  readonly playPositionBackground = computed(() => {
    const position = this.position();
    const duration = this.soundEffect().duration;
    if (!duration) {
      return {};
    }
    const progress = position / duration;
    const positionPercentage = (progress * 100).toString() + '%';
    const lightBackground = 'rgba(255, 255, 255, 0.125)';
    return {
      background: `linear-gradient(to right, ${lightBackground} ${positionPercentage}, transparent ${positionPercentage}, transparent)`,
    };
  });

  protected handleClick(event: PointerEvent) {
    event.stopPropagation();
    event.preventDefault();
    this.click.emit(this.soundEffect());
  }
}
