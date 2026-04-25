import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'trackDuration',
})
export class TrackDurationPipe implements PipeTransform {
  transform(value: number | undefined): string {
    if (value === undefined || !(value > 0)) {
      return '--:--';
    }
    const minutes = Math.floor(value / 60);
    const seconds = Math.round(value % 60);

    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(
      2,
      '0'
    )}`;
  }
}
