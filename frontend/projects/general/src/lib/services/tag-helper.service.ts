import { Injectable } from '@angular/core';
import { TagData, TagDetail } from '@shared/models/tag.model';

@Injectable({
  providedIn: 'root',
})
export class TagHelperService {
  createTagDetailsMap(tagDetails: TagDetail[]): Record<string, TagDetail> {
    return tagDetails.reduce((map, tag) => {
      return {
        ...map,
        [tag.id]: tag
      }
    }, {} as Record<string, TagDetail>);
  }

  updateDetailRecord(tag: TagData, detailsMap: Record<string, TagDetail>) {
    const entity = detailsMap[tag.id];
    return {
      ...detailsMap,
      [entity.id]: {
        ...entity,
        title: tag.title,
        color: tag.color
      }
    }
  }
}
