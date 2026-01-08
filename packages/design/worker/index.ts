import { Hono } from 'hono';

// Import CSS as raw text (Wrangler handles this automatically)
import bkperCss from '../src/bkper.css';

const app = new Hono();

// Serve CSS at /design/v2/style.css
app.get('/design/v2/style.css', (c) => {
  return c.text(bkperCss, 200, {
    'Content-Type': 'text/css; charset=utf-8',
    'Cache-Control': 'public, max-age=3600',
    'Access-Control-Allow-Origin': '*',
  });
});

// Fallback for other /design/* paths
app.get('/design/*', (c) => {
  return c.notFound();
});

export default app;
