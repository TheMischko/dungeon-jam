import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SceneConsoleSmartComponent } from './scene-console-smart.component';
import { Scene } from '@shared/models/scene.model';
import { TrackHighlightType } from '../../../../models/track-highlight.model';

describe('SceneConsoleSmartComponent', () => {
  let component: SceneConsoleSmartComponent;
  let fixture: ComponentFixture<SceneConsoleSmartComponent>;

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
    await TestBed.configureTestingModule({
      imports: [SceneConsoleSmartComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SceneConsoleSmartComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('scene', mockScene);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should create scene context when sessionId is not provided', () => {
    expect(component.trackHighlightContext()).toEqual({
      type: TrackHighlightType.SCENE,
      sceneId: 'scene-1',
    });
  });

  it('should create session context when sessionId is provided', () => {
    fixture.componentRef.setInput('sessionId', 'session-123');
    fixture.detectChanges();

    expect(component.trackHighlightContext()).toEqual({
      type: TrackHighlightType.SESSION,
      sessionId: 'session-123',
    });
  });
});
