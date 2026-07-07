import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SessionDetailSmartComponent } from './session-detail-smart.component';

describe('SessionDetailSmartComponent', () => {
  let component: SessionDetailSmartComponent;
  let fixture: ComponentFixture<SessionDetailSmartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SessionDetailSmartComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SessionDetailSmartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
