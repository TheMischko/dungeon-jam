import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DndDirective } from './dnd.directive';

@Component({
  standalone: true,
  imports: [DndDirective],
  template: `<div appDnd></div>`,
})
class TestHostComponent {}

describe('DndDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
  });

  it('should create an instance', () => {
    fixture.detectChanges();

    const directive =
      fixture.debugElement.children[0].injector.get(DndDirective);
    expect(directive).toBeTruthy();
  });
});
