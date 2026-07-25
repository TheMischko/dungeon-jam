import { ComponentFixture, TestBed } from '@angular/core/testing';

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
});
