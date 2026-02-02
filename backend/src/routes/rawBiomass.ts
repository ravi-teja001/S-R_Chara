import { Router, Request, Response } from 'express';
import { pool } from '../db';

const router = Router();

function rowToProcurement(row: any) {
  return {
    id: row.id,
    stockPointId: row.stock_point_id || '',
    source: row.source,
    vehicleNumber: row.vehicle_number,
    vehicleWeight: parseFloat(row.vehicle_weight) || 0,
    vehiclePhoto: row.vehicle_photo || '',
    grossWeight: parseFloat(row.gross_weight) || 0,
    weightRecordPhoto: row.weight_record_photo || '',
    netWeight: parseFloat(row.net_weight) || 0,
    procurementDate: row.procurement_date,
    createdBy: row.created_by,
    createdByEmail: row.created_by_email,
    procurementId: row.procurement_id,
    locationLatitude: row.location_latitude != null ? parseFloat(row.location_latitude) : undefined,
    locationLongitude: row.location_longitude != null ? parseFloat(row.location_longitude) : undefined,
    geojsonData: row.geojson_data,
    createdAt: row.created_at,
    name: row.name,
    state: row.state,
    district: row.district,
    village: row.village,
    vehicleType: row.vehicle_type,
    moisture: row.moisture != null ? parseFloat(row.moisture) : undefined,
  };
}

router.get('/', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    let query = 'SELECT * FROM raw_biomass_procurement ORDER BY procurement_date DESC';
    const params: any[] = [];
    if (user?.userId) {
      query = 'SELECT * FROM raw_biomass_procurement WHERE created_by = $1 OR created_by_email = $1 ORDER BY procurement_date DESC';
      params.push(user.userId);
    }
    const r = await pool.query(query, params.length ? params : undefined);
    res.json(r.rows.map(rowToProcurement));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch procurement records' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const body = req.body;
    const userId = user?.userId || body.createdBy;
    const createdByEmail = body.createdBy && body.createdBy.includes('@') ? body.createdBy : user?.email;

    const lastR = await pool.query(
      "SELECT procurement_id FROM raw_biomass_procurement WHERE procurement_id LIKE 'BMP-%' ORDER BY procurement_id DESC LIMIT 1"
    );
    let nextNum = 1;
    if (lastR.rows[0]?.procurement_id) {
      const parts = lastR.rows[0].procurement_id.split('-');
      const n = parseInt(parts[parts.length - 1], 10);
      if (!isNaN(n)) nextNum = n + 1;
    }
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const sourcePrefix = body.source === 'cotton_stalks' ? 'COT' : 'CHL';
    const procurementId = `BMP-${sourcePrefix}-${dateStr}-${String(nextNum).padStart(4, '0')}`;

    const id = crypto.randomUUID();
    const stockPointId = body.stockPointId || null;
    await pool.query(
      `INSERT INTO raw_biomass_procurement (
        id, procurement_id, stock_point_id, source, vehicle_number, vehicle_weight, vehicle_photo,
        gross_weight, weight_record_photo, net_weight, procurement_date, created_by, created_by_email,
        location_latitude, location_longitude, geojson_data, name, state, district, village, vehicle_type, moisture
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)`,
      [
        id,
        procurementId,
        stockPointId,
        body.source,
        body.vehicleNumber,
        body.vehicleWeight,
        body.vehiclePhoto ?? null,
        body.grossWeight,
        body.weightRecordPhoto ?? null,
        body.netWeight,
        typeof body.procurementDate === 'string' ? body.procurementDate.slice(0, 10) : new Date(body.procurementDate).toISOString().slice(0, 10),
        userId,
        createdByEmail ?? null,
        body.locationLatitude ?? null,
        body.locationLongitude ?? null,
        body.geojsonData ? JSON.stringify(body.geojsonData) : null,
        body.name ?? null,
        body.state ?? null,
        body.district ?? null,
        body.village ?? null,
        body.vehicleType ?? null,
        body.moisturePercentage ?? body.moisture ?? null,
      ]
    );
    const r = await pool.query('SELECT * FROM raw_biomass_procurement WHERE id = $1', [id]);
    const row = r.rows[0];
    res.status(201).json(rowToProcurement(row));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to create procurement record' });
  }
});

export default router;
