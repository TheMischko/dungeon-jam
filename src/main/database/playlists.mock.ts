import { Playlist } from '@shared/models/playlist.model';

export const playlistsMock: Playlist[] = [
  {
    id: '123',
    name: 'Long winter nights',
    tags: ['friendly', 'winter', 'outdoor'],
    imageUrl:
      'https://cdn.pixabay.com/photo/2019/12/17/17/58/night-4702174_1280.jpg',
    trackIds: Array(26).fill('1'),
    dateCreated: new Date(),
    dateUpdated: new Date(),
    order: 0,
  },
  {
    id: '234',
    name: 'City market',
    tags: ['city', 'friendly'],
    imageUrl:
      'https://cdnb.artstation.com/p/marketplace/presentation_assets/003/750/807/large/file.jpg?1717246138',
    trackIds: Array(57).fill('1'),
    dateCreated: new Date(),
    dateUpdated: new Date(),
    order: 1,
  },
  {
    id: '345',
    name: "Dragon's den",
    tags: ['dragon', 'hostile', 'dungeon', 'danger', 'indoor'],
    imageUrl:
      'https://wallup.net/wp-content/uploads/2019/09/821054-dungeons-dragons-forgotten-realms-magic-rpg-action-adventure-puzzle-fantasy-warrior-dragon.jpg',
    trackIds: Array(57).fill('1'),
    dateCreated: new Date(),
    dateUpdated: new Date(),
    order: 2,
  },
  {
    id: '456',
    name: 'Mystery',
    tags: ['mystery', 'investigation', 'indoor'],
    imageUrl:
      'https://images-cdn.fantasyflightgames.com/filer_public/10/38/10380d4a-a8ee-4d47-b430-f4deb6e020ce/ahc_communitydecklists_preview.png',
    trackIds: Array(57).fill('1'),
    dateCreated: new Date(),
    dateUpdated: new Date(),
    order: 3,
  },
];
