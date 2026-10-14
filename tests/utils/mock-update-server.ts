import http from 'node:http';

export interface MockReleaseConfig {
  version: string;
  notes?: string;
}

export class MockUpdateServer {
  private static instance: MockUpdateServer;
  private server: http.Server | null = null;
  private port: number = 0;
  private availableRelease: MockReleaseConfig | null = null;
  public checkRequestsCount: number = 0;

  public static getInstance(): MockUpdateServer {
    if (!MockUpdateServer.instance) {
      MockUpdateServer.instance = new MockUpdateServer();
    }
    return MockUpdateServer.instance;
  }

  async start(): Promise<string> {
    if (this.server && this.port > 0) {
      return this.getUrl();
    }

    return new Promise((resolve) => {
      this.server = http.createServer((req, res) => {
        const url = req.url || '';
        if (url.includes('latest.yml') || url.includes('latest')) {
          this.checkRequestsCount++;
          if (!this.availableRelease) {
            // No update available: emit 0.0.0 so semver compares and emits update-not-available
            const yaml = [
              'version: 0.0.0',
              'files:',
              '  - url: DungeonJam-Setup-0.0.0.exe',
              '    sha512: dGVzdA==',
              'path: DungeonJam-Setup-0.0.0.exe',
              'sha512: dGVzdA==',
              `releaseDate: ${new Date().toISOString()}`,
            ].join('\n');
            res.writeHead(200, { 'Content-Type': 'text/yaml' });
            res.end(yaml);
            return;
          }

          const notes =
            this.availableRelease.notes ||
            `<p>Release ${this.availableRelease.version}</p>`;
          const yaml = [
            `version: ${this.availableRelease.version}`,
            'files:',
            `  - url: DungeonJam-Setup-${this.availableRelease.version}.exe`,
            '    sha512: dGVzdA==',
            `path: DungeonJam-Setup-${this.availableRelease.version}.exe`,
            'sha512: dGVzdA==',
            `releaseDate: ${new Date().toISOString()}`,
            `releaseNotes: "${notes.replace(/"/g, '\\"')}"`,
          ].join('\n');

          res.writeHead(200, { 'Content-Type': 'text/yaml' });
          res.end(yaml);
          return;
        }

        res.writeHead(404);
        res.end();
      });

      this.server.listen(0, '127.0.0.1', () => {
        const addr = this.server!.address();
        this.port = typeof addr === 'string' ? 0 : addr?.port || 0;
        this.server!.unref();
        resolve(this.getUrl());
      });
    });
  }

  setAvailableRelease(release: MockReleaseConfig | null): void {
    this.availableRelease = release;
  }

  resetRequestsCount(): void {
    this.checkRequestsCount = 0;
  }

  getUrl(): string {
    return `http://127.0.0.1:${this.port}/`;
  }

  async stop(): Promise<void> {
    return new Promise((resolve) => {
      if (this.server) {
        this.server.close(() => {
          this.server = null;
          this.port = 0;
          resolve();
        });
      } else {
        resolve();
      }
    });
  }
}
