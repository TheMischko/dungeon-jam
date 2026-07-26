import { BaseSteps } from '../base.steps';
import { binding, given } from 'cucumber-tsflow';
import { TestContext } from '../../context/context';
import path from 'node:path';
import { fetchAudioTrackData } from '../../apis/audio-files.api';
import { createTrack, TrackTestData } from '../../apis/tracks.api';
import { BaseMainPage } from '../../pages/_base/base-main.page';
import { PlaylistInsertQuery } from '@shared/models/playlist.model';
import { createPlaylist } from '../../apis/playlists.api';

@binding([TestContext])
export class DataPreparationSteps extends BaseSteps {
  protected page: BaseMainPage;

  constructor(protected context: TestContext) {
    super(context);
    this.page = new BaseMainPage(context);
  }

  @given('there is a playlist prepared called {string}')
  async preparePlaylist(playlistName: string): Promise<void> {
    const playlistData: PlaylistInsertQuery = {
      name: playlistName,
      tags: [],
    };

    await createPlaylist(this.page.page, playlistData);
  }

  @given('there is a track prepared from fixture {string}')
  async prepareTrack(fixtureName: string): Promise<void> {
    const filePath = path.join(
      __dirname,
      `../../fixtures/sounds/${fixtureName}.mp3`
    );
    const audioTracks = await fetchAudioTrackData(this.page.page, [filePath]);
    const track = audioTracks[0];
    const data: TrackTestData = {
      name: track.title,
      url: filePath,
      duration: track.length,
    };
    await createTrack(this.page.page, data);
  }
}
