import { Router, Request, Response } from 'express';
import { pool } from '../db';
import { authMiddleware } from '../auth';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    let query = 'SELECT id, vehicle_number, weight_kg, vehicle_type, name, district, sub_district, village, state, created_at FROM vehicles ORDER BY vehicle_number';
    const params: string[] = [];
    if (user?.userId) {
      query = 'SELECT id, vehicle_number, weight_kg, vehicle_type, name, district, sub_district, village, state, created_at FROM vehicles WHERE created_by = $1 ORDER BY vehicle_number';
      params.push(user.userId);
    }
    const r = await pool.query(query, params.length ? params : undefined);
    res.json(
      r.rows.map((row) => ({
        id: row.id,
        vehicleNumber: row.vehicle_number,
        weight: parseFloat(row.weight_kg) || 0,
        type: row.vehicle_type,
        name: row.name ?? undefined,
        district: row.district ?? undefined,
        subDistrict: row.sub_district ?? undefined,
        village: row.village ?? undefined,
        state: row.state ?? undefined,
        created_at: row.created_at,
      }))
    );
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch vehicles' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { vehicleNumber, weight, type, name, district, subDistrict, village, state } = req.body;
    if (!vehicleNumber || weight == null || !type) {
      res.status(400).json({ error: 'vehicleNumber, weight and type required' });
      return;
    }
    const id = crypto.randomUUID();
    await pool.query(
      `INSERT INTO vehicles (id, vehicle_number, weight_kg, vehicle_type, name, district, sub_district, village, state, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [id, vehicleNumber, weight, type, name || null, district || null, subDistrict || null, village || null, state || null, user.userId]
    );
    const r = await pool.query('SELECT * FROM vehicles WHERE id = $1', [id]);
    const row = r.rows[0];
    res.status(201).json({
      id: row.id,
      vehicleNumber: row.vehicle_number,
      weight: parseFloat(row.weight_kg) || 0,
      type: row.vehicle_type,
      name: row.name ?? undefined,
      district: row.district ?? undefined,
      subDistrict: row.sub_district ?? undefined,
      village: row.village ?? undefined,
      state: row.state ?? undefined,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to create vehicle' });
  }
});

router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;
    const check = await pool.query('SELECT id, created_by FROM vehicles WHERE id = $1', [id]);
    const existing = check.rows[0];
    if (!existing) {
      res.status(404).json({ error: 'Vehicle not found' });
      return;
    }
    if (existing.created_by !== user.userId) {
      res.status(403).json({ error: 'Not allowed to update this vehicle' });
      return;
    }
    const { vehicleNumber, weight, type, name, district, subDistrict, village, state } = req.body;
    const updates: string[] = [];
    const values: any[] = [];
    let i = 1;
    if (vehicleNumber !== undefined) {
      updates.push(`vehicle_number = $${i++}`);
      values.push(vehicleNumber);
    }
    if (weight !== undefined) {
      updates.push(`weight_kg = $${i++}`);
      values.push(weight);
    }
    if (type !== undefined) {
      updates.push(`vehicle_type = $${i++}`);
      values.push(type);
    }
    if (name !== undefined) updates.push(`name = $${i++}`), values.push(name);
    if (district !== undefined) updates.push(`district = $${i++}`), values.push(district);
    if (subDistrict !== undefined) updates.push(`sub_district = $${i++}`), values.push(subDistrict);
    if (village !== undefined) updates.push(`village = $${i++}`), values.push(village);
    if (state !== undefined) updates.push(`state = $${i++}`), values.push(state);
    if (updates.length === 0) {
      const r = await pool.query('SELECT * FROM vehicles WHERE id = $1', [id]);
      const row = r.rows[0];
      return res.json({
        id: row.id,
        vehicleNumber: row.vehicle_number,
        weight: parseFloat(row.weight_kg) || 0,
        type: row.vehicle_type,
        name: row.name ?? undefined,
        district: row.district ?? undefined,
        subDistrict: row.sub_district ?? undefined,
        village: row.village ?? undefined,
        state: row.state ?? undefined,
      });
    }
    values.push(id);
    await pool.query(`UPDATE vehicles SET ${updates.join(', ')} WHERE id = $${i}`, values);
    const r = await pool.query('SELECT * FROM vehicles WHERE id = $1', [id]);
    const row = r.rows[0];
    res.json({
      id: row.id,
      vehicleNumber: row.vehicle_number,
      weight: parseFloat(row.weight_kg) || 0,
      type: row.vehicle_type,
      name: row.name ?? undefined,
      district: row.district ?? undefined,
      subDistrict: row.sub_district ?? undefined,
      village: row.village ?? undefined,
      state: row.state ?? undefined,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to update vehicle' });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;
    const check = await pool.query('SELECT id, created_by FROM vehicles WHERE id = $1', [id]);
    const existing = check.rows[0];
    if (!existing) {
      res.status(404).json({ error: 'Vehicle not found' });
      return;
    }
    if (existing.created_by !== user.userId) {
      res.status(403).json({ error: 'Not allowed to delete this vehicle' });
      return;
    }
    await pool.query('DELETE FROM vehicles WHERE id = $1', [id]);
    res.status(204).send();
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to delete vehicle' });
  }
});

export default router;
