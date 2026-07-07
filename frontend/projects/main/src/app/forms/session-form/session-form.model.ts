import { signal, WritableSignal } from '@angular/core';
import {
  form,
  minLength,
  PathKind,
  required,
  SchemaOrSchemaFn,
} from '@angular/forms/signals';

export interface SessionFormData {
  name: string;
  description: string | null;
  dateOfSession: Date | null;
}

const toFullFormData = (data?: Partial<SessionFormData>): SessionFormData => ({
  name: data?.name ?? '',
  description: data?.description ?? null,
  dateOfSession: data?.dateOfSession ?? null,
});

export const createSessionForm = (
  data?: Partial<SessionFormData> | WritableSignal<SessionFormData>,
  additionalSettings?: SchemaOrSchemaFn<SessionFormData, PathKind.Root>
) => {
  const fields: WritableSignal<SessionFormData> =
    typeof data === 'function'
      ? (data as WritableSignal<SessionFormData>)
      : signal<SessionFormData>(
          toFullFormData(data as Partial<SessionFormData>)
        );

  return form(fields, (form) => {
    required(form.name, { message: 'Session name is required' });
    minLength(form.name, 3, {
      message: 'Session name must be at least 3 characters long',
    });
    if (additionalSettings && typeof additionalSettings === 'function') {
      additionalSettings(form);
    }
  });
};

export type SessionForm = ReturnType<typeof createSessionForm>;
