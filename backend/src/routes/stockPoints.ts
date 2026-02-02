import { Router, Request, Response } from 'express';
import { pool } from '../db';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const r = await pool.query('SELECT id, name, location FROM stock_points ORDER BY name');
    res.json(r.rows.map((row) => ({ id: row.id, name: row.name, location: row.location })));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch stock points' });
  }
});

export default router;
