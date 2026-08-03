import { TestBed } from '@angular/core/testing';
import { DefaultTrackActionsService } from './default-track-actions.service';
import { DialogService } from './dialog.service';
import { TrackLibraryStore } from '../stores/track-library.store';
import { Track } from '@shared/models/track.model';
import { of } from 'rxjs';
import { vi } from 'vitest';

describe('DefaultTrackActionsService', () => {
  let service: DefaultTrackActionsService;
  let mockDialogService: { open: any };
  let mockTracksStore: { removeTrack: any };

  const testTrack: Partial<Track> = {
    id: 'track-1',
    name: 'Test Song',
  };

  beforeEach(() => {
    mockDialogService = {
      open: vi.fn(),
    };
    mockTracksStore = {
      removeTrack: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        DefaultTrackActionsService,
        { provide: DialogService, useValue: mockDialogService },
        { provide: TrackLibraryStore, useValue: mockTracksStore },
      ],
    });
    service = TestBed.inject(DefaultTrackActionsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should open confirmation dialog and remove track when confirmed', () => {
    mockDialogService.open.mockReturnValue({
      afterClosed$: of(true),
    });

    const actions = service.createActions();
    const deleteAction = actions.find((a) => a.text === 'Delete');
    expect(deleteAction).toBeTruthy();

    deleteAction!.onSelected!(testTrack as Track, deleteAction!);

    expect(mockDialogService.open).toHaveBeenCalled();
    expect(mockTracksStore.removeTrack).toHaveBeenCalledWith('track-1');
  });

  it('should open confirmation dialog and NOT remove track when canceled', () => {
    mockDialogService.open.mockReturnValue({
      afterClosed$: of(false),
    });

    const actions = service.createActions();
    const deleteAction = actions.find((a) => a.text === 'Delete');

    deleteAction!.onSelected!(testTrack as Track, deleteAction!);

    expect(mockDialogService.open).toHaveBeenCalled();
    expect(mockTracksStore.removeTrack).not.toHaveBeenCalled();
  });
});
