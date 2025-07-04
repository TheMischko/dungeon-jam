import {Component, computed, effect, input, output} from '@angular/core';
import {LucideAngularModule} from 'lucide-angular';
import {volumeIconSet} from '../../../../../../general/src/lib/icons/icons';
import {MatSlider, MatSliderThumb} from '@angular/material/slider';
import {FormControl, ReactiveFormsModule} from '@angular/forms';
import {toSignal} from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-volume-control',
  imports: [
    LucideAngularModule,
    MatSlider,
    ReactiveFormsModule,
    MatSliderThumb
  ],
  templateUrl: './volume-control.component.html',
  styleUrl: './volume-control.component.scss'
})
export class VolumeControlComponent {
  volume = input.required<number>();

  volumeNormalized = computed(() => {
    return Math.max(0, Math.min(this.volume(), 1));
  })
  volumeIcon = computed(() => {
    const volume = this.volumeNormalized();
    switch (true){
      case volume <= 0:
        return this.MutedIcon;
      case volume <= 0.5:
        return this.LowVolumeIcon;
      default:
        return this.NormalVolumeIcon
    }
  })

  changed = output<number>();

  control = new FormControl(1);
  controlValueChanged = toSignal(
    this.control.valueChanges,
    { initialValue: null }
  )

  constructor() {
    effect(() => {
      const valueChanged = this.controlValueChanged();
      if(valueChanged === null){
        return;
      }
      const remappedValue = Math.pow(valueChanged, 2);
      this.changed.emit(remappedValue);
    });
    effect(() => {
      const value = this.volumeNormalized();
      this.control.setValue(Math.sqrt(value), { emitEvent: false })
    });
  }

  MutedIcon = volumeIconSet.MutedIcon;
  LowVolumeIcon = volumeIconSet.LowIcon;
  NormalVolumeIcon = volumeIconSet.NormalIcon;
}
