import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  output,
  signal,
} from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ImageApiService } from '@general/services/image-api.service';

@Component({
  selector: 'app-image-upload',
  imports: [],
  templateUrl: './image-upload.component.html',
  styleUrl: './image-upload.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageUploadComponent {
  readonly imageApiService = inject(ImageApiService);
  readonly sanitizer = inject(DomSanitizer);

  readonly imagePath = signal<string | null>(null);
  readonly imageDataUrl = signal<SafeUrl | null>(null);
  readonly hasImage = computed<boolean>(() => {
    return this.imagePath() !== null;
  });

  readonly imageSelected = output<string | null>();

  openImageDialog(): void {
    this.imageApiService.openImageDialog().subscribe((imagePath) => {
      if (!imagePath) {
        return;
      }
      this.imagePath.set(imagePath);
      this.imageSelected.emit(imagePath);
      this.loadImagePreview(imagePath);
    });
  }

  private loadImagePreview(imagePath: string): void {
    this.imageApiService.fetchImage(imagePath).subscribe({
      next: (dataUrl) => {
        if (dataUrl) {
          // Backend returns full data URL, so just sanitize it
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
  }
}
