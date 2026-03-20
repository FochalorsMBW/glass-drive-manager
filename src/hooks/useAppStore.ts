import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  type ServiceOrder, type ServiceStatus, type Mechanic, type Vehicle, type Customer, type InventoryItem, type Expense, 
  type ServicePackage,
  type Payout,
  type InventoryLog,
  type WorkshopSettings,
  type Transaction,
  serviceOrders as initialOrders, 
  mechanics as initialMechanics, 
  vehicles as initialVehicles, 
  customers as initialCustomers, 
  inventory as initialInventory,
  expenses as initialExpenses,
  servicePackages as initialPackages,
  revenueData as initialRevenue,
  monthlyRevenue as initialMonthly
} from "@/lib/mock-data";

export type NotificationStatus = 'sent' | 'pending' | 'failed';

export interface NotificationLog {
  id: string;
  orderId: string;
  customerName: string;
  type: string;
  status: NotificationStatus;
  message: string;
  timestamp: string;
}

interface AppState {
  serviceOrders: ServiceOrder[];
  mechanics: Mechanic[];
  vehicles: Vehicle[];
  customers: Customer[];
  inventory: InventoryItem[];
  activities: { id: string; type: 'order' | 'inventory' | 'customer' | 'finance'; message: string; timestamp: string }[];
  expenses: Expense[];
  searchQuery: string;
  settings: WorkshopSettings;
  servicePackages: ServicePackage[];
  revenueData: { date: string; revenue: number }[];
  monthlyRevenue: { month: string; revenue: number }[];
  notifications: NotificationLog[];
  payouts: Payout[];
  inventoryLogs: InventoryLog[];
  transactions: Transaction[];
  receiptCounter: number;
  
  // Actions
  setSearchQuery: (query: string) => void;
  addServiceOrder: (order: ServiceOrder) => void;
  updateServiceOrderStatus: (id: string, status: ServiceStatus) => void;
  updateServiceChecklist: (orderId: string, checklist: ServiceOrder['checklist']) => void;
  addInventoryItem: (item: InventoryItem) => void;
  updateInventoryStock: (id: string, delta: number) => void;
  updateStock: (id: string, newStock: number) => void;
  addCustomer: (customer: Customer) => void;
  addVehicle: (vehicle: Vehicle) => void;
  addActivity: (type: 'order' | 'inventory' | 'customer' | 'finance', message: string) => void;
  addExpense: (expense: Expense) => void;
  deleteExpense: (id: string) => void;
  updateSettings: (settings: Partial<WorkshopSettings>) => void;
  addTransaction: (amount: number) => void;
  addSaleTransaction: (trx: Transaction) => void;
  addLoyaltyPoints: (customerId: string, points: number) => void;
  addNotificationLog: (log: NotificationLog) => void;
  addServicePackage: (pkg: ServicePackage) => void;
  updateServicePackage: (pkg: ServicePackage) => void;
  deleteServicePackage: (id: string) => void;
  addMechanic: (mechanic: Mechanic) => void;
  updateMechanic: (mechanic: Mechanic) => void;
  deleteMechanic: (id: string) => void;
  processPayout: (payout: Payout) => void;
  restockItem: (itemId: string, quantity: number, notes?: string) => void;
  resetData: () => void;
}


