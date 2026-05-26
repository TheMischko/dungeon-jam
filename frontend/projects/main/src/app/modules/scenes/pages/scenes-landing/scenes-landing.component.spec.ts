import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScenesLandingComponent } from './scenes-landing.component';

describe('ScenesLandingComponent', () => {
  let component: ScenesLandingComponent;
  let fixture: ComponentFixture<ScenesLandingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScenesLandingComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ScenesLandingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
