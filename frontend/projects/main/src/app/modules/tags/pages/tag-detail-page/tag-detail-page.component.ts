import { ChangeDetectionStrategy, Component, computed, ElementRef, input, output, viewChild } from '@angular/core';
import { Track } from '@shared/models/track.model';
import { TagData } from '@shared/models/tag.model';
import { SongsTableComponent } from '../../../library/pages/library-landing-page/songs-table/songs-table.component';
import { NgStyle } from '@angular/common';

@Component({
  selector: 'app-tag-detail-page',
  imports: [
    SongsTableComponent,
    NgStyle,
  ],
  templateUrl: './tag-detail-page.component.html',
  styleUrl: './tag-detail-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class TagDetailPageComponent {
  readonly tag = input<TagData | null>(null);
  readonly tracks = input<Track[]>([]);
  readonly loading = input<boolean>(false);

  readonly colorChange = output<string>();

  readonly colorInput = viewChild.required('colorInput', { read: ElementRef<HTMLInputElement>})

  readonly pageTitle = computed(() => {
    const tagTitle = this.tag()?.title || 'Unknown';
    const capitalizedTagName = tagTitle.charAt(0).toUpperCase() + tagTitle.slice(1);
    return `Tag detail - ${capitalizedTagName}`;
  });

  readonly tagColorStyle = computed(() => {
    const color = this.tag()?.color;
    if(!color){
      return {};
    }

    return {
      'background-color': color,
    }
  });

  openColorPicker(): void {
    this.colorInput().nativeElement.click();
  }

  emitNewColor(): void {
    const newColor = this.colorInput().nativeElement.value;
    console.log(newColor);
    this.colorChange.emit(newColor);
  }
}