export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      serviceOrders: initialOrders,
      mechanics: initialMechanics,
      vehicles: initialVehicles,
      customers: initialCustomers,
      inventory: initialInventory,
      activities: [],
      searchQuery: "",
      settings: {
        taxRate: 11,
        currency: "IDR",
        commissionRate: 20,
        workshopName: "UB Service",
        workshopAddress: "Jl. Raya Lawang No. 123, Malang",
        workshopPhone: "0812-3456-7890",
        workshopLogo: "",
        invoiceTerms: "1. Garansi servis 7 hari.\n2. Sparepart asli tidak dapat dikembalikan.\n3. Pembayaran tunai/transfer.",
        waGatewayUrl: "https://api.whatsapp.com/send",
        waApiKey: "",
      },
      expenses: initialExpenses,
      servicePackages: initialPackages,
      revenueData: initialRevenue,
      monthlyRevenue: initialMonthly,
      notifications: [],
      payouts: [],
      inventoryLogs: [],
      transactions: [],
      receiptCounter: 1000,

      setSearchQuery: (query) => set({ searchQuery: query }),
      
      addServiceOrder: (order) => set((state) => ({ 
        serviceOrders: [order, ...state.serviceOrders],
        activities: [{
          id: Date.now().toString(),
          type: 'order',
          message: `Pesanan baru ${order.id} dibuat`,
          timestamp: new Date().toISOString()
        }, ...state.activities]
      })),

      updateServiceOrderStatus: (id, status) => set((state) => {
        let updatedCustomers = [...state.customers];
        const order = state.serviceOrders.find(o => o.id === id);
        
        if (status === 'paid' && order) {
          // Auto-calculate next service date (4 months from now)
          const nextDate = new Date();
          nextDate.setMonth(nextDate.getMonth() + 4);
          
          updatedCustomers = state.customers.map(c => 
            c.id === order.customer.id 
              ? { ...c, nextServiceDate: nextDate.toISOString() } 
              : c
          );
        }

        return {
          serviceOrders: state.serviceOrders.map((o) => o.id === id ? { ...o, status } : o),
          customers: updatedCustomers,
          activities: [{
            id: Date.now().toString(),
            type: 'order',
            message: `Status pesanan ${id} diperbarui menjadi ${status}`,
            timestamp: new Date().toISOString()
          }, ...state.activities]
        };
      }),

      updateServiceChecklist: (orderId, checklist) => set((state) => ({
        serviceOrders: state.serviceOrders.map(o => o.id === orderId ? { ...o, checklist } : o)
      })),

      addInventoryItem: (item) => set((state) => ({ 
        inventory: [...state.inventory, item],
        activities: [{
          id: Date.now().toString(),
          type: 'inventory',
          message: `Item baru ${item.name} ditambahkan ke inventaris`,
          timestamp: new Date().toISOString()
        }, ...state.activities]
      })),

      updateInventoryStock: (id, delta) => set((state) => ({
        inventory: state.inventory.map((i) => i.id === id ? { ...i, stock: i.stock + delta } : i)
      })),

      updateStock: (id, newStock) => set((state) => ({
        inventory: state.inventory.map((i) => i.id === id ? { ...i, stock: newStock } : i)
      })),

      addCustomer: (customer) => set((state) => ({ 
        customers: [...state.customers, customer],
        activities: [{
          id: Date.now().toString(),
          type: 'customer',
          message: `Pelanggan baru ${customer.name} terdaftar`,
          timestamp: new Date().toISOString()
        }, ...state.activities]
      })),

      addVehicle: (vehicle) => set((state) => ({ 
        vehicles: [...state.vehicles, vehicle],
        activities: [{
          id: Date.now().toString(),
          type: 'customer',
          message: `Kendaraan ${vehicle.plateNumber} (${vehicle.make}) didaftarkan`,
          timestamp: new Date().toISOString()
        }, ...state.activities]
      })),

      addActivity: (type, message) => set((state) => ({
        activities: [{
          id: Date.now().toString(),
          type,
          message,
          timestamp: new Date().toISOString()
        }, ...state.activities]
      })),

      addExpense: (expense) => set((state) => ({
        expenses: [...state.expenses, expense],
        activities: [{
          id: Date.now().toString(),
          type: 'finance',
          message: `Pengeluaran baru: ${expense.category} - Rp ${expense.amount.toLocaleString()}`,
          timestamp: new Date().toISOString()
        }, ...state.activities]
      })),

      deleteExpense: (id) => set((state) => ({
        expenses: state.expenses.filter(e => e.id !== id)
      })),

      updateSettings: (newSettings) => set((state) => ({
        settings: { ...state.settings, ...newSettings }
      })),

      addMechanic: (mechanic) => set((state) => ({
        mechanics: [...state.mechanics, mechanic],
        activities: [{
          id: Date.now().toString(),
          type: 'order',
          message: `Mekanik baru ${mechanic.name} bergabung`,
          timestamp: new Date().toISOString()
        }, ...state.activities]
      })),

      updateMechanic: (mechanic) => set((state) => ({
        mechanics: state.mechanics.map(m => m.id === mechanic.id ? mechanic : m)
      })),

      deleteMechanic: (id) => set((state) => ({
        mechanics: state.mechanics.filter(m => m.id !== id)
      })),

      processPayout: (payout) => set((state) => {
        const mechanic = state.mechanics.find(m => m.id === payout.mechanicId);
        const amountStr = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(payout.amount);
        return {
          payouts: [payout, ...state.payouts],
          mechanics: state.mechanics.map(m => 
            m.id === payout.mechanicId 
              ? { ...m, totalCommissionPaid: (m.totalCommissionPaid || 0) + payout.amount, lastPayoutDate: payout.date } 
              : m
          ),
          expenses: [
            ...state.expenses,
            {
              id: `EXP-PAY-${Math.floor(Math.random() * 10000)}`,
              category: "Gaji/Komisi",
              amount: payout.amount,
              date: payout.date,
              description: `Pembayaran komisi untuk ${mechanic?.name || 'Mekanik'}`
            }
          ],
          activities: [{
            id: Date.now().toString(),
            type: 'finance',
            message: `Pembayaran komisi ${mechanic?.name} — ${amountStr}`,
            timestamp: new Date().toISOString()
          }, ...state.activities]
        };
      }),

      addTransaction: (amount) => set((state) => {
        const today = new Date().toLocaleDateString('id-ID', { weekday: 'short' });
        const dayLabel = today.charAt(0).toUpperCase() + today.slice(1);
        
        return {
          revenueData: state.revenueData.map(d => 
            d.date === dayLabel ? { ...d, revenue: d.revenue + amount } : d
          )
        };
      }),

      addSaleTransaction: (trx) => set((state) => ({
        transactions: [trx, ...state.transactions],
        receiptCounter: state.receiptCounter + 1,
        activities: [{
          id: Date.now().toString(),
          type: 'finance',
          message: `Transaksi POS ${trx.receiptNumber} — ${trx.method} ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(trx.total)}`,
          timestamp: new Date().toISOString()
        }, ...state.activities]
      })),

      addLoyaltyPoints: (customerId, points) => set((state) => ({
        customers: state.customers.map(c => 
          c.id === customerId ? { ...c, points: (c.points || 0) + points } : c
        )
      })),

      addNotificationLog: (log) => set((state) => ({ 
        notifications: [log, ...state.notifications] 
      })),

      addServicePackage: (pkg) => set((state) => ({
        servicePackages: [...state.servicePackages, pkg]
      })),

      updateServicePackage: (pkg) => set((state) => ({
        servicePackages: state.servicePackages.map(p => p.id === pkg.id ? pkg : p)
      })),

      deleteServicePackage: (id) => set((state) => ({
        servicePackages: state.servicePackages.filter(p => p.id !== id)
      })),

      restockItem: (itemId, quantity, notes) => set((state) => {
        const item = state.inventory.find(i => i.id === itemId);
        if (!item) return state;
        
        const newStock = item.stock + quantity;
        const log: InventoryLog = {
          id: `LOG-${Math.floor(Math.random() * 100000)}`,
          itemId,
          type: 'restock',
          quantity,
          previousStock: item.stock,
          newStock,
          date: new Date().toISOString(),
          notes
        };

        return {
          inventory: state.inventory.map(i => i.id === itemId ? { ...i, stock: newStock } : i),
          inventoryLogs: [log, ...state.inventoryLogs],
          activities: [{
            id: Date.now().toString(),
            type: 'inventory',
            message: `Restock item: ${item.name} (+${quantity})`,
            timestamp: new Date().toISOString()
          }, ...state.activities]
        };
      }),
      
      resetData: () => set({
        serviceOrders: initialOrders,
        mechanics: initialMechanics,
        vehicles: initialVehicles,
        customers: initialCustomers,
        inventory: initialInventory,
        activities: [],
        expenses: initialExpenses,
        servicePackages: initialPackages,
        revenueData: initialRevenue,
        monthlyRevenue: initialMonthly,
        notifications: [],
        payouts: [],
        inventoryLogs: [],
        transactions: [],
        receiptCounter: 1000,
        settings: {
          taxRate: 11,
          currency: "IDR",
          commissionRate: 20,
          workshopName: "UB Service",
          workshopAddress: "Jl. Raya Lawang No. 123, Malang",
          workshopPhone: "0812-3456-7890",
          workshopLogo: "",
          invoiceTerms: "1. Garansi servis 7 hari.\n2. Sparepart asli tidak dapat dikembalikan.\n3. Pembayaran tunai/transfer.",
          waGatewayUrl: "https://api.whatsapp.com/send",
          waApiKey: "",
        },
      }),
    }),

    {
      name: 'workshop-storage',
    }
  )
);
