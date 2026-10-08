export type VisitStatus = "Planned" | "Completed" | "Cancelled";
export type VisitType = "Routine" | "Training" | "Inspection" | "Emergency";

export interface Farmer {
  id: number;
  fullName: string;
  nationalId: string;
  phoneNumber: string;
  region: string;
  district: string;
  createdAt: string;
}

export interface FarmerInput {
  fullName: string;
  nationalId: string;
  phoneNumber: string;
  region: string;
  district: string;
}

export interface FarmVisit {
  id: number;
  farmerId: number;
  farmerName: string | null;
  visitDate: string;
  visitType: VisitType;
  notes: string | null;
  status: VisitStatus;
  nextVisitDate: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface FarmVisitInput {
  farmerId: number;
  visitDate: string;
  visitType: VisitType;
  notes: string | null;
  status: VisitStatus;
  nextVisitDate: string | null;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface DashboardSummary {
  totalFarmers: number;
  totalVisits: number;
  plannedVisits: number;
  completedVisits: number;
  upcomingVisits: FarmVisit[];
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  username: string;
  role: string;
}