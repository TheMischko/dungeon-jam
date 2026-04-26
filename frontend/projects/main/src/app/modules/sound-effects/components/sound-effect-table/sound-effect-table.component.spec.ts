import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SoundEffectTableComponent } from './sound-effect-table.component';

describe('SoundEffectTableComponent', () => {
  let component: SoundEffectTableComponent;
  let fixture: ComponentFixture<SoundEffectTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SoundEffectTableComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SoundEffectTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
