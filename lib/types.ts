export type UserRole = 'SUPERVISOR' | 'ADMINISTRATION' | 'MANAGEMENT';

export interface User {
  id: number;
  name?: string | null;
  lastName?: string | null;
  email?: string | null;
  username: string;
  phone?: string | null;
  role: UserRole;
  isActive: boolean;
}

export interface Farm {
  id: number;
  name: string;
  description?: string | null;
  imageUrls: string[];
  isActive: boolean;
  createdAt?: string;
}

export interface CropType {
  id: number;
  name: string;
  description?: string | null;
  isActive: boolean;
}

export interface Plot {
  id: number;
  name: string;
  farmId: number;
  cropTypeId?: number | null;
  description?: string | null;
  imageUrls: string[];
  isActive: boolean;
  farm?: Farm;
  plotCropType?: CropType | null;
}

export interface PlotDetail extends Plot {
  farm: Farm;
  plotCropType: CropType | null;
}

export interface CropTypeDetail extends CropType {}

export interface FarmDetail extends Farm {
  plots: Plot[];
}

export interface Paginated {
  totalItems: number;
  currentPage: number;
  itemsPerPage: number;
  totalPages: number;
  [key: string]: unknown;
}

export interface FarmsResponse extends Paginated {
  farms: Farm[];
}

export interface PlotsResponse extends Paginated {
  plots: Plot[];
}

export interface CropTypesResponse extends Paginated {
  cropTypes: CropType[];
}

export interface Assignment {
  id: number;
  userId: number;
  plotId: number;
  assignedAt: string;
  unassignedAt: string | null;
  assignedUser?: Pick<User, 'id' | 'name' | 'lastName' | 'username' | 'role' | 'isActive'>;
  assignedPlot?: Pick<Plot, 'id' | 'name' | 'farmId'> & { farm?: Pick<Farm, 'id' | 'name'> };
}

export interface AssignmentsResponse extends Paginated {
  assignments: Assignment[];
}

export interface UsersResponse extends Paginated {
  users: User[];
}

export interface Campaign {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface CampaignsResponse extends Paginated {
  campaigns: Campaign[];
}

export interface ProductionDay {
  id: number;
  date: string;
  plotId: number;
  campaignId: number;
  notes?: string | null;
  createdById: number;
  dayPlot?: Pick<Plot, 'id' | 'name' | 'farmId'>;
  weighings?: Weighing[];
}

export interface ProductionDaysResponse extends Paginated {
  productionDays: ProductionDay[];
}

export interface Weighing {
  id: number;
  productionDayId: number;
  weight: number | string;
  createdById: number;
  createdAt: string;
}

export interface WeighingsResponse extends Paginated {
  weighings: Weighing[];
}

export interface WeighingCorrection {
  id: number;
  weighingId: number;
  originalValue: number | string;
  correctedValue: number | string;
  reason?: string | null;
  correctedById: number;
  createdAt: string;
}

export interface ProductionTarget {
  id: number;
  campaignId: number;
  plotId: number | null;
  targetWeight: number | string;
}

export interface ProductionTargetsResponse extends Paginated {
  productionTargets: ProductionTarget[];
}

export interface WeighingCorrectionsResponse extends Paginated {
  weighingCorrections: WeighingCorrection[];
}

export interface ProductionSummary {
  totalWeight: number;
  weighingCount: number;
  productionDayCount: number;
}

export interface ProductionByPlot {
  plotId: number;
  plotName: string;
  totalWeight: number;
  targetWeight: number | null;
  progress: number | null;
}
