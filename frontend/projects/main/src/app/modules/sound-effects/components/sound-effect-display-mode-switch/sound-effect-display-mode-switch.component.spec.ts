import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SoundEffectDisplayModeSwitchComponent } from './sound-effect-display-mode-switch.component';

describe('SoundEffectDisplayModeSwitchComponent', () => {
  let component: SoundEffectDisplayModeSwitchComponent;
  let fixture: ComponentFixture<SoundEffectDisplayModeSwitchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SoundEffectDisplayModeSwitchComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SoundEffectDisplayModeSwitchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
