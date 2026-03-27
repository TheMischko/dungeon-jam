import { Injectable } from '@angular/core';
import { TagApiWindow } from '../../../models/api/tag-api.model';
import { QueryRequest } from '@shared/models/request.model';
import { Observable, Subject } from 'rxjs';
import { Tag, TagData } from '@shared/models/tag.model';

@Injectable({
  providedIn: 'root',
})
export class TagApiService {
  private readonly window = <TagApiWindow>window;

  getAllTags(options: QueryRequest): Observable<TagData[]> {
    const subject = new Subject<TagData[]>();
    this.window.TAG_API.getAllTags(options)
      .then((tags) => {
        subject.next(tags);
        subject.complete();
      })
      .catch((err) => {
        subject.error(err);
      });
    return subject.asObservable();
  }

  getSubsetOfTags(
    column: keyof TagData,
    values: unknown[],
  ): Observable<TagData[]> {
    const subject = new Subject<TagData[]>();
    this.window.TAG_API.getSubsetOfTags(column, values)
      .then((tags) => {
        subject.next(tags);
        subject.complete();
      })
      .catch((err) => {
        subject.error(err);
      });
    return subject.asObservable();
  }

  insertTag(data: Tag): Observable<TagData> {
    const subject = new Subject<TagData>();
    this.window.TAG_API.insertTag(data)
      .then((tag) => {
        subject.next(tag);
        subject.complete();
      })
      .catch((err) => {
        subject.error(err);
      });
    return subject.asObservable();
  }

  getTagSuggestion(titlePart: string): Observable<TagData[]> {
    const subject = new Subject<TagData[]>();
    this.window.TAG_API.getTagSuggestion(titlePart)
      .then((suggestions) => {
        subject.next(suggestions);
        subject.complete();
      })
      .catch((err) => {
        subject.error(err);
      });
    return subject.asObservable();
  }

  deleteTag(tagId: string): Observable<void> {
    const subject = new Subject<void>();
    this.window.TAG_API.deleteTag(tagId)
      .then(() => {
        subject.next();
        subject.complete();
      })
      .catch((err) => {
        subject.error(err);
      });
    return subject.asObservable();
  }

  clearOrphanedTags(): Observable<number> {
    const subject = new Subject<number>();
    this.window.TAG_API.clearOrphanedTags()
      .then((count) => {
        subject.next(count);
        subject.complete();
      })
      .catch((err) => {
        subject.error(err);
      });
    return subject.asObservable();
  }

  getTagsTrackCount(): Observable<Record<string, number>> {
    const subject = new Subject<Record<string, number>>();
    this.window.TAG_API.getTagsTrackCount()
      .then((counts) => {
        subject.next(counts);
        subject.complete();
      })
      .catch((err) => {
        subject.error(err);
      });
    return subject.asObservable();
  }
}
