import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SceneSoundEffectCardComponent } from './scene-sound-effect-card.component';
import { SoundEffect } from '@shared/models/sound-effect.model';

describe('SceneSoundEffectCardComponent', () => {
  let component: SceneSoundEffectCardComponent;
  let fixture: ComponentFixture<SceneSoundEffectCardComponent>;

  const mockSoundEffect: SoundEffect = {
    id: 'sound-effect-1',
    name: 'Test Sound Effect',
    url: 'file:///test.mp3',
    duration: 30,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SceneSoundEffectCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SceneSoundEffectCardComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('soundEffect', mockSoundEffect);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
