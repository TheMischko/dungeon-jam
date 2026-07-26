import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableComponent } from './table.component';

interface TestRow {
  id: string;
  name: string;
}

describe('TableComponent', () => {
  let component: TableComponent<TestRow>;
  let fixture: ComponentFixture<TableComponent<TestRow>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent<TableComponent<TestRow>>(TableComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('config', {});
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
