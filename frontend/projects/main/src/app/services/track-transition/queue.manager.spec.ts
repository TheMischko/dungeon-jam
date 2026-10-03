import { TestBed } from '@angular/core/testing';
import { QueueManager } from './queue.manager';
import { Track } from '@shared/models/track.model';
import { describe, beforeEach, it, expect } from 'vitest';
import { firstValueFrom } from 'rxjs';

describe('QueueManager', () => {
  let manager: QueueManager;

  const tracks: Track[] = Array.from({ length: 10 }, (_, i) => ({
    id: `track-${i + 1}`,
    name: `Track ${i + 1}`,
    duration: 100 + i * 10,
    url: `http://audio/track${i + 1}.mp3`,
  })) as unknown as Track[];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [QueueManager],
    });
    manager = TestBed.inject(QueueManager);
  });

  it('should be created', () => {
    expect(manager).toBeTruthy();
  });

  it('should play tracks in order when shuffle is OFF', () => {
    manager.setShuffle(false);
    const firstTrack = manager.setQueue(tracks);

    expect(firstTrack?.id).toBe('track-1');
    expect(manager.peekNext()?.id).toBe('track-2');
  });

  it('should pick a shuffled first track when shuffle is ON and playing a playlist', () => {
    manager.setShuffle(true);

    const firstTrackIds = new Set<string>();
    // Call setQueue multiple times with shuffle ON
    for (let i = 0; i < 20; i++) {
      const firstTrack = manager.setQueue(tracks);
      if (firstTrack) {
        firstTrackIds.add(firstTrack.id);
      }
    }

    // With 10 tracks shuffled 20 times, there should be multiple distinct starting tracks
    expect(firstTrackIds.size).toBeGreaterThan(1);
  });

  it('should honor targetTrackId when clicked directly even if shuffle is ON', async () => {
    manager.setShuffle(true);
    const target = tracks[4]; // track-5
    const otherTracks = tracks.filter((t) => t.id !== target.id);

    const firstTrack = manager.setQueue([target, ...otherTracks], target.id);

    expect(firstTrack?.id).toBe('track-5');

    const upcoming = await firstValueFrom(manager.queue$);
    // Upcoming queue should contain the other 9 tracks
    expect(upcoming.length).toBe(9);
    expect(upcoming.map((item) => item.track.id)).not.toContain('track-5');
  });

  it('should keep currently playing track when shuffle is toggled on while playing', async () => {
    manager.setShuffle(false);
    manager.setQueue(tracks);

    // Advance to track-3
    manager.advanceNext(); // to track-2
    manager.advanceNext(); // to track-3

    // Toggle shuffle ON
    manager.setShuffle(true);

    // Upcoming queue should still have remaining tracks
    const upcoming = await firstValueFrom(manager.queue$);
    expect(upcoming.length).toBe(9);
    expect(upcoming.map((item) => item.track.id)).not.toContain('track-3');
  });
});
