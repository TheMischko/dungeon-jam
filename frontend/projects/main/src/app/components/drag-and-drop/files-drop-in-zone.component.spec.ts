import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilesDropInZoneComponent } from './files-drop-in-zone.component';

describe('FilesDropInZoneComponent', () => {
  let component: FilesDropInZoneComponent;
  let fixture: ComponentFixture<FilesDropInZoneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilesDropInZoneComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FilesDropInZoneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
