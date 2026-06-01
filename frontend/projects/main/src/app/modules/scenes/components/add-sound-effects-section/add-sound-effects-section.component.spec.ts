import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddSoundEffectsSectionComponent } from './add-sound-effects-section.component';

describe('AddSoundEffectsSectionComponent', () => {
  let component: AddSoundEffectsSectionComponent;
  let fixture: ComponentFixture<AddSoundEffectsSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddSoundEffectsSectionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AddSoundEffectsSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
