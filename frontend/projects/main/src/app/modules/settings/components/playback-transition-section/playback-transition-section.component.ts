import { Component, input, output } from '@angular/core';
import { RangeSliderComponent } from '@general/components/controls/range-slider/range-slider.component';
import { StoredTransitionSettings } from '@shared/models/track.model';
import { actionsIconSet } from '@general/icons/icons';
import { LucideDynamicIcon } from '@lucide/angular';

@Component({
  selector: 'app-playback-transition-section',
  imports: [RangeSliderComponent, LucideDynamicIcon],
  templateUrl: './playback-transition-section.component.html',
  styleUrl: './playback-transition-section.component.scss',
})
export class PlaybackTransitionSectionComponent {
  readonly transitionSettings = input.required<StoredTransitionSettings>();
  readonly updateSettings = output<StoredTransitionSettings>();

  readonly CrossFadeIcon = actionsIconSet.ShuffleIcon;
  readonly FadeInIcon = actionsIconSet.FadeInIcon;

  updateCrossFadeValue(value: number) {
    this.updateSettings.emit({
      ...this.transitionSettings(),
      crossFadeDuration: value,
    });
  }

  updateFadeInValue(value: number) {
    this.updateSettings.emit({
      ...this.transitionSettings(),
      fadeInDuration: value,
    });
  }
}
