import { binding, then, when } from 'cucumber-tsflow';
import { expect } from 'playwright/test';
import { TestContext } from '../../context/context';
import { BaseSteps } from '../base.steps';
import { LibraryLandingPage } from '../../pages/main/library-landing.page';

@binding([TestContext])
export class LibrarySteps extends BaseSteps {
  private libraryPage: LibraryLandingPage;

  constructor(protected context: TestContext) {
    super(context);
    this.libraryPage = new LibraryLandingPage(context);
  }

  @when('the user searches for {string} in library')
  async searchInLibrary(query: string): Promise<void> {
    await this.libraryPage.searchTrack(query);
    // Allow debounce and reactive store update
    await this.context.windows.mainWindow.waitForTimeout(400);
  }

  @when('the user clears the search in library')
  async clearSearchInLibrary(): Promise<void> {
    await this.libraryPage.clearSearch();
    await this.context.windows.mainWindow.waitForTimeout(400);
  }

  @then('the library should not display the track {string}')
  async assertTrackNotDisplayed(trackTitle: string): Promise<void> {
    const row = this.libraryPage.getTrackRow(trackTitle);
    await expect(row).not.toBeVisible();
  }

  @then('the library should display no search results message')
  async assertNoSearchResultsMessage(): Promise<void> {
    const noData = this.libraryPage.getNoDataLocator();
    await expect(noData).toBeVisible();
  }

  @when('the user hovers over library track {string} and clicks play')
  async hoverAndPlayLibraryTrack(trackTitle: string): Promise<void> {
    await this.libraryPage.hoverAndPlayTrack(trackTitle);
  }
}
