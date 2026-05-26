import { TagData } from '@shared/models/tag.model';
import {
  form,
  minLength,
  PathKind,
  required,
  SchemaOrSchemaFn,
} from '@angular/forms/signals';
import { signal, WritableSignal } from '@angular/core';
import { Playlist } from '@shared/models/playlist.model';

export interface SceneFormData {
  name: string;
  description: string | null;
  imageUrl: string | null;
  tags: TagData[];
  playlist: Playlist | null;
}

const toFullFormData = (
  data?: Partial<SceneFormData>
): SceneFormData => ({
  name: data?.name ?? '',
  description: data?.description ?? null,
  imageUrl: data?.imageUrl ?? null,
  tags: data?.tags ?? [],
  playlist: data?.playlist ?? null,
});

export const createSceneForm = (
  data?: Partial<SceneFormData> | WritableSignal<SceneFormData>,
  additionalSettings?: SchemaOrSchemaFn<SceneFormData, PathKind.Root>
) => {
  const fields: WritableSignal<SceneFormData> =
    typeof data === 'function'
      ? (data as WritableSignal<SceneFormData>)
      : signal<SceneFormData>(
          toFullFormData(data as Partial<SceneFormData>)
        );

  return form(fields, (form) => {
    required(form.name, { message: 'Scene name is required' });
    minLength(form.name, 3, {
      message: 'Scene name must be at least 3 characters long',
    });
    if (additionalSettings && typeof additionalSettings === 'function') {
      additionalSettings(form);
    }
  });
};

export type SceneForm = ReturnType<typeof createSceneForm>;
