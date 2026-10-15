import { binding, given, then, when } from 'cucumber-tsflow';
import { expect } from 'playwright/test';
import { TestContext } from '../../context/context';
import { BaseSteps } from '../base.steps';
import { PlaylistTracksPage } from '../../pages/main/playlist-tracks.page';
import { measureAudioOutput } from '../../utils/audio-playback-inspector';

import { PlaylistLandingPage } from '../../pages/main/playlist-landing.page';
import { PlayerPage } from '../../pages/main/player.page';

@binding([TestContext])
export class PlaybackAudioSteps extends BaseSteps {

  private playlistTracksPage: PlaylistTracksPage;

  constructor(protected context: TestContext) {
    super(context);
    this.playlistTracksPage = new PlaylistTracksPage(context);
  }

  @when('the user starts playback of the current playlist')
  async startPlaylistPlayback(): Promise<void> {
    const page = this.context.windows.mainWindow;

    const detailRow = this.playlistTracksPage.getDetailTrackRow('A Minor');
    await detailRow.waitFor({ state: 'visible', timeout: 10000 });

    // Allow time for playlistTracksStore and the Angular view to bind track entities
    await page.waitForTimeout(600);

    await this.playlistTracksPage.clickPlayPlaylist();
  }

  @when('the user hovers over playlist card {string} and clicks play')
  async playPlaylistFromCard(playlistName: string): Promise<void> {
    const landingPage = new PlaylistLandingPage(this.context);
    await landingPage.clickPlaylistCardPlayButton(playlistName);
  }

  @given('the playback is stopped')
  async ensurePlaybackIsStopped(): Promise<void> {
    const page = this.context.windows.mainWindow;
    const result = await measureAudioOutput(page, 300);
    expect(result.isAudible).toBe(false);
  }

  @then(
    'the application should be producing audible sound within {int} seconds',
    undefined,
    15000
  )
  async assertAudioIsAudible(timeoutSeconds: number): Promise<void> {
    const page = this.context.windows.mainWindow;
    const timeoutMs = timeoutSeconds * 1000;
    const startTime = Date.now();

    let audible = false;
    let lastRms = 0;

    let lastResult: any;

    while (Date.now() - startTime < timeoutMs) {
      const result = await measureAudioOutput(page, 400, 0.01);
      lastRms = result.maxRms;
      lastResult = result;
      if (result.isAudible) {
        audible = true;
        break;
      }
      await page.waitForTimeout(200);
    }

    expect(
      audible,
      `Expected audible sound within ${timeoutSeconds}s, but max RMS was ${lastRms}. Debug: ${JSON.stringify(
        lastResult?.debugInfo
      )}`
    ).toBe(true);
  }

  @then('the application should not be producing audible sound')
  async assertAudioIsNotAudible(): Promise<void> {
    const page = this.context.windows.mainWindow;
    const result = await measureAudioOutput(page, 500, 0.01);

    expect(
      result.isAudible,
      `Expected silence, but detected audible sound with RMS ${result.maxRms}`
    ).toBe(false);
  }

  @then('the active track in player should be {string}')
  async assertActiveTrack(trackName: string): Promise<void> {
    const trackLabel = this.context.windows.mainWindow
      .locator('.player-content .info p')
      .first();
    await expect(trackLabel).toHaveText(trackName, { timeout: 10000 });
  }

  @when('the user clicks pause in the player')
  async clickPauseInPlayer(): Promise<void> {
    const playerPage = new PlayerPage(this.context);
    await playerPage.clickPlayPause();
  }

  @when('the user clicks play in the player')
  async clickPlayInPlayer(): Promise<void> {
    const playerPage = new PlayerPage(this.context);
    await playerPage.clickPlayPause();
  }

  @when('the user clicks next track in the player')
  async clickNextInPlayer(): Promise<void> {
    const playerPage = new PlayerPage(this.context);
    await playerPage.clickNext();
  }

  @when('the user clicks previous track in the player')
  async clickPrevInPlayer(): Promise<void> {
    const playerPage = new PlayerPage(this.context);
    const page = this.context.windows.mainWindow;

    const initialTrack = await playerPage
      .getActiveTrackNameLocator()
      .innerText();

    await playerPage.clickPrev();
    await page.waitForTimeout(300);

    // Media players rewind to start if position > 5s.
    // If still on the same track, click previous once more to go back to the previous track in history.
    const currentTrack = await playerPage
      .getActiveTrackNameLocator()
      .innerText();
    if (currentTrack === initialTrack) {
      await playerPage.clickPrev();
    }
  }

  @when(/^the user sets volume in the player to (\d+(?:\.\d+)?)$/)
  async setPlayerVolume(volumeStr: string): Promise<void> {
    const volume = parseFloat(volumeStr);
    const playerPage = new PlayerPage(this.context);
    await playerPage.setVolume(volume);
    await this.context.windows.mainWindow.waitForTimeout(200);
  }

  @then('the player volume icon should indicate muted')
  async assertVolumeIconMuted(): Promise<void> {
    const playerPage = new PlayerPage(this.context);
    const icon = playerPage.getVolumeIconLocator();
    await expect(icon).toHaveClass(/lucide-volume-x/, { timeout: 5000 });
  }

  @then('the player volume icon should indicate unmuted')
  async assertVolumeIconUnmuted(): Promise<void> {
    const playerPage = new PlayerPage(this.context);
    const icon = playerPage.getVolumeIconLocator();
    await expect(icon).toHaveClass(/lucide-volume-2|lucide-volume-1/, { timeout: 5000 });
  }
}



