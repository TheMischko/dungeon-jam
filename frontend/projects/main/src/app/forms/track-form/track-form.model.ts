import { signal } from '@angular/core';
import { form, minLength, required } from '@angular/forms/signals';
import { TagData } from '@shared/models/tag.model';

interface TrackFormData {
  path: string;
  title: string;
  author: string;
  tags: TagData[];
}

export const createTrackForm = (data?: Partial<TrackFormData>) => {
  const fields = signal<TrackFormData>({
    path: '',
    title: '',
    author: '',
    tags: [],
    ...data,
  });
  return form(fields, (form) => {
    required(form.path, { message: 'Track file is required' });
    minLength(form.path, 5, {
      message: 'Track file path must be at least 5 characters long',
    });
    required(form.title, { message: 'Track title is required' });
  });
};

export type TrackForm = ReturnType<typeof createTrackForm>;
