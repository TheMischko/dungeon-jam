export const scrollPageUp = async (timeout: number = 0): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const pageElement = document.querySelector('.page-container');
      pageElement?.scrollTo(0, 0);
      resolve();
    }, timeout);
  });
};
