import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SongTableActionsMenuComponent } from './song-table-actions-menu.component';

describe('SongTableActionsMenuComponent', () => {
  let component: SongTableActionsMenuComponent;
  let fixture: ComponentFixture<SongTableActionsMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SongTableActionsMenuComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SongTableActionsMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
