import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SessionDetailSmartComponent } from './session-detail-smart.component';
import { SessionApiService } from '@general/services/session-api.service';
import { DialogService } from '../../../../services/dialog.service';
import { SessionStore } from '@general/stores/session.store';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { SessionData } from '@shared/models/session.model';

describe('SessionDetailSmartComponent', () => {
  let component: SessionDetailSmartComponent;
  let fixture: ComponentFixture<SessionDetailSmartComponent>;
  let mockSessionService: any;
  let mockDialogService: any;
  let mockSessionStore: any;
  let mockRouter: any;

  const mockSession: SessionData = {
    id: 'session-1',
    name: 'Test Session',
    description: 'Test Description',
    scenes: [],
    order: 0,
    dateCreated: new Date(),
    dateUpdated: new Date(),
  };

  beforeEach(async () => {
    mockSessionService = {
      getById: vi.fn().mockReturnValue(of(mockSession)),
      update: vi.fn().mockReturnValue(of(mockSession)),
      delete: vi.fn().mockReturnValue(of(undefined)),
    };
    mockDialogService = {
      open: vi.fn(),
    };
    mockSessionStore = {
      deleteSession: vi.fn(),
    };
    mockRouter = {
      navigate: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [SessionDetailSmartComponent],
      providers: [
        { provide: SessionApiService, useValue: mockSessionService },
        { provide: DialogService, useValue: mockDialogService },
        { provide: SessionStore, useValue: mockSessionStore },
        { provide: Router, useValue: mockRouter },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SessionDetailSmartComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('sessionId', 'session-1');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should open edit session modal and update session on save', () => {
    mockDialogService.open.mockReturnValue({
      afterClosed$: of({
        name: 'Updated Name',
        description: 'Updated Description',
      }),
    });

    component.openEditSessionModal();

    expect(mockDialogService.open).toHaveBeenCalled();
    expect(mockSessionService.update).toHaveBeenCalledWith({
      id: 'session-1',
      name: 'Updated Name',
      description: 'Updated Description',
      dateOfSession: undefined,
    });
  });

  it('should open delete confirmation modal and delete session on confirm', () => {
    mockDialogService.open.mockReturnValue({
      afterClosed$: of(true),
    });

    component.openDeleteSessionModal();

    expect(mockDialogService.open).toHaveBeenCalled();
    expect(mockSessionService.delete).toHaveBeenCalledWith('session-1');
    expect(mockSessionStore.deleteSession).toHaveBeenCalledWith('session-1');
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/sessions']);
  });
});
