import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ScrollOverflowTextDirective } from './scroll-overflow-text.directive';

@Component({
  standalone: true,
  imports: [ScrollOverflowTextDirective],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `<div libScrollOverflowText>Some text</div>`,
})
class TestHostComponent {}

describe('ScrollOverflowTextDirective', () => {
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
      ScrollOverflowTextDirective
    );
    expect(directive).toBeTruthy();
  });
});
