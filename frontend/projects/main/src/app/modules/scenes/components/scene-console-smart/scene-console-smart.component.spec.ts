import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SceneConsoleSmartComponent } from './scene-console-smart.component';
import { Scene } from '@shared/models/scene.model';

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
});
