import { Hono } from 'hono';
const app = new Hono();
app.get('/', (c) => {
    return c.text('Hello from Hono!');
});
app.get('/api/users', async (c) => {
    return c.json([]);
});
export default app;
//# sourceMappingURL=index.js.map