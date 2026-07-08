import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SessionSceneAssignmentModalComponent } from './session-scene-assignment-modal.component';

describe('SessionSceneAssignmentModalComponent', () => {
  let component: SessionSceneAssignmentModalComponent;
  let fixture: ComponentFixture<SessionSceneAssignmentModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SessionSceneAssignmentModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SessionSceneAssignmentModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
