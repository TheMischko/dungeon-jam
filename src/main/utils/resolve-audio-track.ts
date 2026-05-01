import { AudioTrack, Track } from '@shared/models/track.model';
import path from 'path';

export function resolveAudioTrack(audioTrack: AudioTrack): Omit<Track, 'id'> {
  const fileName = path.basename(
    audioTrack.fullPath,
    path.extname(audioTrack.fullPath)
  );

  const track: Omit<Track, 'id'> = {
    name: audioTrack.title,
    author: audioTrack.author,
    url: audioTrack.fullPath,
    duration: audioTrack.length,
    tags: audioTrack.tags,
  };

  // If no author
  if (!track.author?.trim()?.length) {
    track.author = getAuthorFromFileName(fileName);
  }

  //if no title
  if (!track.name?.trim()?.length) {
    track.name = getTitleFromFileName(fileName);
  }

  return track;
}

function getAuthorFromFileName(fileName: string): string | undefined {
  const dashParts = fileName.split(new RegExp(/-|\|/));
  if (dashParts.length == 2) {
    return splitAndConnect(dashParts[1]);
  }
  return undefined;
}

const separatorRegExp = new RegExp(/\-|\.|\(|\)|\[|\]|\s/);

export function getTitleFromFileName(fileName: string): string {
  let title = fileName;
  const author = getAuthorFromFileName(fileName);
  console.log('Author: ', author);
  if (author !== undefined) {
    const authorPos = fileName.indexOf(author);
    title = fileName.slice(0, authorPos).trim();
    console.log('Title without author: ', title);
  }
  title = title.replace(/^\d+[\.\s]*/, ' ');
  console.log('Title with replaced chars:', title);
  return splitAndConnect(title);
}

function splitAndConnect(text: string): string {
  const finalParts = text.split(separatorRegExp);
  const parsed = finalParts
    .slice(0, finalParts.length > 1 ? -1 : 0)
    .filter((part) => part.trim().length > 0)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
    .trim();
  console.log('Parsed text:', parsed);
  return parsed;
}
