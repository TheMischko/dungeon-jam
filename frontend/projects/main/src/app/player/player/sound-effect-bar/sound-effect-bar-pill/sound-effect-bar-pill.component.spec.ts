import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SoundEffectBarPillComponent } from './sound-effect-bar-pill.component';

describe('SoundEffectBarPillComponent', () => {
  let component: SoundEffectBarPillComponent;
  let fixture: ComponentFixture<SoundEffectBarPillComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SoundEffectBarPillComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SoundEffectBarPillComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
