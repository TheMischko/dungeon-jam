import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterBoxComponent } from './filter-box.component';

interface TestOption {
  id: string;
  name: string;
}

describe('FilterBoxComponent', () => {
  let component: FilterBoxComponent<TestOption>;
  let fixture: ComponentFixture<FilterBoxComponent<TestOption>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilterBoxComponent]
    })
    .compileComponents();

    fixture =
      TestBed.createComponent<FilterBoxComponent<TestOption>>(
        FilterBoxComponent
      );
    component = fixture.componentInstance;
    fixture.componentRef.setInput('options', [{ id: '1', name: 'Option 1' }]);
    fixture.componentRef.setInput('optionDisplayField', 'name');
    fixture.componentRef.setInput('label', 'Test Label');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
