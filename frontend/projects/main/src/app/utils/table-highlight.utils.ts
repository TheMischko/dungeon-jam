export const getRowWithTrackById = (trackById: string): HTMLElement | null => {
  return document.querySelector(`mat-row[track-by-id="${trackById}"]`);
};

const HIGHLIGHT_CLASS_REMOVE_TIME = 2_000;

export const showHighlightedElement = (
  element: HTMLElement | Element | null
): void => {
  if (!element) {
    return;
  }
  element.scrollIntoView({
    block: 'center',
  });
  element.classList.add('highlight-focus');
  setTimeout(() => {
    requestAnimationFrame(() => {
      element.classList.remove('highlight-focus');
    });
  }, HIGHLIGHT_CLASS_REMOVE_TIME);
};
