import { TestBed } from '@angular/core/testing';
import { TrackTransitionService } from './track-transition.service';
import { PlaybackSettingsApiService } from '@general/services/playback-settings-api.service';
import { of } from 'rxjs';
import { HowlTrack } from '../../utils/howl-track';
import { Track } from '@shared/models/track.model';
import { PlayingTrackState } from '../../models/playback.model';
import { vi, describe, beforeEach, it, expect } from 'vitest';

describe('TrackTransitionService', () => {
  let service: TrackTransitionService;
  const mockTrack1: Track = {
    id: 'track-1',
    name: 'Track 1',
    duration: 180,
    path: '/audio/track1.mp3',
    url: 'http://audio/track1.mp3',
  } as unknown as Track;
  const mockTrack2: Track = {
    id: 'track-2',
    name: 'Track 2',
    duration: 200,
    path: '/audio/track2.mp3',
    url: 'http://audio/track2.mp3',
  } as unknown as Track;

  beforeEach(() => {
    vi.spyOn(HowlTrack.prototype, 'play').mockResolvedValue();
    vi.spyOn(HowlTrack.prototype, 'load').mockReturnValue();
    vi.spyOn(HowlTrack.prototype, 'fade').mockReturnValue(of(void 0));
    vi.spyOn(HowlTrack.prototype, 'dispose').mockReturnValue();

    TestBed.configureTestingModule({
      providers: [
        TrackTransitionService,
        {
          provide: PlaybackSettingsApiService,
          useValue: {
            loadTransitionSettings: () =>
              of({ fadeInDuration: 0.1, crossFadeDuration: 0.1 }),
            transitionSettings$: of({
              fadeInDuration: 0.1,
              crossFadeDuration: 0.1,
            }),
          },
        },
      ],
    });
    service = TestBed.inject(TrackTransitionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should play a track and set activeTrack', async () => {
    await service.play(mockTrack1);
    expect(service.activeTrack.getValue()?.track.id).toBe('track-1');
  });

  it('should handle sequential stop and play without race conditions leaving tracks undefined', async () => {
    await service.play(mockTrack1);
    expect(service.activeTrack.getValue()?.track.id).toBe('track-1');

    // Simulate switching scenes: stop() and play() called back-to-back without awaiting
    const stopPromise = service.stop();
    const playPromise = service.play(mockTrack2);

    await Promise.all([stopPromise, playPromise]);

    expect(service.activeTrack.getValue()?.track.id).toBe('track-2');
  });

  it('should crossfade when play is called while another track is already playing', async () => {
    await service.play(mockTrack1);
    expect(service.activeTrack.getValue()?.track.id).toBe('track-1');

    await service.play(mockTrack2);

    expect(service.activeTrack.getValue()?.track.id).toBe('track-2');
  });

  it('should automatically transition to next track when active track ends', async () => {
    service.setPullNextTrackFn(() => mockTrack2);
    await service.play(mockTrack1);
    expect(service.activeTrack.getValue()?.track.id).toBe('track-1');

    const activeHowlTrack = service.activeTrack.getValue()!;
    // Simulate song finishing naturally
    (activeHowlTrack as any).trackStateSubject.next(PlayingTrackState.ENDED);

    // Wait a tick for async state transition
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(service.activeTrack.getValue()?.track.id).toBe('track-2');
  });

  it('should transition to IdleState when active track ends and no next track is available', async () => {
    service.setPullNextTrackFn(() => undefined);
    await service.play(mockTrack1);
    expect(service.activeTrack.getValue()?.track.id).toBe('track-1');

    const activeHowlTrack = service.activeTrack.getValue()!;
    (activeHowlTrack as any).trackStateSubject.next(PlayingTrackState.ENDED);

    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(service.activeTrack.getValue()).toBeUndefined();
  });
});
