import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlaylistParentFilterComponent } from './playlist-parent-filter.component';

describe('PlaylistParentFilterComponent', () => {
  let component: PlaylistParentFilterComponent;
  let fixture: ComponentFixture<PlaylistParentFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlaylistParentFilterComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PlaylistParentFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
