import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RepeatStateButtonComponent } from './repeat-state-button.component';

describe('RepeatStateButtonComponent', () => {
  let component: RepeatStateButtonComponent;
  let fixture: ComponentFixture<RepeatStateButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RepeatStateButtonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RepeatStateButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
