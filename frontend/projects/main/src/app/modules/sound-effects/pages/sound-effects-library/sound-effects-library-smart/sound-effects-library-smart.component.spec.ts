import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SoundEffectsLibrarySmartComponent } from './sound-effects-library-smart.component';

describe('SoundEffectsLibrarySmartComponent', () => {
  let component: SoundEffectsLibrarySmartComponent;
  let fixture: ComponentFixture<SoundEffectsLibrarySmartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SoundEffectsLibrarySmartComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SoundEffectsLibrarySmartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
