import { Router, Request, Response } from 'express';
import { pool } from '../db';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const { plantId } = req.query;
    let query = 'SELECT * FROM biochar_deployment ORDER BY created_at DESC';
    const params: any[] = [];
    if (plantId) {
      query = 'SELECT * FROM biochar_deployment WHERE plant_id = $1 ORDER BY created_at DESC';
      params.push(plantId);
    }
    const r = await pool.query(query, params);
    res.json(
      r.rows.map((row) => ({
        id: row.id,
        plantId: row.plant_id,
        farmerName: row.farmer_name,
        mobileNumber: row.mobile_number,
        aadhaarNumber: row.aadhaar_number,
        village: row.village,
        mandal: row.mandal,
        district: row.district,
        landArea: parseFloat(row.land_area) || 0,
        biocharWeight: parseFloat(row.biochar_weight) || 0,
        numberOfBags: row.number_of_bags,
        kmlData: row.kml_data,
        createdBy: row.created_by,
        createdAt: row.created_at,
      }))
    );
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch biochar deployments' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const body = req.body;
    const id = crypto.randomUUID();
    await pool.query(
      `INSERT INTO biochar_deployment (
        id, plant_id, farmer_name, mobile_number, aadhaar_number, village, mandal, district,
        land_area, biochar_weight, number_of_bags, kml_data, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
      [
        id,
        body.plantId,
        body.farmerName,
        body.mobileNumber,
        body.aadhaarNumber,
        body.village,
        body.mandal,
        body.district,
        body.landArea,
        body.biocharWeight,
        body.numberOfBags,
        body.kmlData ?? null,
        body.createdBy,
      ]
    );
    const r = await pool.query('SELECT * FROM biochar_deployment WHERE id = $1', [id]);
    const row = r.rows[0];
    res.status(201).json({
      id: row.id,
      plantId: row.plant_id,
      farmerName: row.farmer_name,
      mobileNumber: row.mobile_number,
      aadhaarNumber: row.aadhaar_number,
      village: row.village,
      mandal: row.mandal,
      district: row.district,
      landArea: parseFloat(row.land_area) || 0,
      biocharWeight: parseFloat(row.biochar_weight) || 0,
      numberOfBags: row.number_of_bags,
      kmlData: row.kml_data,
      createdBy: row.created_by,
      createdAt: row.created_at,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to create biochar deployment' });
  }
});

export default router;
