import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneralSettingsPageComponent } from './general-settings-page.component';

describe('GeneralSettingsPageComponent', () => {
  let component: GeneralSettingsPageComponent;
  let fixture: ComponentFixture<GeneralSettingsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GeneralSettingsPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GeneralSettingsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
