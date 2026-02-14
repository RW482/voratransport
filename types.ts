
export enum TripStatus {
  LOADING = 'LOADING',
  ON_ROAD = 'ON_ROAD',
  UNLOADING = 'UNLOADING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export type RouteType = 'MUM_KOP' | 'KOP_MUM' | 'OTHER';

export interface Truck {
  id: string;
  numberPlate: string;
  driverName: string;
  driverMobile: string;
  capacity: string;
  loadedWeight: string;
  fromStation: string;
  toStation: string;
  dispatchDate: string;
  status: TripStatus;
  lastUpdated: string;
  isHired: boolean;
  hiredFreightAmount: number;
  advancePaid: number;
  lorryOwnerName?: string;
  routeType: RouteType;
}

export interface LogisticsOrder {
  id: string;
  partyName: string;
  broker: string;
  mobileNo: string;
  plotNo: string;
  weight: string;
  remark: string;
  status: 'PENDING' | 'LOADED' | 'CANCELLED';
  orderDate: string;
  branch: string;
}

export interface HiredInvoice {
  id: string;
  lorryOwnerName: string;
  driverName: string;
  mobileNo: string;
  vehicleNo: string;
  from: string;
  to: string;
  amount: number;
  totalWeight: string;
  advance: number;
  gPayName: string;
  gPayNumber: string;
  isPaid: boolean;
  createdAt: string;
}

export interface AppState {
  trucks: Truck[];
  orders: LogisticsOrder[];
  branches: string[];
  invoices: HiredInvoice[];
}
