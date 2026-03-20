import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChildPlaylistActionsComponent } from './child-playlist-actions.component';

describe('ChildPlaylistActionsComponent', () => {
  let component: ChildPlaylistActionsComponent;
  let fixture: ComponentFixture<ChildPlaylistActionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChildPlaylistActionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChildPlaylistActionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
