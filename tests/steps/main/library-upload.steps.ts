import path from 'node:path';
import { binding, given, then, when } from 'cucumber-tsflow';
import { TestContext } from '../../context/context';
import { BaseSteps } from '../base.steps';
import { LibraryLandingPage } from '../../pages/main/library-landing.page';
import { expect } from 'playwright/test';
import { fetchAudioTrackData } from '../../apis/audio-files.api';
import { createTrack, TrackSeedData } from '../../apis/tracks.api';

const FIXTURE_FILES = [
  path.join(__dirname, '../../fixtures/sounds/a-minor.mp3'),
  path.join(__dirname, '../../fixtures/sounds/b-minor.mp3'),
  path.join(__dirname, '../../fixtures/sounds/e-minor.mp3'),
  path.join(__dirname, '../../fixtures/sounds/g-minor-longer.mp3'),
];

@binding([TestContext])
export class LibraryUploadSteps extends BaseSteps {
  private page: LibraryLandingPage;

  constructor(protected context: TestContext) {
    super(context);
    this.page = new LibraryLandingPage(context);
  }

  @when('the user drops the audio fixture files onto the library drop zone')
  async dropAudioFixtureFiles(): Promise<void> {
    await this.page.dropFiles(FIXTURE_FILES);

    this.context.uploadedTracks = await fetchAudioTrackData(
      this.page.page,
      FIXTURE_FILES
    );
  }

  @given('there is a track prepared with name {string} and path {string}')
  async prepareTrack(name: string, filePath: string): Promise<void> {
    const data: TrackSeedData = { name, url: filePath, duration: 0 };
    await createTrack(this.page.page, data);
  }

  @when('the user clicks {string} in the bulk upload modal')
  async clickInBulkUploadModal(buttonText: string): Promise<void> {
    await this.page.clickBulkModalButton(buttonText);
  }

  @when('the user confirms all tracks in the upload modal')
  async confirmAllTracksInUploadModal(): Promise<void> {
    await this.page.confirmAllUploadSteps(FIXTURE_FILES.length);
  }

  @then('the library should display the track {string}')
  async trackIsVisibleInLibrary(trackTitle: string): Promise<void> {
    const row = this.page.getTrackRow(trackTitle);
    await expect(row).toBeVisible();
  }
}
