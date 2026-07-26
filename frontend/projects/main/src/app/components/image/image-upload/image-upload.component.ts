import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  forwardRef,
  inject,
  input,
  model,
  output,
  signal,
} from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ImageApiService } from '@general/services/image-api.service';
import { actionsIconSet } from '@general/icons/icons';
import { LucideDynamicIcon } from '@lucide/angular';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { FilesDropInZoneComponent } from '../../../modules/library/pages/library-landing-page/songs-drop-in-zone/files-drop-in-zone.component';

@Component({
  selector: 'app-image-upload',
  imports: [LucideDynamicIcon, FilesDropInZoneComponent],
  templateUrl: './image-upload.component.html',
  styleUrl: './image-upload.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ImageUploadComponent),
      multi: true,
    },
  ],
})
export class ImageUploadComponent implements ControlValueAccessor {
  readonly imageApiService = inject(ImageApiService);
  readonly sanitizer = inject(DomSanitizer);

  readonly label = input<string>('Image');
  readonly disabled = model<boolean>(false);
  readonly required = input<boolean>(false);

  readonly imagePath = signal<string | null>(null);
  readonly imageDataUrl = signal<SafeUrl | null>(null);
  readonly hasImage = computed<boolean>(() => {
    return this.imagePath() !== null;
  });
  private valueChanged: (imagePath: string | null) => void = () => {};
  private touched: () => void = () => {};

  readonly imageSelected = output<string | null>();

  readonly UploadIcon = actionsIconSet.UploadImageIcon;

  constructor() {
    effect(() => {
      const path = this.imagePath();
      if (!path) {
        return;
      }
      this.loadImagePreview(path);
    });
  }

  openImageDialog(): void {
    this.imageApiService.openImageDialog().subscribe((imagePath) => {
      if (!imagePath) {
        return;
      }
      this.imagePath.set(imagePath);
      this.imageSelected.emit(imagePath);
      this.valueChanged(imagePath);
      this.touched();
      this.loadImagePreview(imagePath);
    });
  }

  private loadImagePreview(imagePath: string): void {
    this.imageApiService.fetchImage(imagePath).subscribe({
      next: (dataUrl) => {
        if (dataUrl) {
          this.imageDataUrl.set(this.sanitizer.bypassSecurityTrustUrl(dataUrl));
        }
      },
      error: (err) => {
        console.error('Failed to load image preview:', err);
      },
    });
  }

  protected discardImage() {
    this.imagePath.set(null);
    this.imageDataUrl.set(null);
    this.imageSelected.emit(null);
    this.valueChanged(null);
    this.touched();
  }

  protected processDroppedFiles(paths: string[]) {
    if (!paths?.length) {
      return;
    }
    this.imagePath.set(paths[0]);
  }

  writeValue(imagePath: string): void {
    this.imagePath.set(imagePath);
  }
  registerOnChange(fn: (imagePath: string | null) => void): void {
    this.valueChanged = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.touched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }
}
