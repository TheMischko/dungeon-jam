import { Injectable } from '@angular/core';
import { ImageApiWindow } from '../../../models/api/image-api.model';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ImageApiService {
  private readonly window: ImageApiWindow = window as ImageApiWindow;

  public fetchImage(imagePath: string): Observable<string | null> {
    const response = new Subject<string | null>();

    this.window.IMAGE_API.fetchImage(imagePath)
      .then((imagePath) => {
        response.next(imagePath);
        response.complete();
      })
      .catch((err) => {
        response.error(err);
        response.complete();
      });

    return response.asObservable();
  }

  public openImageDialog(): Observable<string | null> {
    const response = new Subject<string | null>();

    this.window.IMAGE_API.openPicker()
      .then((imagePath) => {
        response.next(imagePath);
        response.complete();
      })
      .catch((err) => {
        response.error(err);
        response.complete();
      });

    return response.asObservable();
  }

  public processAndSave(
    imagePath: string,
    entityType: string
  ): Observable<string> {
    const response = new Subject<string>();

    this.window.IMAGE_API.processAndSave(imagePath, entityType)
      .then((imagePath) => {
        response.next(imagePath);
        response.complete();
      })
      .catch((err) => {
        response.error(err);
        response.complete();
      });

    return response.asObservable();
  }

  public deleteImage(imagePath: string): Observable<void> {
    const response = new Subject<void>();

    this.window.IMAGE_API.deleteImage(imagePath)
      .then((imagePath) => {
        response.next(imagePath);
        response.complete();
      })
      .catch((err) => {
        response.error(err);
        response.complete();
      });

    return response.asObservable();
  }
}
