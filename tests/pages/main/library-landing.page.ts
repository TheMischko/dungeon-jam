import { BaseMainPage } from '../_base/base-main.page';
import { TestContext } from '../../context/context';
import { Locator } from 'playwright';
import { LibraryLandingSelectors } from '../../selectors/main/library-landing.selectors';

export class LibraryLandingPage extends BaseMainPage {
  constructor(protected context: TestContext) {
    super(context);
  }

  getTrackRow(title: string): Locator {
    return this.page
      .locator(LibraryLandingSelectors.TRACK_ROW_WITH_TITLE(title))
      .first();
  }

  getTrackRowsLocator(): Locator {
    return this.page.locator(LibraryLandingSelectors.TRACK_ROWS);
  }

  getNoDataLocator(): Locator {
    return this.page.locator(LibraryLandingSelectors.NO_DATA_MESSAGE).first();
  }

  async searchTrack(query: string): Promise<void> {
    const input = this.page.locator(LibraryLandingSelectors.SEARCH_INPUT).first();
    await input.waitFor({ state: 'visible' });
    await input.fill(query);
  }

  async clearSearch(): Promise<void> {
    const input = this.page.locator(LibraryLandingSelectors.SEARCH_INPUT).first();
    await input.waitFor({ state: 'visible' });
    await input.fill('');
  }

  async hoverAndPlayTrack(title: string): Promise<void> {
    const row = this.getTrackRow(title);
    await row.waitFor({ state: 'visible' });
    await row.hover();
    const playBtn = row.locator('.mat-column-play button');
    await playBtn.waitFor({ state: 'visible', timeout: 5000 });
    await playBtn.click();
  }

  async dropFiles(filePaths: string[]): Promise<void> {
    const dropZone = this.page.locator(LibraryLandingSelectors.DROP_ZONE);
    await dropZone.waitFor({ state: 'visible' });

    const box = await dropZone.boundingBox();
    if (!box) {
      throw new Error('Drop zone bounding box could not be determined');
    }

    const x = box.x + box.width / 2;
    const y = box.y + box.height / 2;

    const cdpSession = await this.page.context().newCDPSession(this.page);
    const dragData = {
      items: filePaths.map(() => ({ mimeType: 'audio/mpeg', data: '' })),
      files: filePaths,
      dragOperationsMask: 1,
    };

    await cdpSession.send('Input.dispatchDragEvent', {
      type: 'dragEnter',
      x,
      y,
      data: dragData,
    });
    await cdpSession.send('Input.dispatchDragEvent', {
      type: 'dragOver',
      x,
      y,
      data: dragData,
    });
    await cdpSession.send('Input.dispatchDragEvent', {
      type: 'drop',
      x,
      y,
      data: dragData,
    });
    await cdpSession.detach();
  }

  async clickBulkModalButton(buttonText: string): Promise<void> {
    const button = this.page
      .locator(`button:has-text("${buttonText}")`)
      .first();
    await button.waitFor({ state: 'visible' });
    await button.click();
  }

  async confirmAllUploadSteps(trackCount: number): Promise<void> {
    for (let i = 0; i < trackCount; i++) {
      const isLast = i === trackCount - 1;
      const buttonText = isLast ? 'Finish' : 'Next';
      const button = this.page
      .locator(LibraryLandingSelectors.UPLOAD_MODAL_STEP_BUTTON(buttonText))
        .first();
      await button.waitFor({ state: 'visible' });
      await button.click();
    }
  }
}
