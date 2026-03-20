import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChildPlaylistBoxComponent } from './child-playlist-box.component';

describe('ChildPlaylistBoxComponent', () => {
  let component: ChildPlaylistBoxComponent;
  let fixture: ComponentFixture<ChildPlaylistBoxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChildPlaylistBoxComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChildPlaylistBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
