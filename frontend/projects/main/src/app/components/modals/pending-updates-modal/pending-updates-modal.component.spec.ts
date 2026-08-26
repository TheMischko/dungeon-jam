import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PendingUpdatesModalComponent } from './pending-updates-modal.component';

describe('PendingUpdatesModalComponent', () => {
  let component: PendingUpdatesModalComponent;
  let fixture: ComponentFixture<PendingUpdatesModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PendingUpdatesModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PendingUpdatesModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
