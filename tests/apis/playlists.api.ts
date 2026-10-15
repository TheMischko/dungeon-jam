import {
  Playlist,
  PlaylistAddTracksData,
  PlaylistInsertQuery,
} from '@shared/models/playlist.model';
import { Page } from 'playwright';

export async function createPlaylist(
  page: Page,
  playlist: PlaylistInsertQuery
): Promise<Playlist> {
  return await page.evaluate(async (playlistData) => {
    return await (window as any).PLAYLIST_API.insertPlaylist(playlistData);
  }, playlist);
}

export async function addTracksToPlaylists(
  page: Page,
  data: PlaylistAddTracksData
): Promise<Map<string, Playlist>> {
  return await page.evaluate(async (addTracksData) => {
    return await (window as any).PLAYLIST_API.addTracksToPlaylists(
      addTracksData
    );
  }, data);
}

