import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SessionsGridComponent } from './sessions-grid.component';
import { BigSizeGridItemConfig } from '../../../../models/grid.model';

describe('SessionsGridComponent', () => {
  let component: SessionsGridComponent;
  let fixture: ComponentFixture<SessionsGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SessionsGridComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SessionsGridComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('sessions', []);
    fixture.componentRef.setInput('sizeConfig', BigSizeGridItemConfig);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
