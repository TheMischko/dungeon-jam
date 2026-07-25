import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SoundEffectControlPillComponent } from './sound-effect-control-pill.component';

describe('SoundEffectControlPillComponent', () => {
  let component: SoundEffectControlPillComponent;
  let fixture: ComponentFixture<SoundEffectControlPillComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SoundEffectControlPillComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SoundEffectControlPillComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
