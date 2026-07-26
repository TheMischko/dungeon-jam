import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { vi } from 'vitest';
import { DiscordService } from './discord.service';
import { GuildWithChannels } from '@shared/models/discord.model';

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
      ...window.DISCORD_API,
      getChannels: vi.fn().mockResolvedValue(mockGuilds),
    };
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch channels from DISCORD_API', async () => {
    const guilds = await firstValueFrom(service.getChannels());

    expect(guilds).toEqual(mockGuilds);
    expect(window.DISCORD_API.getChannels).toHaveBeenCalled();
  });

  it('should handle errors from DISCORD_API', async () => {
    const mockError = new Error('API Error');
    window.DISCORD_API.getChannels = vi.fn().mockRejectedValue(mockError);

    await expect(firstValueFrom(service.getChannels())).rejects.toEqual(
      mockError
    );
  });
});
