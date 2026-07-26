import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SessionsGridSmartComponent } from './sessions-grid-smart.component';

describe('SessionsGridSmartComponent', () => {
  let component: SessionsGridSmartComponent;
  let fixture: ComponentFixture<SessionsGridSmartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SessionsGridSmartComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SessionsGridSmartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
