import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SoundEffectPillIconButtonComponent } from './sound-effect-pill-icon-button.component';

describe('SoundEffectPillStopIconComponent', () => {
  let component: SoundEffectPillIconButtonComponent;
  let fixture: ComponentFixture<SoundEffectPillIconButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SoundEffectPillIconButtonComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SoundEffectPillIconButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
