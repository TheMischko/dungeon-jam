import ffmpegPath from 'ffmpeg-static';

const ffmetadata = require('ffmetadata');

ffmetadata.setFfmpegPath(ffmpegPath);

export const TrackMetaData = {
  write: (filePath: string, data: WriteTrackMetaDataOptions): Promise<void> => {
    const tagsString = data.tags?.join('\,') ?? '';
    const newMetadata: TrackFileMetadata = {
      ...(data.title ? { title: data.title } : {}),
      ...(data.author
        ? {
            artist: data.author,
            album_artist: data.author,
            composer: data.author,
          }
        : {}),
      ...(data.tags
        ? { comment: tagsString, genre: tagsString }
        : {}),
    };

    return new Promise((resolve, reject) => {
      ffmetadata.write(
        filePath,
        newMetadata,
        (err: Error, _: TrackFileMetadata) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        },
      );
    });
  },
};

interface TrackFileMetadata {
  artist?: string;
  title?: string;
  album_artist?: string;
  composer?: string;
  comment?: string;
  description?: string;
  COMM?: string;
}

export interface WriteTrackMetaDataOptions {
  title?: string;
  author?: string;
  tags?: string[];
}
