import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdatePlaylistModalComponent } from './update-playlist-modal.component';

describe('UpdatePlaylistModalComponent', () => {
  let component: UpdatePlaylistModalComponent;
  let fixture: ComponentFixture<UpdatePlaylistModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdatePlaylistModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(UpdatePlaylistModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
