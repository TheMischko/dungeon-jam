import { build } from 'esbuild';
import { nodeExternalsPlugin } from 'esbuild-node-externals';

const sharedConfig = {
  bundle: true,
  platform: 'node',
  sourcemap: true,
  target: 'node20',
  plugins: [nodeExternalsPlugin()],
  external: ['electron', 'prism-media', 'opusscript', 'lowdb'],
  loader: {
    '.ts': 'ts',
  },
  alias: {
    '@shared': './shared',
  },
  logLevel: 'info',
  format: 'cjs',
};

// Main Electron app
build({
  ...sharedConfig,
  entryPoints: ['./src/index.ts'],
  outfile: './build/src/index.js',
}).catch(() => process.exit(1));

// Preload
build({
  ...sharedConfig,
  entryPoints: ['./src/preload.ts'],
  outfile: './build/src/preload.js',
}).catch(() => process.exit(1));

// Sound capture preload
build({
  ...sharedConfig,
  entryPoints: ['./src/sound-capture/preload.ts'],
  outfile: './build/src/sound-capture/preload.js',
}).catch(() => process.exit(1));
