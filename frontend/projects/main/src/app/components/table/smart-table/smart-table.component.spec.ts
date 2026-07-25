import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SmartTableComponent } from './smart-table.component';

interface TestRow {
  id: string;
  name: string;
}

describe('SmartTableComponent', () => {
  let component: SmartTableComponent<TestRow>;
  let fixture: ComponentFixture<SmartTableComponent<TestRow>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SmartTableComponent]
    })
    .compileComponents();

    fixture =
      TestBed.createComponent<SmartTableComponent<TestRow>>(
        SmartTableComponent
      );
    component = fixture.componentInstance;
    fixture.componentRef.setInput('config', {});
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
