export type ServiceStatus = "queued" | "in_progress" | "completed" | "paid";

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
  loyaltyPoints: number;
}

export interface Mechanic {
  id: string;
  name: string;
  avatar: string;
  specialization: string;
  activeJobs: number;
  completedJobs: number;
  rating: number;
}

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  stock: number;
  minThreshold: number;
  price: number;
  supplier: string;
}

export interface ServiceOrder {
  id: string;
  vehicleId: string;
  vehicle: Vehicle;
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
}

export const customers: Customer[] = [
  { id: "c1", name: "Ahmad Rizki", phone: "+62 812-3456-7890", email: "ahmad@email.com", loyaltyPoints: 320 },
  { id: "c2", name: "Sarah Chen", phone: "+62 813-9876-5432", email: "sarah@email.com", loyaltyPoints: 150 },
  { id: "c3", name: "Budi Santoso", phone: "+62 811-2233-4455", email: "budi@email.com", loyaltyPoints: 580 },
  { id: "c4", name: "Maria Lopez", phone: "+62 814-5566-7788", email: "maria@email.com", loyaltyPoints: 90 },
  { id: "c5", name: "Dian Pratama", phone: "+62 815-6677-8899", email: "dian@email.com", loyaltyPoints: 445 },
];

export const mechanics: Mechanic[] = [
  { id: "m1", name: "Alex Wibowo", avatar: "AW", specialization: "Mesin", activeJobs: 2, completedJobs: 847, rating: 4.9 },
  { id: "m2", name: "Rudi Hartono", avatar: "RH", specialization: "Rem & Suspensi", activeJobs: 1, completedJobs: 623, rating: 4.7 },
  { id: "m3", name: "Fajar Nugroho", avatar: "FN", specialization: "Kelistrikan", activeJobs: 3, completedJobs: 512, rating: 4.8 },
  { id: "m4", name: "Eko Prasetyo", avatar: "EP", specialization: "Transmisi", activeJobs: 0, completedJobs: 391, rating: 4.6 },
];

export const vehicles: Vehicle[] = [
  { id: "v1", plateNumber: "B 1234 XY", make: "Honda", model: "Civic", year: 2022, mileage: 32400, engineNumber: "R18Z1-4521087", customerId: "c1" },
  { id: "v2", plateNumber: "D 5678 AB", make: "Toyota", model: "Fortuner", year: 2021, mileage: 58200, engineNumber: "2GD-8734521", customerId: "c2" },
  { id: "v3", plateNumber: "B 9012 CD", make: "Yamaha", model: "NMAX", year: 2023, mileage: 12100, engineNumber: "G3J9E-1123456", customerId: "c3" },
  { id: "v4", plateNumber: "F 3456 EF", make: "Suzuki", model: "Ertiga", year: 2020, mileage: 78500, engineNumber: "K15B-9987654", customerId: "c4" },
  { id: "v5", plateNumber: "B 7890 GH", make: "Honda", model: "CBR250RR", year: 2023, mileage: 8900, engineNumber: "MC41E-2234567", customerId: "c5" },
];

