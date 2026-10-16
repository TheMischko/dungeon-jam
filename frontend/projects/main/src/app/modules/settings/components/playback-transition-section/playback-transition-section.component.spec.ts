import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlaybackTransitionSectionComponent } from './playback-transition-section.component';

describe('PlaybackTransitionSectionComponent', () => {
  let component: PlaybackTransitionSectionComponent;
  let fixture: ComponentFixture<PlaybackTransitionSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlaybackTransitionSectionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PlaybackTransitionSectionComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('transitionSettings', {
      fadeInDuration: 1,
      crossFadeDuration: 1,
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
