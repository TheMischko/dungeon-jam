import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SoundEffectBarSmartComponent } from './sound-effect-bar-smart.component';

describe('SoundEffectBarSmartComponent', () => {
  let component: SoundEffectBarSmartComponent;
  let fixture: ComponentFixture<SoundEffectBarSmartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SoundEffectBarSmartComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SoundEffectBarSmartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
