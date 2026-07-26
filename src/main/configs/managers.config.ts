import { StoredPlaybackManager } from '../managers/stored-playback.manager';
import { ViewManager } from '../managers/view.manager';
import { TagsManager } from '../managers/tags.manager';
import { FilesManager } from '../managers/files.manager';
import { TrackManager } from '../managers/track.manager';
import { PlaylistManager } from '../managers/playlist.manager';
import { RedirectManager } from '../managers/redirect.manager';
import { DiscordManager } from '../managers/discord.manager';
import { PlaybackDestinationManager } from '../managers/playback-destination.manager';
import { getDefaultViewConfig } from './view.config';
import { DiscordTokenManager } from '../managers/discord-token.manager';
import { SoundEffectManager } from '../managers/sound-effect.manager';
import { ImageManager } from '../managers/image.manager';
import { AppInfoManager } from '../managers/app-info.manager';
import { DisplayOrderManager } from '../managers/display-order.manager';
import { SceneManager } from '../managers/scene.manager';
import { SessionManager } from '../managers/session.manager';

/**
 * Manager initialization configuration
 * Defines the order and dependencies for initializing all application managers
 */
export function getManagersInitConfig(
  buildPath: string
): { name: string; initFunction: (env: string) => Promise<void> }[] {
  const viewConfig = getDefaultViewConfig(buildPath);
  return [
    {
      name: 'StoredPlayback',
      initFunction: async () => {
        await StoredPlaybackManager.getInstance();
      },
    },
    {
      name: 'View',
      initFunction: async (env) => {
        await ViewManager.getInstance({
          ...viewConfig,
          env,
        });
      },
    },
    {
      name: 'AppInfo',
      initFunction: async () => {
        await AppInfoManager.getInstance();
      },
    },
    {
      name: 'Tags',
      initFunction: async () => {
        await TagsManager.getInstance();
      },
    },
    {
      name: 'Files',
      initFunction: async () => {
        await FilesManager.getInstance();
      },
    },
    {
      name: 'ImageManager',
      initFunction: async () => {
        await ImageManager.getInstance();
      },
    },
    {
      name: 'DisplayOrder',
      initFunction: async () => {
        await DisplayOrderManager.getInstance();
      },
    },
    {
      name: 'Track',
      initFunction: async () => {
        await TrackManager.getInstance();
      },
    },
    {
      name: 'SoundEffect',
      initFunction: async () => {
        await SoundEffectManager.getInstance();
      },
    },
    {
      name: 'Playlist',
      initFunction: async () => {
        await PlaylistManager.getInstance();
      },
    },
    {
      name: 'Redirect',
      initFunction: async () => {
        await RedirectManager.getInstance();
      },
    },
    {
      name: 'DiscordToken',
      initFunction: async () => {
        await DiscordTokenManager.getInstance();
      },
    },
    {
      name: 'Discord',
      initFunction: async () => {
        await DiscordManager.getInstance();
      },
    },
    {
      name: 'PlaybackDestination',
      initFunction: async () => {
        await PlaybackDestinationManager.getInstance();
      },
    },
    {
      name: 'Files',
      initFunction: async () => {
        await FilesManager.getInstance();
      },
    },
    {
      name: 'Scenes',
      initFunction: async () => {
        await SceneManager.getInstance();
      },
    },
    {
      name: 'Sessions',
      initFunction: async () => {
        await SessionManager.getInstance();
      },
    },
  ];
}
