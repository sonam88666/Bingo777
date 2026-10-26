import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    {
      name: 'disable-vite-hmr-ws',
      transform(code, id) {
        if (id.includes('vite/dist/client/client.mjs')) {
          return {
            code: code
              .replace(
                'const socket = options.createConnection();',
                'return; const socket = options.createConnection();'
              )
              .replace(
                'ws.send(JSON.stringify(data));',
                'ws?.send(JSON.stringify(data));'
              ),
            map: null,
          };
        }
      },
    },
    react(),
    tailwindcss(),
  ],
  server: {
    port: 3000,
    host: '0.0.0.0',
    hmr: false,
  },
});

