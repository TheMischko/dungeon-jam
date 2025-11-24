import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditTrackModalComponent } from './edit-track-modal.component';

describe('EditTrackModalComponent', () => {
  let component: EditTrackModalComponent;
  let fixture: ComponentFixture<EditTrackModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditTrackModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditTrackModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
