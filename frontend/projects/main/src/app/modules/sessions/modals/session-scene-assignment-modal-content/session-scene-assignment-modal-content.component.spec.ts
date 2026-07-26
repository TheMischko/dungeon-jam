import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SessionSceneAssignmentModalContentComponent } from './session-scene-assignment-modal-content.component';

describe('SessionSceneAssignmentModalContentComponent', () => {
  let component: SessionSceneAssignmentModalContentComponent;
  let fixture: ComponentFixture<SessionSceneAssignmentModalContentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SessionSceneAssignmentModalContentComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(
      SessionSceneAssignmentModalContentComponent
    );
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
