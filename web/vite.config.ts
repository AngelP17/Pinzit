import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

function enforceMainChunkLimit(maxKb = 220): Plugin {
  return {
    name: 'enforce-main-chunk-limit',
    apply: 'build',
    generateBundle(_, bundle) {
      for (const chunk of Object.values(bundle)) {
        if (chunk.type !== 'chunk') continue;
        const isMainChunk =
          chunk.fileName.startsWith('assets/index-') && chunk.fileName.endsWith('.js');
        if (!isMainChunk) continue;
        const sizeKb = Buffer.byteLength(chunk.code, 'utf8') / 1024;
        if (sizeKb > maxKb) {
          throw new Error(
            `Main chunk ${chunk.fileName} is ${sizeKb.toFixed(2)} KB (limit: ${maxKb} KB).`
          );
        }
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), enforceMainChunkLimit(220)],
  base: './',
});
