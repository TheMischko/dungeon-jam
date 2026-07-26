import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GridControlsComponent } from './grid-controls.component';

describe('GridControlsComponent', () => {
  let component: GridControlsComponent;
  let fixture: ComponentFixture<GridControlsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GridControlsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(GridControlsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
