import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { vi } from 'vitest';
import { SoundEffectService } from './sound-effect.service';
import {
  SoundEffectContextType,
  SoundEffectRelativeReorderQuery,
} from '@shared/models/sound-effect.model';
import {
  DisplayOrder,
  DisplayOrderPlacement,
  OrderableEntityType,
} from '@shared/models/display-order.model';
import { SoundEffectApiWindow } from '../../../models/api/sound-effect-api.model';

describe('SoundEffectService', () => {
  let service: SoundEffectService;

  const getSoundEffectApi = () =>
    (window as unknown as SoundEffectApiWindow).SOUND_EFFECT_API;

  beforeEach(() => {
    (window as any).SOUND_EFFECT_API = {
      getAll: vi.fn(),
      getById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      deleteById: vi.fn(),
      changeSoundEffectOrder: vi.fn(),
      changeSoundEffectRelativeOrder: vi.fn().mockResolvedValue(new Map()),
    };

    TestBed.configureTestingModule({});
    service = TestBed.inject(SoundEffectService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call window.SOUND_EFFECT_API.changeSoundEffectRelativeOrder and return orderMap when changeRelativeOrder is called', async () => {
    const mockOrderMap = new Map<string, DisplayOrder>([
      [
        'sfx-1',
        {
          id: 'order-1',
          entityId: 'sfx-1',
          order: 0,
          entityType: OrderableEntityType.SoundEffect,
          contextType: SoundEffectContextType.Landing,
        },
      ],
      [
        'sfx-2',
        {
          id: 'order-2',
          entityId: 'sfx-2',
          order: 1,
          entityType: OrderableEntityType.SoundEffect,
          contextType: SoundEffectContextType.Landing,
        },
      ],
    ]);

    vi.spyOn(
      getSoundEffectApi(),
      'changeSoundEffectRelativeOrder'
    ).mockResolvedValue(mockOrderMap);

    const query: SoundEffectRelativeReorderQuery = {
      entityId: 'sfx-2',
      anchorEntityId: 'sfx-1',
      placement: DisplayOrderPlacement.BEFORE,
      contextType: SoundEffectContextType.Landing,
    };

    const result = await firstValueFrom(service.changeRelativeOrder(query));

    expect(
      getSoundEffectApi().changeSoundEffectRelativeOrder
    ).toHaveBeenCalledWith(query);
    expect(result).toBe(mockOrderMap);
  });

  it('should call changeRelativeOrder via reorderSoundEffectRelative with default parameters', async () => {
    const mockOrderMap = new Map<string, DisplayOrder>();
    vi.spyOn(
      getSoundEffectApi(),
      'changeSoundEffectRelativeOrder'
    ).mockResolvedValue(mockOrderMap);

    const result = await firstValueFrom(
      service.reorderSoundEffectRelative(
        'sfx-2',
        'sfx-1',
        DisplayOrderPlacement.AFTER
      )
    );

    expect(
      getSoundEffectApi().changeSoundEffectRelativeOrder
    ).toHaveBeenCalledWith({
      entityId: 'sfx-2',
      anchorEntityId: 'sfx-1',
      placement: DisplayOrderPlacement.AFTER,
      contextType: SoundEffectContextType.Landing,
      contextId: undefined,
    });
    expect(result).toBe(mockOrderMap);
  });
});
