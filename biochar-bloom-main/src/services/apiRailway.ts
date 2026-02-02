/**
 * Railway API client – same interface as api.ts but calls the Railway backend.
 * Used when VITE_API_URL is set.
 */

import { environment } from '@/lib/environment';
import { getToken, getUser } from '@/lib/authStorage';
import type {
  StockPoint,
  Plant,
  Vehicle,
  RawBiomassProcurement,
  Expense,
  ProcessedBiomassProcurement,
  BiocharDeployment,
} from '@/types/biochar';

export interface DashboardStats {
  totalTripsToday: number;
  netWeightToday: number;
  netWeightThisWeek: number;
  pendingUploads: number;
  totalExpenses: number;
  fuelExpenses: number;
  pendingPayments: number;
  clearedPayments: number;
  processedBiomass: number;
  biocharProduced: number;
  farmersDeployed: number;
  landCovered: number;
}

const base = () => environment.apiUrl;
const token = () => getToken();

async function fetchApi<T>(
  path: string,
  options: RequestInit & { method?: string; body?: object } = {}
): Promise<T> {
  const url = `${base()}${path}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  const t = token();
  if (t) headers['Authorization'] = `Bearer ${t}`;
  const res = await fetch(url, {
    ...options,
    headers,
    body: options.body != null ? JSON.stringify(options.body) : options.body,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || res.statusText);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

// Stock Points
export async function getStockPoints(): Promise<StockPoint[]> {
  return fetchApi<StockPoint[]>('/api/stock-points');
}

// Plants
export async function getPlants(): Promise<Plant[]> {
  return fetchApi<Plant[]>('/api/plants');
}

// Vehicles
export async function getVehicles(userId?: string): Promise<(Vehicle & { created_at?: string })[]> {
  const list = await fetchApi<any[]>('/api/vehicles');
  return list.map((row) => ({
    id: row.id,
    vehicleNumber: row.vehicleNumber,
    weight: row.weight ?? 0,
    type: row.type,
    name: row.name,
    district: row.district,
    subDistrict: row.subDistrict,
    village: row.village,
    state: row.state,
    created_at: row.created_at,
  }));
}

export async function createVehicle(
  vehicle: Omit<Vehicle, 'id'>,
  userId: string
): Promise<Vehicle> {
  return fetchApi<Vehicle>('/api/vehicles', {
    method: 'POST',
    body: {
      vehicleNumber: vehicle.vehicleNumber,
      weight: vehicle.weight,
      type: vehicle.type,
      name: vehicle.name,
      district: vehicle.district,
      subDistrict: vehicle.subDistrict,
      village: vehicle.village,
      state: vehicle.state,
    },
  });
}

export async function updateVehicle(
  vehicleId: string,
  vehicle: Partial<Omit<Vehicle, 'id'>>,
  userId: string
): Promise<Vehicle> {
  return fetchApi<Vehicle>(`/api/vehicles/${vehicleId}`, {
    method: 'PATCH',
    body: {
      vehicleNumber: vehicle.vehicleNumber,
      weight: vehicle.weight,
      type: vehicle.type,
      name: vehicle.name,
      district: vehicle.district,
      subDistrict: vehicle.subDistrict,
      village: vehicle.village,
      state: vehicle.state,
    },
  });
}

export async function deleteVehicle(vehicleId: string, userId: string): Promise<void> {
  await fetchApi(`/api/vehicles/${vehicleId}`, { method: 'DELETE' });
}

// Raw Biomass
export function updateOldLocalRecordsEmail(): void {
  // No-op for Railway; user filtering is by backend
}

export async function syncLocalRecordsToDatabase(): Promise<void> {
  // No-op for Railway
}

export async function createRawBiomassProcurement(
  procurement: Omit<RawBiomassProcurement, 'id' | 'createdAt'> & {
    moisturePhoto?: string | null;
    moisturePercentage?: string | number | null;
  }
): Promise<RawBiomassProcurement> {
  const body = {
    stockPointId: procurement.stockPointId,
    source: procurement.source,
    vehicleNumber: procurement.vehicleNumber,
    vehicleWeight: procurement.vehicleWeight,
    vehiclePhoto: procurement.vehiclePhoto,
    grossWeight: procurement.grossWeight,
    weightRecordPhoto: procurement.weightRecordPhoto,
    netWeight: procurement.netWeight,
    procurementDate: procurement.procurementDate,
    createdBy: procurement.createdBy,
    locationLatitude: procurement.locationLatitude,
    locationLongitude: procurement.locationLongitude,
    geojsonData: procurement.geojsonData,
    name: procurement.name,
    state: procurement.state,
    district: procurement.district,
    village: procurement.village,
    vehicleType: procurement.vehicleType,
    moisturePercentage: procurement.moisturePercentage ?? procurement.moisture,
  };
  const row = await fetchApi<any>('/api/raw-biomass-procurement', { method: 'POST', body });
  return {
    id: row.id,
    procurementId: row.procurementId,
    stockPointId: row.stockPointId ?? '',
    source: row.source,
    vehicleNumber: row.vehicleNumber,
    vehicleWeight: row.vehicleWeight ?? 0,
    vehiclePhoto: row.vehiclePhoto ?? '',
    grossWeight: row.grossWeight ?? 0,
    weightRecordPhoto: row.weightRecordPhoto ?? '',
    netWeight: row.netWeight ?? 0,
    procurementDate: new Date(row.procurementDate),
    createdBy: row.createdBy,
    createdByEmail: row.createdByEmail,
    locationLatitude: row.locationLatitude,
    locationLongitude: row.locationLongitude,
    geojsonData: row.geojsonData,
    name: row.name,
    state: row.state,
    district: row.district,
    village: row.village,
    vehicleType: row.vehicleType,
    moisture: row.moisture,
  };
}

export async function getRawBiomassProcurements(
  stockPointId?: string,
  fromDate?: Date,
  toDate?: Date,
  userId?: string
): Promise<RawBiomassProcurement[]> {
  const list = await fetchApi<any[]>('/api/raw-biomass-procurement');
  return list.map((row) => ({
    id: row.id,
    stockPointId: row.stockPointId ?? '',
    source: row.source,
    vehicleNumber: row.vehicleNumber,
    vehicleWeight: row.vehicleWeight ?? 0,
    vehiclePhoto: row.vehiclePhoto ?? '',
    grossWeight: row.grossWeight ?? 0,
    weightRecordPhoto: row.weightRecordPhoto ?? '',
    netWeight: row.netWeight ?? 0,
    procurementDate: new Date(row.procurementDate),
    createdBy: row.createdBy,
    createdByEmail: row.createdByEmail,
    procurementId: row.procurementId,
    locationLatitude: row.locationLatitude,
    locationLongitude: row.locationLongitude,
    geojsonData: row.geojsonData,
    createdAt: row.createdAt ? new Date(row.createdAt) : undefined,
    name: row.name,
    state: row.state,
    district: row.district,
    village: row.village,
    vehicleType: row.vehicleType,
    moisture: row.moisture,
  }));
}

// Expenses
export async function createExpense(
  expense: Omit<Expense, 'id' | 'createdAt'>
): Promise<Expense> {
  const row = await fetchApi<any>('/api/expenses', {
    method: 'POST',
    body: {
      stockPointId: expense.stockPointId,
      date: expense.date,
      amount: expense.amount,
      type: expense.type,
      paymentMode: expense.paymentMode,
      receiptUrl: expense.receiptUrl,
      createdBy: expense.createdBy,
    },
  });
  return {
    id: row.id,
    stockPointId: row.stockPointId,
    date: new Date(row.date),
    amount: row.amount ?? 0,
    type: row.type,
    paymentMode: row.paymentMode,
    receiptUrl: row.receiptUrl ?? '',
    createdBy: row.createdBy,
    createdAt: new Date(row.createdAt),
  };
}

export async function getExpenses(
  stockPointId?: string,
  fromDate?: Date,
  toDate?: Date,
  expenseType?: string,
  inchargeId?: string
): Promise<Expense[]> {
  const params = new URLSearchParams();
  if (stockPointId) params.set('stockPointId', stockPointId);
  if (fromDate) params.set('fromDate', fromDate.toISOString().slice(0, 10));
  if (toDate) params.set('toDate', toDate.toISOString().slice(0, 10));
  if (expenseType) params.set('expenseType', expenseType);
  if (inchargeId) params.set('inchargeId', inchargeId);
  const q = params.toString() ? `?${params}` : '';
  const list = await fetchApi<any[]>(`/api/expenses${q}`);
  return list.map((row) => ({
    id: row.id,
    stockPointId: row.stockPointId,
    date: new Date(row.date),
    amount: row.amount ?? 0,
    type: row.type,
    paymentMode: row.paymentMode,
    receiptUrl: row.receiptUrl ?? '',
    createdBy: row.createdBy,
    createdAt: new Date(row.createdAt),
  }));
}

// Processed Biomass
export async function createProcessedBiomassProcurement(
  procurement: Omit<ProcessedBiomassProcurement, 'id'>
): Promise<ProcessedBiomassProcurement> {
  return fetchApi<ProcessedBiomassProcurement>('/api/processed-biomass-procurement', {
    method: 'POST',
    body: {
      plantId: procurement.plantId,
      sourceStockPointId: procurement.sourceStockPointId,
      vehicleNumber: procurement.vehicleNumber,
      vehicleWeight: procurement.vehicleWeight,
      vehiclePhoto: procurement.vehiclePhoto,
      vehiclePhotoLatitude: procurement.vehiclePhotoLatitude,
      vehiclePhotoLongitude: procurement.vehiclePhotoLongitude,
      grossWeight: procurement.grossWeight,
      weightRecordPhoto: procurement.weightRecordPhoto,
      weightPhotoLatitude: procurement.weightPhotoLatitude,
      weightPhotoLongitude: procurement.weightPhotoLongitude,
      netWeight: procurement.netWeight,
      procurementDate: procurement.procurementDate,
      createdBy: procurement.createdBy,
    },
  });
}

export async function getProcessedBiomassProcurements(
  plantId?: string
): Promise<ProcessedBiomassProcurement[]> {
  const q = plantId ? `?plantId=${encodeURIComponent(plantId)}` : '';
  return fetchApi<ProcessedBiomassProcurement[]>(`/api/processed-biomass-procurement${q}`);
}

// Biochar Deployment
export async function createBiocharDeployment(
  deployment: Omit<BiocharDeployment, 'id' | 'createdAt'>
): Promise<BiocharDeployment> {
  const row = await fetchApi<any>('/api/biochar-deployment', {
    method: 'POST',
    body: {
      plantId: deployment.plantId,
      farmerName: deployment.farmerName,
      mobileNumber: deployment.mobileNumber,
      aadhaarNumber: deployment.aadhaarNumber,
      village: deployment.village,
      mandal: deployment.mandal,
      district: deployment.district,
      landArea: deployment.landArea,
      biocharWeight: deployment.biocharWeight,
      numberOfBags: deployment.numberOfBags,
      kmlData: deployment.kmlData,
      createdBy: deployment.createdBy,
    },
  });
  return {
    ...row,
    createdAt: new Date(row.createdAt),
  };
}

export async function getBiocharDeployments(plantId?: string): Promise<BiocharDeployment[]> {
  const q = plantId ? `?plantId=${encodeURIComponent(plantId)}` : '';
  const list = await fetchApi<any[]>(`/api/biochar-deployment${q}`);
  return list.map((row) => ({
    ...row,
    createdAt: new Date(row.createdAt),
  }));
}

// Dashboard stats (computed client-side from API data, same logic as api.ts)
export async function getDashboardStats(
  userId: string,
  role: string,
  stockPointId?: string,
  plantId?: string
): Promise<DashboardStats> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());

  const stats: DashboardStats = {
    totalTripsToday: 0,
    netWeightToday: 0,
    netWeightThisWeek: 0,
    pendingUploads: 0,
    totalExpenses: 0,
    fuelExpenses: 0,
    pendingPayments: 0,
    clearedPayments: 0,
    processedBiomass: 0,
    biocharProduced: 0,
    farmersDeployed: 0,
    landCovered: 0,
  };

  try {
    if (role === 'supervisor_stockpoint') {
      const allUserTrips = await getRawBiomassProcurements(
        stockPointId,
        undefined,
        undefined,
        userId
      );
      const todayDateStr = today.toISOString().slice(0, 10);
      const todayTrips = allUserTrips.filter((trip) => {
        const d = trip.procurementDate instanceof Date ? trip.procurementDate : new Date(trip.procurementDate);
        return d.toISOString().slice(0, 10) === todayDateStr;
      });
      stats.totalTripsToday = todayTrips.length;
      stats.netWeightToday = todayTrips.reduce((s, t) => s + (t.netWeight || 0), 0);
      const weekEnd = new Date(today);
      weekEnd.setHours(23, 59, 59, 999);
      const weekTrips = allUserTrips.filter((trip) => {
        const d = new Date(trip.procurementDate);
        return d >= weekStart && d <= weekEnd;
      });
      stats.netWeightThisWeek = weekTrips.reduce((s, t) => s + (t.netWeight || 0), 0);
      stats.pendingUploads = todayTrips.filter(
        (t) => !t.vehiclePhoto || !t.weightRecordPhoto
      ).length;
    } else if (role === 'incharge') {
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      const expenses = await getExpenses(undefined, monthStart, today, undefined, userId);
      stats.totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
      stats.fuelExpenses = expenses.filter((e) => e.type === 'fuel').reduce((s, e) => s + e.amount, 0);
    } else if (role === 'supervisor_plant' && plantId) {
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      const processed = await getProcessedBiomassProcurements(plantId);
      const thisMonth = processed.filter((p) => new Date(p.procurementDate) >= monthStart);
      stats.processedBiomass = thisMonth.reduce((s, p) => s + p.netWeight, 0);
      stats.biocharProduced = stats.processedBiomass * 0.228;
      const deployments = await getBiocharDeployments(plantId);
      stats.farmersDeployed = deployments.filter((d) => new Date(d.createdAt) >= monthStart).length;
      stats.landCovered = deployments.reduce((s, d) => s + d.landArea, 0);
    }
  } catch (e) {
    console.error('getDashboardStats error', e);
  }

  return stats;
}
