import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SongsDropInZoneComponent } from './songs-drop-in-zone.component';

describe('SongsDropInZoneComponent', () => {
  let component: SongsDropInZoneComponent;
  let fixture: ComponentFixture<SongsDropInZoneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SongsDropInZoneComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SongsDropInZoneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
