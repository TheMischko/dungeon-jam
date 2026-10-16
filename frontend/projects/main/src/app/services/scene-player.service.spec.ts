import { TestBed } from '@angular/core/testing';
import { ScenePlayerService } from './scene-player.service';
import { PlaybackService } from './playback.service';
import { SoundEffectsPlayerService } from './sound-effects-player.service';
import { ScenesStore } from '@general/stores/scenes.store';
import { TrackService } from './track.service';
import { SoundEffectStore } from '@general/stores/sound-effect.store';
import { ToastService } from '@general/services/toast.service';
import { Scene } from '@shared/models/scene.model';
import { Track } from '@shared/models/track.model';
import { SoundEffect } from '@shared/models/sound-effect.model';
import { vi, describe, beforeEach, it, expect } from 'vitest';
import { firstValueFrom, of } from 'rxjs';

describe('ScenePlayerService', () => {
  let service: ScenePlayerService;
  let mockPlaybackService: {
    playTracks: ReturnType<typeof vi.fn>;
    clearState: ReturnType<typeof vi.fn>;
  };
  let mockSoundEffectsPlayerService: {
    playEffect: ReturnType<typeof vi.fn>;
    stopEffect: ReturnType<typeof vi.fn>;
  };

  const scene1: Scene = {
    id: 'scene-1',
    name: 'Scene 1',
    playlistId: 'playlist-1',
    ambience: [{ soundEffectId: 'sfx-1', volume: 0.8 }],
    stingers: [],
    tags: [],
  } as unknown as Scene;

  const scene2: Scene = {
    id: 'scene-2',
    name: 'Scene 2',
    playlistId: 'playlist-2',
    ambience: [{ soundEffectId: 'sfx-2', volume: 0.5 }],
    stingers: [],
    tags: [],
  } as unknown as Scene;

  const sceneNoTracks: Scene = {
    id: 'scene-no-tracks',
    name: 'Scene Without Tracks',
    ambience: [],
    stingers: [],
    tags: [],
  } as unknown as Scene;

  const track1: Track = {
    id: 't-1',
    name: 'Track 1',
    duration: 120,
    url: 'http://test1.mp3',
  } as unknown as Track;
  const track2: Track = {
    id: 't-2',
    name: 'Track 2',
    duration: 150,
    url: 'http://test2.mp3',
  } as unknown as Track;

  const sfx1: SoundEffect = {
    id: 'sfx-1',
    name: 'Wind',
    duration: 10,
    path: '/sfx1.mp3',
  } as unknown as SoundEffect;
  const sfx2: SoundEffect = {
    id: 'sfx-2',
    name: 'Rain',
    duration: 10,
    path: '/sfx2.mp3',
  } as unknown as SoundEffect;

  beforeEach(() => {
    mockPlaybackService = {
      playTracks: vi.fn().mockResolvedValue(undefined),
      clearState: vi.fn().mockResolvedValue(undefined),
    };
    mockSoundEffectsPlayerService = {
      playEffect: vi.fn().mockResolvedValue(undefined),
      stopEffect: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        ScenePlayerService,
        { provide: PlaybackService, useValue: mockPlaybackService },
        {
          provide: SoundEffectsPlayerService,
          useValue: mockSoundEffectsPlayerService,
        },
        {
          provide: ScenesStore,
          useValue: {
            entities: () => [scene1, scene2, sceneNoTracks],
            entityMap: () => ({
              'scene-1': scene1,
              'scene-2': scene2,
              'scene-no-tracks': sceneNoTracks,
            }),
            loading: () => false,
            loadAll: vi.fn(),
          },
        },
        {
          provide: SoundEffectStore,
          useValue: {
            entities: () => [sfx1, sfx2],
            entityMap: () => ({ 'sfx-1': sfx1, 'sfx-2': sfx2 }),
            loading: () => false,
            loadAll: vi.fn(),
          },
        },
        {
          provide: TrackService,
          useValue: {
            getTracksByPlaylist: vi.fn().mockReturnValue(of([track1])),
          },
        },
        {
          provide: ToastService,
          useValue: {
            createToast: vi.fn(),
          },
        },
      ],
    });
    service = TestBed.inject(ScenePlayerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should play tracks and ambience when playSceneWithData is called', async () => {
    await firstValueFrom(service.playSceneWithData(scene1, [track1], [sfx1]));

    expect(mockPlaybackService.playTracks).toHaveBeenCalledWith(
      [track1],
      expect.objectContaining({ sceneId: 'scene-1' })
    );
    expect(mockSoundEffectsPlayerService.playEffect).toHaveBeenCalledWith(
      sfx1,
      true
    );
  });

  it('should NOT clear playback state when directly switching to another scene with tracks', async () => {
    // Play scene 1 first
    await firstValueFrom(service.playSceneWithData(scene1, [track1], [sfx1]));
    mockPlaybackService.clearState.mockClear();

    // Now switch directly to scene 2 which has tracks
    await firstValueFrom(service.playSceneWithData(scene2, [track2], [sfx2]));

    // Should stop scene 1 ambience
    expect(mockSoundEffectsPlayerService.stopEffect).toHaveBeenCalledWith(
      'sfx-1'
    );
    // Should NOT call clearState because scene 2 has tracks to play
    expect(mockPlaybackService.clearState).not.toHaveBeenCalled();
    // Should call playTracks for scene 2
    expect(mockPlaybackService.playTracks).toHaveBeenCalledWith(
      [track2],
      expect.objectContaining({ sceneId: 'scene-2' })
    );
  });

  it('should clear playback state when switching to a scene without tracks', async () => {
    // Play scene 1 first
    await firstValueFrom(service.playSceneWithData(scene1, [track1], [sfx1]));
    mockPlaybackService.clearState.mockClear();

    // Now switch directly to a scene without tracks
    await firstValueFrom(service.playSceneWithData(sceneNoTracks, [], []));

    expect(mockPlaybackService.clearState).toHaveBeenCalled();
  });

  it('should clear playback state and stop ambience when stopScene is called', () => {
    service.stopScene(scene1);

    expect(mockPlaybackService.clearState).toHaveBeenCalled();
    expect(mockSoundEffectsPlayerService.stopEffect).toHaveBeenCalledWith(
      'sfx-1'
    );
  });
});
