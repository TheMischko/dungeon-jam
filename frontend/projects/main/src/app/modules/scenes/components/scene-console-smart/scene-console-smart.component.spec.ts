import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SceneConsoleSmartComponent } from './scene-console-smart.component';

describe('SceneConsoleSmartComponent', () => {
  let component: SceneConsoleSmartComponent;
  let fixture: ComponentFixture<SceneConsoleSmartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SceneConsoleSmartComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SceneConsoleSmartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
