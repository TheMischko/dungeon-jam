import { computed, signal, Signal } from '@angular/core';

export class SignalPaginationService<T> {
  public static create<T>(dataSource: Signal<T[]>): SignalPaginationService<T> {
    return new SignalPaginationService<T>(dataSource);
  }

  public pageSize = signal<number>(20);
  public currentPageIndex = signal<number>(0);

  public currentPageData = computed<T[]>(() => {
    return this.pages()[this.currentPageIndex()];
  });

  public totalPages = computed<number>(() => {
    return this.pages().length;
  });

  public totalItems = computed<number>(() => {
    return this.dataSource().length;
  });

  private pages = computed<T[][]>(() => {
    return this.splitIntoPages(this.dataSource(), this.pageSize());
  });

  constructor(private dataSource: Signal<T[]>) {
  }

  public nextPage(): void {
    if (this.currentPageIndex() + 1 >= this.totalPages()) {
      return;
    }
    this.currentPageIndex.update(index => index + 1);
  }

  public previousPage(): void {
    if (this.currentPageIndex() === 0) {
      return;
    }
    this.currentPageIndex.update(index => index - 1);
  }

  public goToPage(pageIndex: number): void {
    if (pageIndex < 0 || pageIndex >= this.totalPages()) {
      return;
    }
    this.currentPageIndex.set(pageIndex);
  }

  public resetPage(): void {
    this.goToPage(0);
  }

  private splitIntoPages(data: T[], pageSize: number): T[][] {
    const totalPages = Math.ceil(data.length / pageSize);
    const pages: T[][] = [];

    for (let i = 0; i < totalPages; i++) {
      const start = i * pageSize;
      const end = start + pageSize;
      pages.push(data.slice(start, end));
    }

    return pages;
  }
}
