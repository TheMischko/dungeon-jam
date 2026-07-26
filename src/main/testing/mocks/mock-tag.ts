import { TagData } from '@shared/models/tag.model';
import { mockTestString } from './mock-string';

export const mockTagData = (options?: Partial<TagData>): TagData => {
  return {
    id: mockTestString(),
    title: mockTestString(),
    ...options,
  };
};
