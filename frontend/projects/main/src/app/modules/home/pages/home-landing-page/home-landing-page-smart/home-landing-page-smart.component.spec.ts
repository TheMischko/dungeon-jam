import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeLandingPageSmartComponent } from './home-landing-page-smart.component';

describe('HomeLandingPageSmartComponent', () => {
  let component: HomeLandingPageSmartComponent;
  let fixture: ComponentFixture<HomeLandingPageSmartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeLandingPageSmartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeLandingPageSmartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
