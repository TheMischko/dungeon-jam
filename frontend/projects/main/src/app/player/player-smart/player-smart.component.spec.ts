import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayerSmartComponent } from './player-smart.component';

describe('PlayerSmartComponent', () => {
  let component: PlayerSmartComponent;
  let fixture: ComponentFixture<PlayerSmartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlayerSmartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlayerSmartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
