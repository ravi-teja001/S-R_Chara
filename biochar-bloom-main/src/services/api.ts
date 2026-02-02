/**
 * API layer: uses Railway backend when VITE_API_URL is set, otherwise Supabase.
 */

import { environment } from '@/lib/environment';
import * as apiRailway from './apiRailway';
import * as apiSupabase from './apiSupabase';

const api = environment.apiUrl ? apiRailway : apiSupabase;

export const getStockPoints = api.getStockPoints;
export const getPlants = api.getPlants;
export const getVehicles = api.getVehicles;
export const createVehicle = api.createVehicle;
export const updateVehicle = api.updateVehicle;
export const deleteVehicle = api.deleteVehicle;
export const updateOldLocalRecordsEmail = api.updateOldLocalRecordsEmail;
export const syncLocalRecordsToDatabase = api.syncLocalRecordsToDatabase;
export const createRawBiomassProcurement = api.createRawBiomassProcurement;
export const getRawBiomassProcurements = api.getRawBiomassProcurements;
export const createExpense = api.createExpense;
export const getExpenses = api.getExpenses;
export const createProcessedBiomassProcurement = api.createProcessedBiomassProcurement;
export const getProcessedBiomassProcurements = api.getProcessedBiomassProcurements;
export const createBiocharDeployment = api.createBiocharDeployment;
export const getBiocharDeployments = api.getBiocharDeployments;
export const getDashboardStats = api.getDashboardStats;

export type DashboardStats = import('./apiSupabase').DashboardStats;
