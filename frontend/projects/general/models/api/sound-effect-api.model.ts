import { DisplayOrder } from '@shared/models/display-order.model';
import { QueryRequest } from '@shared/models/request.model';
import {
  SoundEffect,
  SoundEffectCreateData,
  SoundEffectRelativeReorderQuery,
  SoundEffectReorderQuery,
  SoundEffectUpdateData,
} from '@shared/models/sound-effect.model';

export type SoundEffectApiWindow = Window &
  typeof globalThis & {
    SOUND_EFFECT_API: {
      getAll: (query: QueryRequest) => Promise<SoundEffect[]>;
      getById: (id: string) => Promise<SoundEffect | null>;
      create: (data: SoundEffectCreateData) => Promise<SoundEffect>;
      update: (data: SoundEffectUpdateData) => Promise<SoundEffect | null>;
      deleteById: (id: string) => Promise<boolean>;
      changeSoundEffectOrder: (
        request: SoundEffectReorderQuery
      ) => Promise<void>;
      changeSoundEffectRelativeOrder: (
        request: SoundEffectRelativeReorderQuery
      ) => Promise<Map<string, DisplayOrder>>;
    };
  };
