import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SoundEffectFormComponent } from './sound-effect-form.component';
import { createSoundEffectForm } from './sound-effect-form.model';

describe('SoundEffectFormComponent', () => {
  let component: SoundEffectFormComponent;
  let fixture: ComponentFixture<SoundEffectFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SoundEffectFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SoundEffectFormComponent);
    component = fixture.componentInstance;
    const form = TestBed.runInInjectionContext(() => createSoundEffectForm());
    fixture.componentRef.setInput('form', form);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
