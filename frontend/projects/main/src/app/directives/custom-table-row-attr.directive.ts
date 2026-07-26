import { AfterViewInit, Directive, ElementRef, input } from '@angular/core';

@Directive({
  selector: '[appCustomTableRowAttr]',
})
export class CustomTableRowAttrDirective implements AfterViewInit {
  readonly customRowAttribute = input<string | undefined>(undefined);
  readonly customRowAttributeValue = input<string | undefined>(undefined);

  constructor(private element: ElementRef) {}

  ngAfterViewInit() {
    const attributeName = this.customRowAttribute();
    const attributeValue = this.customRowAttributeValue();
    if (!attributeName || !attributeValue) {
      return;
    }
    const element: HTMLElement = this.element.nativeElement;
    element.setAttribute(attributeName, attributeValue);
  }
}
