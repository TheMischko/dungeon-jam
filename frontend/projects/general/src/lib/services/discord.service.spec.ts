import { TestBed } from '@angular/core/testing';
import { DiscordService } from './discord.service';
import { GuildWithChannels } from '@shared/models/discord.model';

// Mock window.DISCORD_API for testing
declare global {
  interface Window {
    DISCORD_API: {
      getChannels: () => Promise<GuildWithChannels[]>;
    };
  }
}

describe('DiscordService', () => {
  let service: DiscordService;
  let mockGuilds: GuildWithChannels[];

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DiscordService);

    mockGuilds = [
      {
        guildId: '123456789',
        guildName: 'Test Guild',
        guildIconURL: 'https://example.com/icon.png',
        channels: [
          { id: '111', name: 'general' },
          { id: '222', name: 'music' },
        ],
      },
    ];

    // Mock the window.DISCORD_API
    window.DISCORD_API = {
      getChannels: jasmine
        .createSpy('getChannels')
        .and.returnValue(Promise.resolve(mockGuilds)),
    };
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch channels from DISCORD_API', (done) => {
    service.getChannels().subscribe((guilds) => {
      expect(guilds).toEqual(mockGuilds);
      expect(window.DISCORD_API.getChannels).toHaveBeenCalled();
      done();
    });
  });

  it('should handle errors from DISCORD_API', (done) => {
    const mockError = new Error('API Error');
    window.DISCORD_API.getChannels = jasmine
      .createSpy('getChannels')
      .and.returnValue(Promise.reject(mockError));

    service.getChannels().subscribe(
      () => {
        fail('should have errored');
      },
      (error) => {
        expect(error).toEqual(mockError);
        done();
      },
    );
  });
});
