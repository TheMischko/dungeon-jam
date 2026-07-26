import { ElectronApplication, Page } from 'playwright';

export const findViewByUrl = (
  electronApp: ElectronApplication,
  urlSnippet: string
): Page => {
  const contexts = electronApp.windows();

  for (const page of contexts) {
    const url = page.url();
    if (url.includes(urlSnippet)) {
      return page;
    }
  }

  throw new Error(
    `Cound not find an active View matching snippet "${urlSnippet}"`
  );
};
