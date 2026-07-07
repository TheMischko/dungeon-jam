import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SessionsLandingComponent } from './sessions-landing.component';

describe('SessionsLandingComponent', () => {
  let component: SessionsLandingComponent;
  let fixture: ComponentFixture<SessionsLandingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SessionsLandingComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SessionsLandingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
