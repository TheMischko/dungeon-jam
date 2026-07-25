import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WindowControlButtonComponent } from './window-control-button.component';
import { actionsIconSet } from '@general/icons/icons';

describe('WindowControlButtonComponent', () => {
  let component: WindowControlButtonComponent;
  let fixture: ComponentFixture<WindowControlButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WindowControlButtonComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WindowControlButtonComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('icon', actionsIconSet.MinimizeIcon);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
