import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignedSceneBoxComponent } from './assigned-scene-box.component';

describe('AssignedSceneBoxComponent', () => {
  let component: AssignedSceneBoxComponent;
  let fixture: ComponentFixture<AssignedSceneBoxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssignedSceneBoxComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AssignedSceneBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
