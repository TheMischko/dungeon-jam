import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SceneDetailComponent } from './scene-detail.component';
import { Scene } from '@shared/models/scene.model';

describe('SceneDetailComponent', () => {
  let component: SceneDetailComponent;
  let fixture: ComponentFixture<SceneDetailComponent>;

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
      imports: [SceneDetailComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SceneDetailComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('scene', mockScene);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
