import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { customersRouter } from './routes/customers.js';
const app = new Hono();
// Enable CORS for frontend
app.use('/api/*', cors({
    origin: '*', // In production, replace with your frontend URL
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowHeaders: ['Content-Type'],
}));
app.get('/', (c) => {
    return c.text('Credis System API v1.0');
});
// API Routes
app.route('/api/customers', customersRouter);
serve({
    fetch: app.fetch,
    port: 8080
}, (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
});
