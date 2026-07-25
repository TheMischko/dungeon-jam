import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GridPlaylistSizeConfig } from '../../../../../models/grid-item-size-config.model';

import { PlaylistGridComponent } from './playlist-grid.component';

const mockSizeConfig: GridPlaylistSizeConfig = {
  imageSize: 100,
  titleSize: 12,
};

describe('PlaylistGridComponent', () => {
  let component: PlaylistGridComponent;
  let fixture: ComponentFixture<PlaylistGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlaylistGridComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlaylistGridComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('dataSet', []);
    fixture.componentRef.setInput('sizeConfig', mockSizeConfig);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
