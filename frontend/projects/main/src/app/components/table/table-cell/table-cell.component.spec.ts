import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableCellComponent } from './table-cell.component';

interface TestRow {
  id: string;
  name: string;
}

describe('TableCellComponent', () => {
  let component: TableCellComponent<TestRow>;
  let fixture: ComponentFixture<TableCellComponent<TestRow>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableCellComponent]
    })
    .compileComponents();

    fixture =
      TestBed.createComponent<TableCellComponent<TestRow>>(TableCellComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('item', { id: '1', name: 'Row 1' });
    fixture.componentRef.setInput('columnKey', 'name');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
