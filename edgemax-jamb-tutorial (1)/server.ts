import fs from 'node:fs';
import path from 'node:path';
import express from 'express';
import { createApiApp } from './server/app';
import { getEdgeMaxStore } from './server/storeFactory';

const PORT = Number(process.env.PORT || 3000);

async function startServer() {
  const app = createApiApp({
    getStore: getEdgeMaxStore,
  });

  const useViteDev =
    process.env.EDGEMAX_DEV === 'true' ||
    !fs.existsSync(path.join(process.cwd(), 'dist', 'index.html'));

  if (useViteDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.join(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`EdgeMax JAMB 2027 server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start EdgeMax server:', err);
  process.exit(1);
});
