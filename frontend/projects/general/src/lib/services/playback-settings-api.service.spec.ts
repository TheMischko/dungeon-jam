import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { vi } from 'vitest';
import { PlaybackSettingsApiService } from './playback-settings-api.service';
import {
  RepeatState,
  StoredPlayback,
  StoredTransitionSettings,
} from '@shared/models/track.model';
import { PlaybackApiWindow } from '../../../models/api/playback-api.model';

describe('PlaybackSettingsApiService', () => {
  let service: PlaybackSettingsApiService;

  const getPlaybackApi = () =>
    (window as unknown as PlaybackApiWindow).PLAYBACK_API;

  let onTransitionChangedCallback: ((settings: StoredTransitionSettings) => void) | undefined;

  beforeEach(() => {
    onTransitionChangedCallback = undefined;
    (window as any).PLAYBACK_API = {
      loadState: vi.fn().mockResolvedValue({
        volume: 0.8,
        shuffle: true,
        repeat: RepeatState.ALL,
      }),
      updateState: vi.fn(),
      updateCaptureSettings: vi.fn(),
      loadTransitionSettings: vi.fn().mockResolvedValue({
        fadeInDuration: 2,
        crossFadeDuration: 3,
      }),
      updateTransitionSettings: vi.fn(),
      onTransitionChanged: vi.fn().mockImplementation((cb) => {
        onTransitionChangedCallback = cb;
      }),
    };

    TestBed.configureTestingModule({});
    service = TestBed.inject(PlaybackSettingsApiService);
  });

  it('should load playback state successfully', async () => {
    const state = await firstValueFrom(service.loadState());
    expect(state).toEqual({
      volume: 0.8,
      shuffle: true,
      repeat: RepeatState.ALL,
    });
    expect(getPlaybackApi().loadState).toHaveBeenCalled();
  });

  it('should emit error when loadState fails', async () => {
    const testError = new Error('Failed to load playback state');
    vi.spyOn(getPlaybackApi(), 'loadState').mockRejectedValue(testError);

    await expect(firstValueFrom(service.loadState())).rejects.toEqual(
      testError
    );
  });

  it('should call updateState with new state', () => {
    const newState: StoredPlayback = {
      volume: 0.5,
      shuffle: false,
      repeat: RepeatState.NONE,
    };
    service.updateState(newState);
    expect(getPlaybackApi().updateState).toHaveBeenCalledWith(newState);
  });

  it('should call updateCaptureSettings with isLocalMuted', () => {
    service.updateCaptureSettings(true);
    expect(getPlaybackApi().updateCaptureSettings).toHaveBeenCalledWith(true);
  });

  it('should load transition settings successfully', async () => {
    const settings = await firstValueFrom(service.loadTransitionSettings());
    expect(settings).toEqual({
      fadeInDuration: 2,
      crossFadeDuration: 3,
    });
    expect(getPlaybackApi().loadTransitionSettings).toHaveBeenCalled();
  });

  it('should emit error when loadTransitionSettings fails', async () => {
    const testError = new Error('Failed to load transition settings');
    vi.spyOn(getPlaybackApi(), 'loadTransitionSettings').mockRejectedValue(
      testError
    );

    await expect(
      firstValueFrom(service.loadTransitionSettings())
    ).rejects.toEqual(testError);
  });

  it('should call updateTransitionSettings with new settings', () => {
    const newSettings: StoredTransitionSettings = {
      fadeInDuration: 1.5,
      crossFadeDuration: 2.5,
    };
    service.updateTransitionSettings(newSettings);
    expect(getPlaybackApi().updateTransitionSettings).toHaveBeenCalledWith(
      newSettings
    );
  });

  it('should call window.PLAYBACK_API.onTransitionChanged', () => {
    const callback = vi.fn();
    service.onTransitionChanged(callback);
    expect(getPlaybackApi().onTransitionChanged).toHaveBeenCalledWith(callback);
  });

  it('should emit new transition settings on transitionSettings$', async () => {
    const newSettings: StoredTransitionSettings = {
      fadeInDuration: 4,
      crossFadeDuration: 5,
    };

    const promise = firstValueFrom(service.transitionSettings$);
    onTransitionChangedCallback?.(newSettings);

    const emitted = await promise;
    expect(emitted).toEqual(newSettings);
  });
});
