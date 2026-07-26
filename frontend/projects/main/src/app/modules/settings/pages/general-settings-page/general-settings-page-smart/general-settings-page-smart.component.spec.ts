import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneralSettingsPageSmartComponent } from './general-settings-page-smart.component';

describe('GeneralSettingsPageSmartComponent', () => {
  let component: GeneralSettingsPageSmartComponent;
  let fixture: ComponentFixture<GeneralSettingsPageSmartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GeneralSettingsPageSmartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GeneralSettingsPageSmartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
