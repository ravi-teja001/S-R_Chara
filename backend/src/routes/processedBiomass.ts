import { Router, Request, Response } from 'express';
import { pool } from '../db';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const { plantId } = req.query;
    let query = 'SELECT * FROM processed_biomass_procurement ORDER BY procurement_date DESC';
    const params: any[] = [];
    if (plantId) {
      query = 'SELECT * FROM processed_biomass_procurement WHERE plant_id = $1 ORDER BY procurement_date DESC';
      params.push(plantId);
    }
    const r = await pool.query(query, params);
    res.json(
      r.rows.map((row) => ({
        id: row.id,
        plantId: row.plant_id,
        sourceStockPointId: row.source_stock_point_id,
        vehicleNumber: row.vehicle_number,
        vehicleWeight: parseFloat(row.vehicle_weight) || 0,
        vehiclePhoto: row.vehicle_photo || '',
        vehiclePhotoLatitude: row.vehicle_photo_latitude,
        vehiclePhotoLongitude: row.vehicle_photo_longitude,
        grossWeight: parseFloat(row.gross_weight) || 0,
        weightRecordPhoto: row.weight_record_photo || '',
        weightPhotoLatitude: row.weight_photo_latitude,
        weightPhotoLongitude: row.weight_photo_longitude,
        netWeight: parseFloat(row.net_weight) || 0,
        procurementDate: row.procurement_date,
        createdBy: row.created_by,
      }))
    );
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch processed biomass procurement' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const body = req.body;
    const id = crypto.randomUUID();
    await pool.query(
      `INSERT INTO processed_biomass_procurement (
        id, plant_id, source_stock_point_id, vehicle_number, vehicle_weight, vehicle_photo,
        vehicle_photo_latitude, vehicle_photo_longitude, gross_weight, weight_record_photo,
        weight_photo_latitude, weight_photo_longitude, net_weight, procurement_date, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
      [
        id,
        body.plantId,
        body.sourceStockPointId,
        body.vehicleNumber,
        body.vehicleWeight,
        body.vehiclePhoto ?? null,
        body.vehiclePhotoLatitude ?? null,
        body.vehiclePhotoLongitude ?? null,
        body.grossWeight,
        body.weightRecordPhoto ?? null,
        body.weightPhotoLatitude ?? null,
        body.weightPhotoLongitude ?? null,
        body.netWeight,
        typeof body.procurementDate === 'string' ? body.procurementDate.slice(0, 10) : new Date(body.procurementDate).toISOString().slice(0, 10),
        body.createdBy,
      ]
    );
    const r = await pool.query('SELECT * FROM processed_biomass_procurement WHERE id = $1', [id]);
    const row = r.rows[0];
    res.status(201).json({
      id: row.id,
      plantId: row.plant_id,
      sourceStockPointId: row.source_stock_point_id,
      vehicleNumber: row.vehicle_number,
      vehicleWeight: parseFloat(row.vehicle_weight) || 0,
      vehiclePhoto: row.vehicle_photo || '',
      vehiclePhotoLatitude: row.vehicle_photo_latitude,
      vehiclePhotoLongitude: row.vehicle_photo_longitude,
      grossWeight: parseFloat(row.gross_weight) || 0,
      weightRecordPhoto: row.weight_record_photo || '',
      weightPhotoLatitude: row.weight_photo_latitude,
      weightPhotoLongitude: row.weight_photo_longitude,
      netWeight: parseFloat(row.net_weight) || 0,
      procurementDate: row.procurement_date,
      createdBy: row.created_by,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to create processed biomass procurement' });
  }
});

export default router;
