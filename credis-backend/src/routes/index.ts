import { Hono } from 'hono';
import customerRoutes from './customer.routes.js';
import storeRoutes from './store.routes.js';


const router = new Hono();

// Register all routes
router.route('/customers', customerRoutes);
router.route('/stores', storeRoutes)

export default router;