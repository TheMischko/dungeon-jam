import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StreamSettingsComponent } from './stream-settings.component';

describe('StreamSettingsComponent', () => {
  let component: StreamSettingsComponent;
  let fixture: ComponentFixture<StreamSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StreamSettingsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StreamSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
