export const addXAxisScrolling = (selector: string): void => {
  const element = document.querySelector<HTMLDivElement>(selector);
  if (!element) {
    console.warn(
      `Element with selector ${selector} could not be found to add X axis scrolling.`
    );
    return;
  }

  element.addEventListener('wheel', (event) => {
    element.scrollBy({
      left: event.deltaY < 0 ? -45 : 45,
    });
    event.preventDefault();
  });
};
