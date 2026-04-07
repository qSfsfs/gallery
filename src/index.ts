import { Hono } from 'hono';
import { sql } from 'drizzle-orm';
import { db, pool, checkDbConnection } from './db.js';
import { posts } from './schema.js';

const app = new Hono();

app.get('/health', async (c) => {
  const row = await db.execute(sql`SELECT 1`);
  return c.json({ ok: true, row });
});

app.post('/api/posts', async (c) => {
  const { content, userId } = await c.req.json();

  await db.insert(posts).values({
    userId,
    content,
  });

  return c.json({ message: 'Post created' }, 201);
});

app.get('/api/users', async (c) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, username, login, email, role, created_at FROM users ORDER BY id DESC LIMIT 100'
    );
    return c.json(rows);
  } catch (error) {
    console.error('Failed to load users:', error);
    return c.json({ error: 'Database query failed' }, 500);
  }
});

app.get('/api/health/db', async (c) => {
  try {
    await checkDbConnection();
    return c.json({ ok: true, database: 'connected' });
  } catch (error) {
    console.error('Database healthcheck failed:', error);
    return c.json({ ok: false, database: 'disconnected' }, 500);
  }
});

export default app;
