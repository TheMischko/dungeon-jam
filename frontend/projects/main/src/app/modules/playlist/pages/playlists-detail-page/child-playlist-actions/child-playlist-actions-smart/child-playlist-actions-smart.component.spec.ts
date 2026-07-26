import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChildPlaylistActionsSmartComponent } from './child-playlist-actions-smart.component';

describe('ChildPlaylistActionsSmartComponent', () => {
  let component: ChildPlaylistActionsSmartComponent;
  let fixture: ComponentFixture<ChildPlaylistActionsSmartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChildPlaylistActionsSmartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChildPlaylistActionsSmartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
