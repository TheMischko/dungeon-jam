import { signal } from '@angular/core';
import {
  form,
  minLength,
  PathKind,
  required,
  SchemaOrSchemaFn,
} from '@angular/forms/signals';
import { DiscordTokenData } from '@shared/models/discord.model';

interface DiscordTokenFormData {
  name: string;
  apiKey: string;
}

export const createDiscordTokenForm = (
  data?: Partial<DiscordTokenData>,
  additionalSettings?: SchemaOrSchemaFn<DiscordTokenFormData, PathKind.Root>,
) => {
  const fields = signal<DiscordTokenFormData>({
    name: data?.name ?? '',
    apiKey: data?.apiKey ?? '',
  });

  return form(fields, (form) => {
    required(form.name, { message: 'Token name is required' });
    minLength(form.name, 3, {
      message: 'Token name must be at least 3 characters long',
    });
    required(form.apiKey, { message: 'Discord API key is required' });
    minLength(form.apiKey, 12, {
      message: 'Discord token must be at least 12 characters long',
    });
    if (additionalSettings && typeof additionalSettings === 'function') {
      additionalSettings(form);
    }
  });
};

export type DiscordTokenForm = ReturnType<typeof createDiscordTokenForm>;

