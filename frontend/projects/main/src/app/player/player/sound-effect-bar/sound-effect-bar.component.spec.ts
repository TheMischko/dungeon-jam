import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SoundEffectBarComponent } from './sound-effect-bar.component';

describe('SoundEffectBarComponent', () => {
  let component: SoundEffectBarComponent;
  let fixture: ComponentFixture<SoundEffectBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SoundEffectBarComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SoundEffectBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
