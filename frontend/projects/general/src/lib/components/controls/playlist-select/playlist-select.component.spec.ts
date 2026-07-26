import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlaylistSelectComponent } from './playlist-select.component';

describe('PlaylistSelectComponent', () => {
  let component: PlaylistSelectComponent;
  let fixture: ComponentFixture<PlaylistSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlaylistSelectComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlaylistSelectComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
