import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CustomTableRowAttrDirective } from './custom-table-row-attr.directive';

@Component({
  standalone: true,
  imports: [CustomTableRowAttrDirective],
  template: `<div appCustomTableRowAttr></div>`,
})
class TestHostComponent {}

describe('CustomTableRowAttrDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
  });

  it('should create an instance', () => {
    fixture.detectChanges();

    const directive = fixture.debugElement.children[0].injector.get(
      CustomTableRowAttrDirective
    );
    expect(directive).toBeTruthy();
  });
});