export const inventory: InventoryItem[] = [
  { id: "i1", sku: "OIL-5W30-SYN", name: "Oli Sintetis 5W-30", category: "Cairan", stock: 45, minThreshold: 10, price: 85000, supplier: "Shell Indonesia" },
  { id: "i2", sku: "BRK-PAD-FRT", name: "Set Kanvas Rem Depan", category: "Rem", stock: 8, minThreshold: 5, price: 350000, supplier: "Brembo Asia" },
  { id: "i3", sku: "FLT-OIL-001", name: "Filter Oli Universal", category: "Filter", stock: 32, minThreshold: 15, price: 45000, supplier: "Denso Indonesia" },
  { id: "i4", sku: "SPK-PLG-IR", name: "Busi Iridium", category: "Pengapian", stock: 3, minThreshold: 8, price: 125000, supplier: "NGK Japan" },
  { id: "i5", sku: "CLN-CHN-500", name: "Pembersih Rantai 500ml", category: "Perawatan", stock: 22, minThreshold: 10, price: 65000, supplier: "Motul" },
  { id: "i6", sku: "TIR-TUB-17", name: 'Ban Dalam 17"', category: "Ban", stock: 14, minThreshold: 6, price: 55000, supplier: "IRC Indonesia" },
  { id: "i7", sku: "BLT-TMG-V", name: "V-Belt Timing", category: "Penggerak", stock: 6, minThreshold: 4, price: 280000, supplier: "Gates Asia" },
  { id: "i8", sku: "CLD-RAD-1L", name: "Air Radiator 1L", category: "Cairan", stock: 18, minThreshold: 8, price: 72000, supplier: "Prestone" },
];

export const serviceOrders: ServiceOrder[] = [
  {
    id: "SO-001", vehicleId: "v1", vehicle: vehicles[0], customer: customers[0], mechanicId: "m1", mechanic: mechanics[0],
    status: "in_progress", description: "Servis mesin lengkap + ganti oli",
    items: [{ name: "Oli Sintetis 5W-30", qty: 4, price: 85000 }, { name: "Filter Oli Universal", qty: 1, price: 45000 }],
    laborCost: 200000, totalAmount: 585000, createdAt: "2026-03-15T08:30:00", notes: "Pelanggan meminta oli premium"
  },
  {
    id: "SO-002", vehicleId: "v2", vehicle: vehicles[1], customer: customers[1], mechanicId: "m2", mechanic: mechanics[1],
    status: "queued", description: "Ganti kanvas rem — depan",
    items: [{ name: "Set Kanvas Rem Depan", qty: 1, price: 350000 }],
    laborCost: 150000, totalAmount: 500000, createdAt: "2026-03-15T09:15:00", notes: ""
  },
  {
    id: "SO-003", vehicleId: "v3", vehicle: vehicles[2], customer: customers[2], mechanicId: "m3", mechanic: mechanics[2],
    status: "completed", description: "Diagnosis kelistrikan + ganti busi",
    items: [{ name: "Busi Iridium", qty: 2, price: 125000 }],
    laborCost: 175000, totalAmount: 425000, createdAt: "2026-03-15T07:00:00", notes: "Koil pengapian diperiksa — OK"
  },
  {
    id: "SO-004", vehicleId: "v5", vehicle: vehicles[4], customer: customers[4], mechanicId: "m1", mechanic: mechanics[0],
    status: "paid", description: "Pembersihan & pelumasan rantai",
    items: [{ name: "Pembersih Rantai 500ml", qty: 1, price: 65000 }],
    laborCost: 100000, totalAmount: 165000, createdAt: "2026-03-14T14:00:00", notes: ""
  },
  {
    id: "SO-005", vehicleId: "v4", vehicle: vehicles[3], customer: customers[3], mechanicId: "m4", mechanic: mechanics[3],
    status: "queued", description: "Ganti timing belt",
    items: [{ name: "V-Belt Timing", qty: 1, price: 280000 }],
    laborCost: 350000, totalAmount: 630000, createdAt: "2026-03-15T10:00:00", notes: "Periksa pompa air saat servis"
  },
];

export const revenueData = [
  { date: "Sen", revenue: 2850000 },
  { date: "Sel", revenue: 3120000 },
  { date: "Rab", revenue: 2640000 },
  { date: "Kam", revenue: 4100000 },
  { date: "Jum", revenue: 3780000 },
  { date: "Sab", revenue: 5200000 },
  { date: "Min", revenue: 1900000 },
];

export const monthlyRevenue = [
  { month: "Jan", revenue: 42000000 },
  { month: "Feb", revenue: 38500000 },
  { month: "Mar", revenue: 51200000 },
];

export const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);
