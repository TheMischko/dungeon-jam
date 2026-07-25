import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QueueIndicatorComponent } from './queue-indicator.component';
import { initialPlaybackState } from '../../../models/playback.model';

describe('QueueIndicatorComponent', () => {
  let component: QueueIndicatorComponent;
  let fixture: ComponentFixture<QueueIndicatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QueueIndicatorComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(QueueIndicatorComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('playback', initialPlaybackState);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
