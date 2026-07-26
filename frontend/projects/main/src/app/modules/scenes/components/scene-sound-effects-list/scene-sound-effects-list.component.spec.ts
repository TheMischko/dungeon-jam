import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SceneSoundEffectsListComponent } from './scene-sound-effects-list.component';

describe('SceneSoundEffectsListComponent', () => {
  let component: SceneSoundEffectsListComponent;
  let fixture: ComponentFixture<SceneSoundEffectsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SceneSoundEffectsListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SceneSoundEffectsListComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('soundEffects', []);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
