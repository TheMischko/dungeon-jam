import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Scene } from '@shared/models/scene.model';

import { AssignedSceneBoxComponent } from './assigned-scene-box.component';

const mockScene: Scene = {
  id: 'scene-1',
  name: 'Test Scene',
  tags: [],
  playlistId: null,
  introTrackIds: [],
  ambience: [],
  stingers: [],
  order: 0,
  dateCreated: new Date(0),
  dateUpdated: new Date(0),
};

describe('AssignedSceneBoxComponent', () => {
  let component: AssignedSceneBoxComponent;
  let fixture: ComponentFixture<AssignedSceneBoxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssignedSceneBoxComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AssignedSceneBoxComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('scene', mockScene);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
