import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectSoundEffectsModalComponent } from './select-sound-effects-modal.component';

describe('SelectSoundEffectsModalComponent', () => {
  let component: SelectSoundEffectsModalComponent;
  let fixture: ComponentFixture<SelectSoundEffectsModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectSoundEffectsModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SelectSoundEffectsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
