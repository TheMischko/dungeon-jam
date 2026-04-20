import { Client, Collection, IntentsBitField } from 'discord.js';

export class DiscordConnections {
  readonly clients: Collection<string, Client> = new Collection();

  public async connectToken(token: string) {
    const client = new Client({
      intents: this.getIntents(),
    });
    try {
      await client.login(token);
      this.clients.set(token, client);
      await this.waitForReady(client);
      console.log(
        `[DiscordConnections] Connected with token: ${this.tokenText(token)}`
      );
      return client;
    } catch (e) {
      console.log(
        `[DiscordConnections] Failed to connect with token: ${this.tokenText(token)}`,
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
      console.log(
        `[DiscordConnections] Disconnected token: ${this.tokenText(token)}`
      );
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

  private tokenText(token: string) {
    return `${token.slice(0, 6)}...`;
  }
}
