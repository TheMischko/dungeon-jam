import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { SessionStore } from '@general/stores/session.store';
import { SessionData } from '@shared/models/session.model';
import { DisplayOrderPlacement } from '@shared/models/display-order.model';
import { vi } from 'vitest';

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

  it('should translate a downward drop into a before reorder request', () => {
    const sessions = [createSession('session-1'), createSession('session-2')];
    const sessionsStore = TestBed.inject(SessionStore);
    const reorderSession = (
      component as unknown as {
        reorderSession: (event: CdkDragDrop<SessionData[]>) => void;
      }
    ).reorderSession.bind(component);
    component.sessions.set(sessions);

    vi.spyOn(sessionsStore, 'changeRelativeOrder');
    reorderSession(
      { previousIndex: 0, currentIndex: 1 } as CdkDragDrop<SessionData[]>
    );

    expect(sessionsStore.changeRelativeOrder).toHaveBeenCalledWith({
      entityId: 'session-1',
      anchorEntityId: 'session-2',
      placement: DisplayOrderPlacement.BEFORE,
    });
  });
});

function createSession(id: string): SessionData {
  return {
    id,
    name: id,
    scenes: [],
    order: 0,
    dateCreated: new Date(0),
    dateUpdated: new Date(0),
  };
}
