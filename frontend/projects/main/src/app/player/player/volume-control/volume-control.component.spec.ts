import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VolumeControlComponent } from './volume-control.component';

describe('VolumeControlComponent', () => {
  let component: VolumeControlComponent;
  let fixture: ComponentFixture<VolumeControlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VolumeControlComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VolumeControlComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('volume', 1);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
