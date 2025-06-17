import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TracksUploadModalComponent } from './tracks-upload-modal.component';

describe('TracksUploadModalComponent', () => {
  let component: TracksUploadModalComponent;
  let fixture: ComponentFixture<TracksUploadModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TracksUploadModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TracksUploadModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
