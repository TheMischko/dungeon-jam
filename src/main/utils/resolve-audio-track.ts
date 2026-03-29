import { AudioTrack, Track } from '@shared/models/track.model';
import path from 'path';

export function resolveAudioTrack(audioTrack: AudioTrack): Omit<Track, 'id'> {
  const fileName = path.basename(audioTrack.fullPath, path.extname(audioTrack.fullPath));

  const track: Omit<Track, 'id'> = {
    name: audioTrack.title,
    author: audioTrack.author,
    url: audioTrack.fullPath,
    duration: audioTrack.length,
    tags: audioTrack.tags
  }

  // If no author
  if(!track.author?.trim()?.length){
    track.author = getAuthorFromFileName(fileName);
  }

  //if no title
  if(!track.name?.trim()?.length){
    track.name = getTitleFromFileName(fileName);
  }

  return track;
}

function getAuthorFromFileName(fileName: string): string | undefined {
  const dashParts = fileName.split('-');
  if (dashParts.length == 2) {
    return splitAndConnect(dashParts[1]);
  }
  return undefined;
}

function getTitleFromFileName(fileName: string): string {
  let title = fileName;
  if(getAuthorFromFileName(fileName) !== undefined){
    title = fileName.split('-')[0].trim();
  }
  title = title.replace(/^\d+[\.\s]*/, '');
  return splitAndConnect(title);
}

function splitAndConnect(text: string): string{
  const finalParts = text.split(/[_\-\s\.]+/);
  return finalParts.map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ').trim();
}