import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScenesGridSmartComponent } from './scenes-grid-smart.component';

describe('ScenesGridSmartComponent', () => {
  let component: ScenesGridSmartComponent;
  let fixture: ComponentFixture<ScenesGridSmartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScenesGridSmartComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ScenesGridSmartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
