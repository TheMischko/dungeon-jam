import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScenesGridComponent } from './scenes-grid.component';

describe('ScenesGridComponent', () => {
  let component: ScenesGridComponent;
  let fixture: ComponentFixture<ScenesGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScenesGridComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ScenesGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
