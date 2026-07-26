import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScenesLandingSmartComponent } from './scenes-landing-smart.component';

describe('ScenesLandingSmartComponent', () => {
  let component: ScenesLandingSmartComponent;
  let fixture: ComponentFixture<ScenesLandingSmartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScenesLandingSmartComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ScenesLandingSmartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
