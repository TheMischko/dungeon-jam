import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SongsTableComponent } from './songs-table.component';

describe('SongsTableComponent', () => {
  let component: SongsTableComponent;
  let fixture: ComponentFixture<SongsTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SongsTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SongsTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
