export type ServiceStatus = "queued" | "in_progress" | "completed" | "paid";

export interface WorkshopSettings {
  taxRate: number;
  currency: string;
  commissionRate: number;
  workshopName: string;
  workshopAddress: string;
  workshopPhone: string;
  workshopLogo?: string;
  invoiceTerms?: string;
  waGatewayUrl?: string;
  waApiKey?: string;
}

export interface Payout {
  id: string;
  mechanicId: string;
  amount: number;
  orderIds: string[];
  date: string;
}

export interface InventoryLog {
  id: string;
  itemId: string;
  type: 'restock' | 'usage' | 'adjustment';
  quantity: number;
  previousStock: number;
  newStock: number;
  date: string;
  notes?: string;
}

export interface Transaction {
  id: string;
  receiptNumber: string;
  items: { name: string; qty: number; price: number }[];
  laborCost: number;
  subtotal: number;
  taxAmount: number;
  taxRate: number;
  discount: number;
  total: number;
  amountPaid: number;
  change: number;
  method: string;
  customerName: string;
  customerId?: string;
  linkedOrderId?: string;
  date: string;
}

export interface Vehicle {
  id: string;
  plateNumber: string;
  make: string;
  model: string;
  year: number;
  mileage: number;
  engineNumber: string;
  customerId: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address?: string;
  points: number;
  loyaltyPoints?: number; // Legacy field, use 'points' instead
  lastVisit?: string;
  nextServiceDate?: string;
  isWorkshop?: boolean;
}

export interface Mechanic {
  id: string;
  name: string;
  avatar: string;
  specialization: string;
  activeJobs: number;
  completedJobs: number;
  rating: number;
  totalCommissionPaid: number;
  lastPayoutDate?: string;
}

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  stock: number;
  minThreshold: number;
  price: number;
  costPrice: number;
  supplier: string;
  unit?: string;
}

export interface Expense {
  id: string;
  category: string;
  amount: number;
  date: string;
  description: string;
}

export interface ServicePackageItem {
  name: string;
  qty: number;
  price: number;
}

export interface ServicePackage {
  id: string;
  name: string;
  description: string;
  laborCost: number;
  items: ServicePackageItem[];
  totalPrice: number;
}

export interface ServiceOrder {
  id: string;
  vehicleId: string;
  vehicle: Vehicle;
  customerId: string;
  customer: Customer;
  mechanicId: string;
  mechanic: Mechanic;
  status: ServiceStatus;
  description: string;
  items: { name: string; qty: number; price: number }[];
  laborCost: number;
  totalAmount: number;
  createdAt: string;
  notes: string;
  packageId?: string;
  checklist?: {
    engineOil: boolean;
    brakes: boolean;
    tires: boolean;
    battery: boolean;
    lights: boolean;
  };
  startedAt?: string;
  completedAt?: string;
}

export const customers: Customer[] = [];
export const mechanics: Mechanic[] = [];
export const vehicles: Vehicle[] = [];
export const inventory: InventoryItem[] = [];
export const expenses: Expense[] = [];
export const servicePackages: ServicePackage[] = [];
export const serviceOrders: ServiceOrder[] = [];

export const revenueData = [
  { date: "Sen", revenue: 0 },
  { date: "Sel", revenue: 0 },
  { date: "Rab", revenue: 0 },
  { date: "Kam", revenue: 0 },
  { date: "Jum", revenue: 0 },
  { date: "Sab", revenue: 0 },
  { date: "Min", revenue: 0 },
];

export const monthlyRevenue = [
  { month: "Jan", revenue: 0 },
  { month: "Feb", revenue: 0 },
  { month: "Mar", revenue: 0 },
];

export const defaultSettings: WorkshopSettings = {
  taxRate: 0,
  currency: "Rp",
  commissionRate: 10,
  workshopName: "Your Workshop Name",
  workshopAddress: "Workshop Address",
  workshopPhone: "+62 8xx xxxx xxxx",
  invoiceTerms: "1. Garansi servis berlaku selama 7 hari atau 500km.\n2. Barang yang sudah dibeli tidak dapat dikembalikan.\n3. Kerusakkan akibat kelalaian pengguna pasca servis bukan tanggung jawab bengkel.\n4. Estimasi biaya dapat berubah sewaktu-waktu sesuai kondisi kendaraan."
};

export const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);
