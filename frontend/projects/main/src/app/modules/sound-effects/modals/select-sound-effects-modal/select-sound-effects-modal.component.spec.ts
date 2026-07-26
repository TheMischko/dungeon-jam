import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SelectSoundEffectsSelection } from './select-sound-effects-modal.types';

import { SelectSoundEffectsModalComponent } from './select-sound-effects-modal.component';

const mockData: SelectSoundEffectsSelection = { selectedSoundEffects: [] };

describe('SelectSoundEffectsModalComponent', () => {
  let component: SelectSoundEffectsModalComponent;
  let fixture: ComponentFixture<SelectSoundEffectsModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectSoundEffectsModalComponent],
      providers: [
        { provide: MatDialogRef, useValue: { close: () => undefined } },
        { provide: MAT_DIALOG_DATA, useValue: mockData },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SelectSoundEffectsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
