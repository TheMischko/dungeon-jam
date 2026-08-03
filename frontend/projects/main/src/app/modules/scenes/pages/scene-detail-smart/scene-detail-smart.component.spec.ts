import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SceneDetailSmartComponent } from './scene-detail-smart.component';
import { SceneApiService } from '@general/services/scene-api.service';
import { DialogService } from '../../../../services/dialog.service';
import { ScenesStore } from '@general/stores/scenes.store';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { Scene } from '@shared/models/scene.model';

describe('SceneDetailSmartComponent', () => {
  let component: SceneDetailSmartComponent;
  let fixture: ComponentFixture<SceneDetailSmartComponent>;
  let mockSceneApiService: any;
  let mockDialogService: any;
  let mockScenesStore: any;
  let mockRouter: any;

  const mockScene: Scene = {
    id: 'scene-1',
    name: 'Test Scene',
    tags: [],
    playlistId: null,
    introTrackIds: [],
    ambience: [],
    stingers: [],
    order: 0,
    dateCreated: new Date(),
    dateUpdated: new Date(),
  };

  beforeEach(async () => {
    mockSceneApiService = {
      delete: vi.fn().mockReturnValue(of(undefined)),
    };
    mockDialogService = {
      open: vi.fn(),
    };
    mockScenesStore = {
      entityMap: vi.fn().mockReturnValue({ 'scene-1': mockScene }),
      entities: vi.fn().mockReturnValue([mockScene]),
      loading: vi.fn().mockReturnValue(false),
      deleteScene: vi.fn(),
      loadAll: vi.fn(),
    };
    mockRouter = {
      navigate: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [SceneDetailSmartComponent],
      providers: [
        { provide: SceneApiService, useValue: mockSceneApiService },
        { provide: DialogService, useValue: mockDialogService },
        { provide: ScenesStore, useValue: mockScenesStore },
        { provide: Router, useValue: mockRouter },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SceneDetailSmartComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('sceneId', 'scene-1');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should open delete confirmation modal and delete scene on confirm', () => {
    mockDialogService.open.mockReturnValue({
      afterClosed$: of(true),
    });

    component.openDeleteSceneModal();

    expect(mockDialogService.open).toHaveBeenCalled();
    expect(mockSceneApiService.delete).toHaveBeenCalledWith('scene-1');
    expect(mockScenesStore.deleteScene).toHaveBeenCalledWith('scene-1');
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/', 'scenes']);
  });

  it('should not delete scene if user cancels confirmation dialog', () => {
    mockDialogService.open.mockReturnValue({
      afterClosed$: of(false),
    });

    component.openDeleteSceneModal();

    expect(mockDialogService.open).toHaveBeenCalled();
    expect(mockSceneApiService.delete).not.toHaveBeenCalled();
    expect(mockScenesStore.deleteScene).not.toHaveBeenCalled();
    expect(mockRouter.navigate).not.toHaveBeenCalled();
  });
});
