import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SoundEffectUploadModalComponent } from './sound-effect-upload-modal.component';

describe('SoundEffectUploadModalComponent', () => {
  let component: SoundEffectUploadModalComponent;
  let fixture: ComponentFixture<SoundEffectUploadModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SoundEffectUploadModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SoundEffectUploadModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
