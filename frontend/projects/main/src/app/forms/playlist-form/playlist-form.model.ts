import { TagData } from '@shared/models/tag.model';
import { form, minLength, PathKind, required, SchemaOrSchemaFn } from '@angular/forms/signals';
import { signal } from '@angular/core';
import { Playlist } from '@shared/models/playlist.model';

interface PlaylistFormData {
  name: string;
  description?: string | null;
  imageUrl: string | null;
  tags: TagData[];
  parentPlaylist: Playlist | null;
}

export const createPlaylistForm = (
  data?: Partial<PlaylistFormData>,
  additionalSettings?: SchemaOrSchemaFn<PlaylistFormData, PathKind.Root>,
) => {
  const fields = signal<PlaylistFormData>({
    name: data?.name ?? '',
    description: data?.description ?? null,
    imageUrl: data?.imageUrl ?? null,
    tags: data?.tags ?? [],
    parentPlaylist: data?.parentPlaylist ?? null,
  });

  return form(fields, (form) => {
    required(form.name, { message: 'Playlist name is required' });
    minLength(form.name, 3, { message: 'Playlist name must be at least 3 characters long' });
    if(additionalSettings && typeof additionalSettings === 'function') {
      additionalSettings(form);
    }
  });
}

export type PlaylistForm = ReturnType<typeof createPlaylistForm>;
