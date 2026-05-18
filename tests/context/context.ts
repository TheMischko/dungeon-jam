import { Page } from 'playwright';
import { AudioTrack } from '@shared/models/track.model';

export class TestContext {
  public windows!: AppWindows;
  public uploadedTracks: AudioTrack[] = [];
}

export type AppWindows = {
  mainWindow: Page;
  sidebarWindow: Page;
  topbarWindow: Page;
};
