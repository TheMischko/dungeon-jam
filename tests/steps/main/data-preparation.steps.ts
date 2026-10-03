import { BaseSteps } from '../base.steps';
import { binding, given } from 'cucumber-tsflow';
import { TestContext } from '../../context/context';
import path from 'node:path';
import { fetchAudioTrackData } from '../../apis/audio-files.api';
import { createTrack, TrackTestData } from '../../apis/tracks.api';
import { BaseMainPage } from '../../pages/_base/base-main.page';
import { PlaylistInsertQuery } from '@shared/models/playlist.model';
import { createPlaylist, addTracksToPlaylists } from '../../apis/playlists.api';
import { createSoundEffect } from '../../apis/sound-effects.api';
import { SoundEffectCreateData } from '@shared/models/sound-effect.model';

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

  @given(
    'there is a playlist prepared called {string} containing track from fixture {string}'
  )
  async preparePlaylistWithTrack(
    playlistName: string,
    fixtureName: string
  ): Promise<void> {
    const playlistData: PlaylistInsertQuery = {
      name: playlistName,
      tags: [],
    };
    const playlist = await createPlaylist(this.page.page, playlistData);

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
    const createdTrack = await createTrack(this.page.page, data);

    await addTracksToPlaylists(this.page.page, {
      [playlist.id]: [createdTrack.id],
    });
  }

  @given(
    'there is a playlist prepared called {string} containing track fixtures {string}'
  )
  async preparePlaylistWithMultipleTracks(
    playlistName: string,
    commaSeparatedFixtures: string
  ): Promise<void> {
    const playlistData: PlaylistInsertQuery = {
      name: playlistName,
      tags: [],
    };
    const playlist = await createPlaylist(this.page.page, playlistData);

    const fixtureNames = commaSeparatedFixtures
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const createdTrackIds: string[] = [];

    for (const fixtureName of fixtureNames) {
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
      const createdTrack = await createTrack(this.page.page, data);
      createdTrackIds.push(createdTrack.id);
    }

    await addTracksToPlaylists(this.page.page, {
      [playlist.id]: createdTrackIds,
    });
  }

  @given('there are tracks prepared from fixtures {string}')
  async prepareMultipleTracks(commaSeparatedFixtures: string): Promise<void> {
    const fixtureNames = commaSeparatedFixtures
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    for (const fixtureName of fixtureNames) {
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

  @given(
    'there is a sound effect prepared called {string} from fixture {string}'
  )
  async prepareSoundEffect(
    effectName: string,
    fixtureName: string
  ): Promise<void> {
    const filePath = path.join(
      __dirname,
      `../../fixtures/sounds/${fixtureName}.mp3`
    );
    const audioTracks = await fetchAudioTrackData(this.page.page, [filePath]);
    const track = audioTracks[0];
    const data: SoundEffectCreateData = {
      name: effectName,
      url: filePath,
      duration: track.length,
      tags: [],
    };
    await createSoundEffect(this.page.page, data);
  }
}


