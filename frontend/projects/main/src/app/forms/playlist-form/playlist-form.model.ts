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

export interface PlaylistFormData {
  name: string;
  description: string | null;
  imageUrl: string | null;
  tags: TagData[];
  parentPlaylist: Playlist | null;
}

const toFullFormData = (
  data?: Partial<PlaylistFormData>
): PlaylistFormData => ({
  name: data?.name ?? '',
  description: data?.description ?? null,
  imageUrl: data?.imageUrl ?? null,
  tags: data?.tags ?? [],
  parentPlaylist: data?.parentPlaylist ?? null,
});

export const createPlaylistForm = (
  data?: Partial<PlaylistFormData> | WritableSignal<PlaylistFormData>,
  additionalSettings?: SchemaOrSchemaFn<PlaylistFormData, PathKind.Root>
) => {
  const fields: WritableSignal<PlaylistFormData> =
    typeof data === 'function'
      ? (data as WritableSignal<PlaylistFormData>)
      : signal<PlaylistFormData>(
          toFullFormData(data as Partial<PlaylistFormData>)
        );

  return form(fields, (form) => {
    required(form.name, { message: 'Playlist name is required' });
    minLength(form.name, 3, {
      message: 'Playlist name must be at least 3 characters long',
    });
    if (additionalSettings && typeof additionalSettings === 'function') {
      additionalSettings(form);
    }
  });
};

export type PlaylistForm = ReturnType<typeof createPlaylistForm>;
