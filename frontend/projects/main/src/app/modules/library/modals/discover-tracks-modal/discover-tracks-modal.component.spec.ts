import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiscoverTracksModalComponent } from './discover-tracks-modal.component';

describe('DiscoverTracksModalComponent', () => {
  let component: DiscoverTracksModalComponent;
  let fixture: ComponentFixture<DiscoverTracksModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DiscoverTracksModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DiscoverTracksModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
