import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import router from './routes/index.js';

const app = new Hono()

// Middleware
app.use('*', cors());
app.use('*', logger());

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

// API routes
app.route('/api', router);

serve(
  {
    fetch: app.fetch,
    port: 8080,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  }
);
