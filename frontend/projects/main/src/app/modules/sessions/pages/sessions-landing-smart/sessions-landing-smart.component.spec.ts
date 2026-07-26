import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SessionsLandingSmartComponent } from './sessions-landing-smart.component';

describe('SessionsLandingSmartComponent', () => {
  let component: SessionsLandingSmartComponent;
  let fixture: ComponentFixture<SessionsLandingSmartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SessionsLandingSmartComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SessionsLandingSmartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
