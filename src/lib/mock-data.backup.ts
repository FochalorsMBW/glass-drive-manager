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
}

export const customers: Customer[] = [
  { id: "c1", name: "Budi Santoso", phone: "081234567890", email: "ahmad@email.com", address: "Jl. Merdeka No. 10, Jakarta", points: 450, lastVisit: "2024-03-10", nextServiceDate: "2024-07-10" },
  { id: "c2", name: "Siti Aminah", phone: "089876543210", email: "sarah@email.com", address: "Jl. Mawar No. 5, Bandung", points: 1280, lastVisit: "2024-02-28", nextServiceDate: "2024-06-28" },
  { id: "c3", name: "Andi Wijaya", phone: "085678901234", email: "budi@email.com", address: "Jl. Melati No. 8, Surabaya", points: 85, lastVisit: "2024-03-15", nextServiceDate: "2024-07-15" },
  { id: "c4", name: "Dewi Lestari", phone: "081122334455", email: "maria@email.com", address: "Jl. Anggrek No. 12, Semarang", points: 2150, lastVisit: "2024-03-05", nextServiceDate: "2024-07-05" },
  { id: "c5", name: "Rian Hidayat", phone: "087766554433", email: "dian@email.com", address: "Jl. Kenanga No. 3, Medan", points: 620, lastVisit: "2024-02-20", nextServiceDate: "2024-06-20" },
];

export const mechanics: Mechanic[] = [
  { id: "m1", name: "Alex Wibowo", avatar: "AW", specialization: "Mesin", activeJobs: 2, completedJobs: 847, rating: 4.9, totalCommissionPaid: 0 },
  { id: "m2", name: "Rudi Hartono", avatar: "RH", specialization: "Rem & Suspensi", activeJobs: 1, completedJobs: 623, rating: 4.7, totalCommissionPaid: 0 },
  { id: "m3", name: "Fajar Nugroho", avatar: "FN", specialization: "Kelistrikan", activeJobs: 3, completedJobs: 512, rating: 4.8, totalCommissionPaid: 0 },
  { id: "m4", name: "Eko Prasetyo", avatar: "EP", specialization: "Transmisi", activeJobs: 0, completedJobs: 391, rating: 4.6, totalCommissionPaid: 0 },
];

export const vehicles: Vehicle[] = [
  { id: "v1", plateNumber: "B 1234 XY", make: "Honda", model: "Civic", year: 2022, mileage: 32400, engineNumber: "R18Z1-4521087", customerId: "c1" },
  { id: "v2", plateNumber: "D 5678 AB", make: "Toyota", model: "Fortuner", year: 2021, mileage: 58200, engineNumber: "2GD-8734521", customerId: "c2" },
  { id: "v3", plateNumber: "B 9012 CD", make: "Yamaha", model: "NMAX", year: 2023, mileage: 12100, engineNumber: "G3J9E-1123456", customerId: "c3" },
  { id: "v4", plateNumber: "F 3456 EF", make: "Suzuki", model: "Ertiga", year: 2020, mileage: 78500, engineNumber: "K15B-9987654", customerId: "c4" },
  { id: "v5", plateNumber: "B 7890 GH", make: "Honda", model: "CBR250RR", year: 2023, mileage: 8900, engineNumber: "MC41E-2234567", customerId: "c5" },
];

export const inventory: InventoryItem[] = [
  { id: "i1", sku: "OIL-5W30-SYN", name: "Oli Sintetis 5W-30", category: "Cairan", stock: 45, minThreshold: 10, price: 85000, costPrice: 65000, supplier: "Shell Indonesia", unit: "Botol" },
  { id: "i2", sku: "BRK-PAD-FRT", name: "Set Kanvas Rem Depan", category: "Rem", stock: 8, minThreshold: 5, price: 350000, costPrice: 280000, supplier: "Brembo Asia", unit: "Set" },
  { id: "i3", sku: "FLT-OIL-001", name: "Filter Oli Universal", category: "Filter", stock: 32, minThreshold: 15, price: 45000, costPrice: 30000, supplier: "Denso Indonesia", unit: "Pcs" },
  { id: "i4", sku: "SPK-PLG-IR", name: "Busi Iridium", category: "Pengapian", stock: 3, minThreshold: 8, price: 125000, costPrice: 95000, supplier: "NGK Japan", unit: "Pcs" },
  { id: "i5", sku: "CLN-CHN-500", name: "Pembersih Rantai 500ml", category: "Perawatan", stock: 22, minThreshold: 10, price: 65000, costPrice: 45000, supplier: "Motul", unit: "Botol" },
  { id: "i7", sku: "BLT-TMG-V", name: "V-Belt Timing", category: "Penggerak", stock: 6, minThreshold: 4, price: 280000, costPrice: 210000, supplier: "Gates Asia", unit: "Pcs" },
  { id: "i8", sku: "CLD-RAD-1L", name: "Air Radiator 1L", category: "Cairan", stock: 18, minThreshold: 8, price: 72000, costPrice: 55000, supplier: "Prestone", unit: "Botol" },
];

export const expenses: Expense[] = [
  { id: "e1", category: "Listrik", amount: 1200000, date: "2024-03-01", description: "Tagihan Listrik Februari" },
  { id: "e2", category: "Gaji", amount: 4500000, date: "2024-03-01", description: "Gaji 2 Mekanik Junior" },
];

export const servicePackages: ServicePackage[] = [
  {
    id: "pkg1",
    name: "Paket Ganti Oli Standar",
    description: "Ganti oli mesin, ganti filter oli, dan pengecekan umum.",
    laborCost: 50000,
    totalPrice: 450000,
    items: [
      { name: "Oli Sintetis 5W-30", qty: 4, price: 95000 },
      { name: "Filter Oli Universal", qty: 1, price: 55000 }
    ]
  },
  {
    id: "pkg2",
    name: "Paket Servis Ringan",
    description: "Pembersihan rem, tune up ringan, dan scanner engine.",
    laborCost: 250000,
    totalPrice: 250000,
    items: []
  },
  {
    id: "pkg3",
    name: "Paket Tune-Up Pro",
    description: "Servis lengkap sistem injeksi, pembersihan busi, dan filter udara.",
    laborCost: 150000,
    totalPrice: 350000,
    items: [
      { name: "Semburan Pembersih Injeksi", qty: 1, price: 85000 },
      { name: "Filter Udara Racing", qty: 1, price: 115000 }
    ]
  }
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

export const defaultSettings: WorkshopSettings = {
  taxRate: 0,
  currency: "Rp",
  commissionRate: 10,
  workshopName: "UB Service",
  workshopAddress: "Jl. Veteran No. 1, Malang, Jawa Timur",
  workshopPhone: "+62 (341) 555-0192",
  invoiceTerms: "1. Garansi servis berlaku selama 7 hari atau 500km.\n2. Barang yang sudah dibeli tidak dapat dikembalikan.\n3. Kerusakkan akibat kelalaian pengguna pasca servis bukan tanggung jawab bengkel.\n4. Estimasi biaya dapat berubah sewaktu-waktu sesuai kondisi kendaraan."
};

export const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);
