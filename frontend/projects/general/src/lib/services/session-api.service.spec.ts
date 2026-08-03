import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { vi } from 'vitest';
import { SessionApiService } from './session-api.service';
import { SessionData } from '@shared/models/session.model';

describe('SessionApiService', () => {
  let service: SessionApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SessionApiService);

    (window as any).SESSION_API = {
      getAllSessions: vi.fn(),
      getSessionById: vi.fn(),
      insertSession: vi.fn(),
      updateSession: vi.fn(),
      deleteSession: vi.fn(),
      getSessionScenes: vi.fn(),
      getSessionImages: vi.fn(),
    };
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call window.SESSION_API.deleteSession when delete is called', async () => {
    vi.spyOn((window as any).SESSION_API, 'deleteSession').mockResolvedValue(
      undefined
    );

    await firstValueFrom(service.delete('session-123'));

    expect((window as any).SESSION_API.deleteSession).toHaveBeenCalledWith(
      'session-123'
    );
  });

  it('should call window.SESSION_API.updateSession when update is called', async () => {
    const updatedSession: Partial<SessionData> = {
      id: 'session-123',
      name: 'Updated Session Name',
    };
    vi.spyOn((window as any).SESSION_API, 'updateSession').mockResolvedValue(
      updatedSession as SessionData
    );

    const result = await firstValueFrom(
      service.update({ id: 'session-123', name: 'Updated Session Name' })
    );

    expect((window as any).SESSION_API.updateSession).toHaveBeenCalledWith({
      id: 'session-123',
      name: 'Updated Session Name',
    });
    expect(result).toEqual(updatedSession);
  });
});
