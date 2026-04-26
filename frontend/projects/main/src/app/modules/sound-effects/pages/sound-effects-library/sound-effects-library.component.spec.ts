import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SoundEffectsLibraryComponent } from './sound-effects-library.component';

describe('SoundEffectsLibraryComponent', () => {
  let component: SoundEffectsLibraryComponent;
  let fixture: ComponentFixture<SoundEffectsLibraryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SoundEffectsLibraryComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SoundEffectsLibraryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
