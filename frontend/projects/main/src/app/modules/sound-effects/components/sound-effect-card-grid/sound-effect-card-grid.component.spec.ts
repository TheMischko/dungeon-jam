import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SoundEffectCardGridComponent } from './sound-effect-card-grid.component';

describe('SoundEffectCardGridComponent', () => {
  let component: SoundEffectCardGridComponent;
  let fixture: ComponentFixture<SoundEffectCardGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SoundEffectCardGridComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SoundEffectCardGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
