import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectLibraryTracksModalComponent } from './select-library-tracks-modal.component';

describe('SelectLibraryTracksModalComponent', () => {
  let component: SelectLibraryTracksModalComponent;
  let fixture: ComponentFixture<SelectLibraryTracksModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectLibraryTracksModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelectLibraryTracksModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
