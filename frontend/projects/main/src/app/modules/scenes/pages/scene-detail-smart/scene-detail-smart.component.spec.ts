import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SceneDetailSmartComponent } from './scene-detail-smart.component';

describe('SceneDetailSmartComponent', () => {
  let component: SceneDetailSmartComponent;
  let fixture: ComponentFixture<SceneDetailSmartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SceneDetailSmartComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SceneDetailSmartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
