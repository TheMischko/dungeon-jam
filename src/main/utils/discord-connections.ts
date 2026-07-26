import { Client, Collection, IntentsBitField } from 'discord.js';
import { DiscordTokenManager } from '../managers/discord-token.manager';

export class DiscordConnections {
  readonly clients: Collection<string, Client> = new Collection();

  public async connectToken(token: string) {
    const client = new Client({
      intents: this.getIntents(),
    });
    const tokenText = await this.getTokenText(token);
    try {
      await client.login(token);
      this.clients.set(token, client);
      await this.waitForReady(client);

      console.log(`[DiscordConnections] Connected with token: ${tokenText}`);
      return client;
    } catch (e) {
      console.log(
        `[DiscordConnections] Failed to connect with token: ${tokenText}`,
        e
      );
      throw e;
    }
  }

  async disconnectToken(token: string) {
    const client = this.clients.get(token);
    if (client) {
      await client.destroy();
      this.clients.delete(token);
      const tokenText = await this.getTokenText(token);
      console.log(`[DiscordConnections] Disconnected token: ${tokenText}`);
    }
  }

  private waitForReady(client: Client): Promise<void> {
    return new Promise((resolve, reject) => {
      client.once('ready', () => resolve());
      setTimeout(
        () => reject(new Error('Discord client connection timed out')),
        15000
      );
    });
  }

  private getIntents() {
    const intents = new IntentsBitField();
    intents.add(
      IntentsBitField.Flags.Guilds,
      IntentsBitField.Flags.GuildVoiceStates
    );
    return intents;
  }

  private async getTokenText(token: string) {
    const discordTokenManager = await DiscordTokenManager.getInstance();
    return discordTokenManager.redactApiKey({
      apiKey: token,
    }).apiKey;
  }
}
