import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SoundEffectCardComponent } from './sound-effect-card.component';

describe('SoundEffectCardComponent', () => {
  let component: SoundEffectCardComponent;
  let fixture: ComponentFixture<SoundEffectCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SoundEffectCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SoundEffectCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
