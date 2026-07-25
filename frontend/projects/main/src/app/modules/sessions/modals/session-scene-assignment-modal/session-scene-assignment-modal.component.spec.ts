import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SessionData } from '@shared/models/session.model';

import {
  SessionSceneAssignmentData,
  SessionSceneAssignmentModalComponent,
} from './session-scene-assignment-modal.component';

const mockSession: SessionData = {
  id: 'session-1',
  name: 'Test Session',
  scenes: [],
  order: 0,
  dateCreated: new Date(0),
  dateUpdated: new Date(0),
};

const mockData: SessionSceneAssignmentData = { session: mockSession };

describe('SessionSceneAssignmentModalComponent', () => {
  let component: SessionSceneAssignmentModalComponent;
  let fixture: ComponentFixture<SessionSceneAssignmentModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SessionSceneAssignmentModalComponent],
      providers: [
        { provide: MatDialogRef, useValue: { close: () => undefined } },
        { provide: MAT_DIALOG_DATA, useValue: mockData },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SessionSceneAssignmentModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
