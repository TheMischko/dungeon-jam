import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SoundEffect } from '@shared/models/sound-effect.model';
import { GridSoundEffectSizeConfig } from '../../../../models/grid-item-size-config.model';

import { SoundEffectCardComponent } from './sound-effect-card.component';

const mockSoundEffect: SoundEffect = {
  id: 'sound-effect-1',
  name: 'Test Sound Effect',
  url: 'https://example.com/sound.mp3',
  duration: 10,
};

const mockSizeConfig: GridSoundEffectSizeConfig = {
  imageSize: 100,
  titleSize: 12,
};

describe('SoundEffectCardComponent', () => {
  let component: SoundEffectCardComponent;
  let fixture: ComponentFixture<SoundEffectCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SoundEffectCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SoundEffectCardComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('soundEffect', mockSoundEffect);
    fixture.componentRef.setInput('sizeConfig', mockSizeConfig);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
