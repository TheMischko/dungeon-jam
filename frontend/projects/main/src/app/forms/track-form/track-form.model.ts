import { signal } from '@angular/core';
import {
  form,
  minLength,
  PathKind,
  required,
  SchemaOrSchemaFn,
} from '@angular/forms/signals';
import { TagData } from '@shared/models/tag.model';

interface TrackFormData {
  path: string;
  title: string;
  author: string;
  tags: TagData[];
}

export const createTrackForm = (
  data?: Partial<TrackFormData>,
  additionalSettings?: SchemaOrSchemaFn<TrackFormData, PathKind.Root>,
) => {
  const fields = signal<TrackFormData>({
    path: data?.path ?? '',
    title: data?.title ?? '',
    author: data?.author ?? '',
    tags: data?.tags ?? [],
  });
  return form(fields, (form) => {
    required(form.path, { message: 'Track file is required' });
    minLength(form.path, 5, {
      message: 'Track file path must be at least 5 characters long',
    });
    required(form.title, { message: 'Track title is required' });
    if (additionalSettings && typeof additionalSettings === 'function') {
      additionalSettings(form);
    }
  });
};

export type TrackForm = ReturnType<typeof createTrackForm>;
