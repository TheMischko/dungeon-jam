import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SceneSoundEffectCardComponent } from './scene-sound-effect-card.component';

describe('SceneSoundEffectCardComponent', () => {
  let component: SceneSoundEffectCardComponent;
  let fixture: ComponentFixture<SceneSoundEffectCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SceneSoundEffectCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SceneSoundEffectCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
