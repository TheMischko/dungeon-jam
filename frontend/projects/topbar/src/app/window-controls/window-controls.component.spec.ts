import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WindowControlsComponent } from './window-controls.component';

describe('WindowControlsComponent', () => {
  let component: WindowControlsComponent;
  let fixture: ComponentFixture<WindowControlsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WindowControlsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WindowControlsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
