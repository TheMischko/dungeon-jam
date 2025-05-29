const esbuild = require('esbuild');
const path = require('path');

esbuild
  .build({
    entryPoints: [path.join(__dirname, 'src/preload.ts')],
    bundle: true,
    platform: 'node',
    target: 'es2020',
    outfile: path.join(__dirname, 'build/src/preload.js'),
    external: ['electron'],
    alias: {
      '@shared': path.join(__dirname, 'shared'),
    },
    logLevel: 'info',
  })
  .catch(() => {
    process.exit(1);
  });
