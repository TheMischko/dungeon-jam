import { TagData } from '@shared/models/tag.model';
import {
  form,
  minLength,
  PathKind,
  required,
  SchemaOrSchemaFn,
} from '@angular/forms/signals';
import { signal } from '@angular/core';

export interface SoundEffectFormData {
  title: string;
  path: string;
  tags: TagData[];
}

export const createSoundEffectForm = (
  data?: Partial<SoundEffectFormData>,
  additionalSettings?: SchemaOrSchemaFn<SoundEffectFormData, PathKind.Root>
) => {
  const fields = signal<SoundEffectFormData>({
    title: data?.title ?? '',
    path: data?.path ?? '',
    tags: data?.tags ?? [],
  });
  return form(fields, (form) => {
    required(form.path, { message: 'Sound effect file is required' });
    minLength(form.path, 5, {
      message: 'Sound effect file path must be at lest 5 characters long',
    });
    required(form.title, { message: 'Sound effect title is required' });
    if (additionalSettings && typeof additionalSettings === 'function') {
      additionalSettings(form);
    }
  });
};

export type SoundEffectForm = ReturnType<typeof createSoundEffectForm>;
