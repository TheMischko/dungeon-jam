import { ElectronApplication, Page } from 'playwright';

export const findViewByUrl = async (
  electronApp: ElectronApplication,
  urlSnippet: string,
  timeout = 7000
): Promise<Page> => {
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    const contexts = electronApp.windows();

    for (const page of contexts) {
      const url = page.url();
      if (url.includes(urlSnippet)) {
        return page;
      }
    }
    await new Promise((r) => setTimeout(r, 200));
  }

  const urls = electronApp.windows().map((w) => w.url());
  throw new Error(
    `Could not find an active View matching snippet "${urlSnippet}". Available URLs: ${JSON.stringify(urls)}`
  );
};
