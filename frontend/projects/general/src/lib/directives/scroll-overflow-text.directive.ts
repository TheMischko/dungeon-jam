import {
  Directive,
  ElementRef,
  HostListener,
  inject,
  OnDestroy,
  OnInit,
  Renderer2,
} from '@angular/core';

@Directive({
  selector: '[libScrollOverflowText]',
  standalone: true,
})
export class ScrollOverflowTextDirective implements OnInit, OnDestroy {
  private elementRef = inject(ElementRef);
  private renderer = inject(Renderer2);

  private readonly ANIMATION_DELAY = 15;
  private readonly ANIMATION_PIXEL_STEP = 1;

  private element: HTMLElement = this.elementRef.nativeElement;
  private observer?: MutationObserver;
  private resizeObserver?: ResizeObserver;
  private overflowing: boolean = false;
  private scrollInterval: number | undefined = undefined;

  ngOnInit() {
    this.observer = new MutationObserver(() => {
      this.checkOverflow();
    });
    this.resizeObserver = new ResizeObserver(() => {
      this.checkOverflow();
    });

    this.renderer.setStyle(
      this.elementRef.nativeElement,
      'overflow-x',
      'hidden'
    );
    this.renderer.setStyle(
      this.elementRef.nativeElement,
      'user-select',
      'none'
    );

    this.observer.observe(this.element, {
      characterData: true,
    });
    this.resizeObserver.observe(this.element);
  }

  ngOnDestroy() {
    this.clearInterval();
    this.observer?.disconnect();
    this.resizeObserver?.disconnect();
  }

  private checkOverflow(): void {
    this.overflowing = this.element.scrollWidth > this.element.offsetWidth + 15;
  }

  @HostListener('mouseenter')
  startScroll(): void {
    if (!this.overflowing || this.scrollInterval !== undefined) {
      return;
    }
    setTimeout(() => {
      this.scrollInterval = setInterval(() => {
        const currentScroll = this.element.scrollLeft;
        const maxScroll = this.element.scrollWidth - this.element.offsetWidth;
        if (currentScroll >= maxScroll) {
          this.clearInterval();
          return;
        }
        this.scrollElementContent();
      }, this.ANIMATION_DELAY);
    }, 250);
  }

  @HostListener('mouseleave')
  stopScroll(): void {
    if (!this.overflowing && !this.scrollInterval) {
      return;
    }
    setTimeout(() => {
      this.clearInterval();
      requestAnimationFrame(() => {
        this.element.scrollTo({
          left: 0,
        });
      });
    }, 250);
  }

  private scrollElementContent(): void {
    const currentPos = this.element.scrollLeft;
    const newOffset = currentPos + this.ANIMATION_PIXEL_STEP;
    requestAnimationFrame(() => {
      this.element.scrollTo({
        left: newOffset,
      });
    });
  }

  private clearInterval(): void {
    clearInterval(this.scrollInterval);
    this.scrollInterval = undefined;
  }
}
