import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SceneConsoleComponent } from './scene-console.component';

describe('SceneConsoleComponent', () => {
  let component: SceneConsoleComponent;
  let fixture: ComponentFixture<SceneConsoleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SceneConsoleComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SceneConsoleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
