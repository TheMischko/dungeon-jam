import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'trackDuration',
})
export class TrackDurationPipe implements PipeTransform {
  transform(value: number | undefined): string {
    if (value === undefined || !(value > 0)) {
      return '--:--';
    }
    const totalSeconds = Math.round(value);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(
      2,
      '0'
    )}`;
  }
}
