import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { pool } from '../db';
import { signToken } from '../auth';

const router = Router();

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password required' });
      return;
    }

    const r = await pool.query(
      'SELECT id, email, name, role, stock_point_id, plant_id, password_hash FROM app_users WHERE email = $1',
      [email.toLowerCase()]
    );
    const user = r.rows[0];
    if (!user || !user.password_hash) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const token = signToken({ userId: user.id, email: user.email });
    res.json({
      session: { access_token: token },
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        stockPointId: user.stock_point_id,
        plantId: user.plant_id,
      },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Login failed' });
  }
});

router.post('/signup', async (req: Request, res: Response) => {
  try {
    const { email, password, name, role, stockPointId, plantId } = req.body;
    if (!email || !password || !name || !role) {
      res.status(400).json({ error: 'Email, password, name and role required' });
      return;
    }

    const id = crypto.randomUUID();
    const password_hash = await bcrypt.hash(password, 10);

    await pool.query(
      `INSERT INTO app_users (id, email, name, role, stock_point_id, plant_id, password_hash)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [id, email.toLowerCase(), name, role, stockPointId || null, plantId || null, password_hash]
    );

    const token = signToken({ userId: id, email: email.toLowerCase() });
    res.status(201).json({
      session: { access_token: token },
      user: {
        id,
        email: email.toLowerCase(),
        name,
        role,
        stockPointId: stockPointId || undefined,
        plantId: plantId || undefined,
      },
    });
  } catch (e: any) {
    if (e.code === '23505') {
      res.status(400).json({ error: 'Email already registered' });
      return;
    }
    console.error('Signup error:', e);
    const message = e?.message || 'Signup failed';
    const hint = message.includes('does not exist') || message.includes('relation')
      ? ' Database schema may not be applied. In Railway, ensure DATABASE_URL is set and the API service has run (schema runs on first startup).'
      : '';
    res.status(500).json({
      error: process.env.NODE_ENV === 'production' ? 'Signup failed' : message,
      ...(hint && { hint }),
    });
  }
});

router.post('/logout', (_req: Request, res: Response) => {
  res.json({ ok: true });
});

export default router;
