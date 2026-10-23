import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlaylistGridSmartComponent } from './playlist-grid-smart.component';
import { RedirectService } from '@general';
import { RedirectPath } from '@shared/models/redirect.model';

describe('PlaylistGridSmartComponent', () => {
  let component: PlaylistGridSmartComponent;
  let fixture: ComponentFixture<PlaylistGridSmartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlaylistGridSmartComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PlaylistGridSmartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should redirect to the selected playlist', () => {
    const redirectService = TestBed.inject(RedirectService);
    vi.spyOn(redirectService, 'triggerRedirect');

    component.showPlaylistDetails('playlist-1');

    expect(redirectService.triggerRedirect).toHaveBeenCalledWith({
      path: RedirectPath.PLAYLISTS,
      params: { playlistId: 'playlist-1' },
    });
  });
});
