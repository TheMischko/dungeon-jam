import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlaylistGridSmartComponent } from './playlist-grid-smart.component';

describe('PlaylistGridSmartComponent', () => {
  let component: PlaylistGridSmartComponent;
  let fixture: ComponentFixture<PlaylistGridSmartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlaylistGridSmartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlaylistGridSmartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
