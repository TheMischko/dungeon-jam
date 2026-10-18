import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { Scene } from '@shared/models/scene.model';
import { DisplayOrderPlacement } from '@shared/models/display-order.model';
import { ScenesStore } from '@general/stores/scenes.store';
import { vi } from 'vitest';

import { ScenesGridSmartComponent } from './scenes-grid-smart.component';

describe('ScenesGridSmartComponent', () => {
  let component: ScenesGridSmartComponent;
  let fixture: ComponentFixture<ScenesGridSmartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScenesGridSmartComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ScenesGridSmartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should translate a downward drop into an after reorder request', () => {
    const scenes = [createScene('scene-1'), createScene('scene-2')];
    const scenesStore = TestBed.inject(ScenesStore);
    const reorderScene = (
      component as unknown as {
        reorderScene: (event: CdkDragDrop<Scene[]>) => void;
      }
    ).reorderScene.bind(component);
    component.scenes.set(scenes);

    vi.spyOn(scenesStore, 'changeRelativeOrder');
    reorderScene({ previousIndex: 0, currentIndex: 1 } as CdkDragDrop<Scene[]>);

    expect(scenesStore.changeRelativeOrder).toHaveBeenCalledWith({
      entityId: 'scene-1',
      anchorEntityId: 'scene-2',
      placement: DisplayOrderPlacement.AFTER,
    });
  });

  it('should translate an upward drop into a before reorder request', () => {
    const scenes = [createScene('scene-1'), createScene('scene-2')];
    const scenesStore = TestBed.inject(ScenesStore);
    const reorderScene = (
      component as unknown as {
        reorderScene: (event: CdkDragDrop<Scene[]>) => void;
      }
    ).reorderScene.bind(component);
    component.scenes.set(scenes);

    vi.spyOn(scenesStore, 'changeRelativeOrder');
    reorderScene({ previousIndex: 1, currentIndex: 0 } as CdkDragDrop<Scene[]>);

    expect(scenesStore.changeRelativeOrder).toHaveBeenCalledWith({
      entityId: 'scene-2',
      anchorEntityId: 'scene-1',
      placement: DisplayOrderPlacement.BEFORE,
    });
  });
});

function createScene(id: string): Scene {
  return {
    id,
    name: id,
    tags: [],
    playlistId: null,
    introTrackIds: [],
    ambience: [],
    stingers: [],
    order: 0,
    dateCreated: new Date(0),
    dateUpdated: new Date(0),
  };
}
