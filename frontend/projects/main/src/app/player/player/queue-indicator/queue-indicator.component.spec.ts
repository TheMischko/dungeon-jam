import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QueueIndicatorComponent } from './queue-indicator.component';

describe('QueueIndicatorComponent', () => {
  let component: QueueIndicatorComponent;
  let fixture: ComponentFixture<QueueIndicatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QueueIndicatorComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(QueueIndicatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
