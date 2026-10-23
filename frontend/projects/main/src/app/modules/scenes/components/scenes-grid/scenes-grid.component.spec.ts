import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { Scene } from '@shared/models/scene.model';

import { ScenesGridComponent } from './scenes-grid.component';
import { BigSizeGridItemConfig } from '../../../../models/grid.model';

describe('ScenesGridComponent', () => {
  let component: ScenesGridComponent;
  let fixture: ComponentFixture<ScenesGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScenesGridComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ScenesGridComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('scenes', []);
    fixture.componentRef.setInput('sizeConfig', BigSizeGridItemConfig);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit the dropped scene list event', () => {
    const dropEvent = {
      previousIndex: 0,
      currentIndex: 1,
    } as CdkDragDrop<Scene[]>;
    let emittedEvent: CdkDragDrop<Scene[]> | undefined;
    const emitSceneDropped = (
      component as unknown as {
        emitSceneDropped: (event: CdkDragDrop<Scene[]>) => void;
      }
    ).emitSceneDropped.bind(component);
    component.reorderDrop.subscribe((event) => {
      emittedEvent = event;
    });

    emitSceneDropped(dropEvent);

    expect(emittedEvent).toBe(dropEvent);
  });
});
