import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CollapsibleSectionComponent } from './collapsible-section.component';

describe('CollapsibleSectionComponent', () => {
  let component: CollapsibleSectionComponent;
  let fixture: ComponentFixture<CollapsibleSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CollapsibleSectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CollapsibleSectionComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
