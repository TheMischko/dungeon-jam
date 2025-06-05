import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LibraryLandingPageComponent } from './library-landing-page.component';

describe('LibraryLandingPageComponent', () => {
  let component: LibraryLandingPageComponent;
  let fixture: ComponentFixture<LibraryLandingPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LibraryLandingPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LibraryLandingPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
