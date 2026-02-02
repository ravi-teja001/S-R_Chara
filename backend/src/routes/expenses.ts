import { Router, Request, Response } from 'express';
import { pool } from '../db';

const router = Router();

const expenseTypeMap: Record<string, string> = {
  fuel: 'Fuel Expenses',
  cash_advance: 'Cash Advance',
  other: 'Other Expenses',
};
const paymentModeMap: Record<string, string> = { cash: 'Cash', upi: 'UPI' };
const typeMap: Record<string, string> = {
  'Fuel Expenses': 'fuel',
  'Cash Advance': 'cash_advance',
  'Other Expenses': 'other',
};
const paymentMap: Record<string, string> = { Cash: 'cash', UPI: 'upi' };

router.get('/', async (req: Request, res: Response) => {
  try {
    const { stockPointId, inchargeId, expenseType, fromDate, toDate } = req.query;
    let query = 'SELECT * FROM expenses ORDER BY expense_date DESC';
    const params: any[] = [];
    const conditions: string[] = [];
    let i = 1;
    if (stockPointId) {
      conditions.push(`stock_point_id = $${i++}`);
      params.push(stockPointId);
    }
    if (inchargeId) {
      conditions.push(`incharge_id = $${i++}`);
      params.push(inchargeId);
    }
    if (expenseType) {
      conditions.push(`expense_type = $${i++}`);
      params.push(expenseTypeMap[expenseType as string] || expenseType);
    }
    if (fromDate) {
      conditions.push(`expense_date >= $${i++}`);
      params.push(String(fromDate).slice(0, 10));
    }
    if (toDate) {
      conditions.push(`expense_date <= $${i++}`);
      params.push(String(toDate).slice(0, 10));
    }
    if (conditions.length) query = 'SELECT * FROM expenses WHERE ' + conditions.join(' AND ') + ' ORDER BY expense_date DESC';
    const r = await pool.query(query, params);
    res.json(
      r.rows.map((row) => ({
        id: row.id,
        stockPointId: row.stock_point_id,
        date: row.expense_date,
        amount: parseFloat(row.expense_amount),
        type: typeMap[row.expense_type] || row.expense_type,
        paymentMode: paymentMap[row.payment_mode] || row.payment_mode,
        receiptUrl: row.receipt_url || '',
        createdBy: row.incharge_id,
        createdAt: row.created_at,
      }))
    );
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const body = req.body;
    const id = crypto.randomUUID();
    await pool.query(
      `INSERT INTO expenses (id, stock_point_id, expense_date, expense_amount, expense_type, payment_mode, receipt_url, incharge_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        id,
        body.stockPointId,
        typeof body.date === 'string' ? body.date.slice(0, 10) : new Date(body.date).toISOString().slice(0, 10),
        body.amount,
        expenseTypeMap[body.type] || body.type,
        paymentModeMap[body.paymentMode] || body.paymentMode,
        body.receiptUrl ?? null,
        body.createdBy || user?.userId,
      ]
    );
    const r = await pool.query('SELECT * FROM expenses WHERE id = $1', [id]);
    const row = r.rows[0];
    res.status(201).json({
      id: row.id,
      stockPointId: row.stock_point_id,
      date: row.expense_date,
      amount: parseFloat(row.expense_amount),
      type: typeMap[row.expense_type] || row.expense_type,
      paymentMode: paymentMap[row.payment_mode] || row.payment_mode,
      receiptUrl: row.receipt_url || '',
      createdBy: row.incharge_id,
      createdAt: row.created_at,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to create expense' });
  }
});

export default router;
