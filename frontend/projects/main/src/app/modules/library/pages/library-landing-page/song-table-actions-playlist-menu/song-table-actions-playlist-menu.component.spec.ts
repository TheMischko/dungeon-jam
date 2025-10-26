import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SongTableActionsPlaylistMenuComponent } from './song-table-actions-playlist-menu.component';

describe('SongTableActionsPlaylistMenuComponent', () => {
  let component: SongTableActionsPlaylistMenuComponent;
  let fixture: ComponentFixture<SongTableActionsPlaylistMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SongTableActionsPlaylistMenuComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SongTableActionsPlaylistMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
