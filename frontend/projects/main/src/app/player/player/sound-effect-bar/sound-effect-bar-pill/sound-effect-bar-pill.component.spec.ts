import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SoundEffect } from '@shared/models/sound-effect.model';

import { SoundEffectBarPillComponent } from './sound-effect-bar-pill.component';

const mockSoundEffect: SoundEffect = {
  id: 'sound-effect-1',
  name: 'Test Sound Effect',
  url: 'https://example.com/sound.mp3',
  duration: 10,
};

describe('SoundEffectBarPillComponent', () => {
  let component: SoundEffectBarPillComponent;
  let fixture: ComponentFixture<SoundEffectBarPillComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SoundEffectBarPillComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SoundEffectBarPillComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('soundEffect', mockSoundEffect);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
