import { create } from 'zustand';
import { persist, createJSONStorage, type StateStorage } from 'zustand/middleware';
import { get, set, del } from 'idb-keyval';
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
  deleteServiceOrder: (id: string) => void;
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
  updateCustomer: (customer: Customer) => void;
  deleteCustomer: (id: string) => void;
  updateVehicle: (vehicle: Vehicle) => void;
  deleteVehicle: (id: string) => void;
  updateInventoryItem: (item: InventoryItem) => void;
  deleteInventoryItem: (id: string) => void;
  resetData: () => void;
  loadBackup: (data: any) => void;
  pruneArchivedData: (beforeDate: Date) => {
    archivedOrders: ServiceOrder[];
    archivedTransactions: Transaction[];
    archivedExpenses: Expense[];
  };
}

// Custom IndexedDB storage for Zustand to bypass localStorage 5MB limit
const idbStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    return (await get(name)) || null;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await set(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    await del(name);
  },
};

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
        let updatedInventory = [...state.inventory];
        let updatedLogs = [...state.inventoryLogs];
        const order = state.serviceOrders.find(o => o.id === id);
        
        // F3: Timestamp Recording
        let newStartedAt = order?.startedAt;
        let newCompletedAt = order?.completedAt;

        if (status === 'in_progress' && order?.status === 'queued') {
          newStartedAt = new Date().toISOString();
        } else if (status === 'completed' && order?.status === 'in_progress') {
          newCompletedAt = new Date().toISOString();
        }
        
        // --- Integrity Management: Stock Logic ---
        // 1. Deduct stock when order starts processing (queued -> in_progress)
        if (status === 'in_progress' && order?.status === 'queued' && order.items) {
          order.items.forEach((orderItem: any) => {
            const invIdx = updatedInventory.findIndex(i => i.name === orderItem.name);
            if (invIdx !== -1) {
              const prev = updatedInventory[invIdx].stock;
              const newStock = Math.max(0, prev - (orderItem.qty || 1));
              updatedInventory[invIdx] = { ...updatedInventory[invIdx], stock: newStock };
              updatedLogs = [{
                id: `LOG-SRV-${Date.now()}-${invIdx}`,
                itemId: updatedInventory[invIdx].id,
                type: 'usage' as const,
                quantity: -(orderItem.qty || 1),
                previousStock: prev,
                newStock,
                date: new Date().toISOString(),
                notes: `Usage via Service Order ${id} (In Progress)`
              }, ...updatedLogs];
            }
          });
        }
        
        // 2. Return stock if order is rolled back (in_progress -> queued)
        if (status === 'queued' && order?.status === 'in_progress' && order.items) {
          order.items.forEach((orderItem: any) => {
            const invIdx = updatedInventory.findIndex(i => i.name === orderItem.name);
            if (invIdx !== -1) {
              const prev = updatedInventory[invIdx].stock;
              const newStock = prev + (orderItem.qty || 1);
              updatedInventory[invIdx] = { ...updatedInventory[invIdx], stock: newStock };
              updatedLogs = [{
                id: `LOG-SRV-RTN-${Date.now()}-${invIdx}`,
                itemId: updatedInventory[invIdx].id,
                type: 'restock' as const,
                quantity: (orderItem.qty || 1),
                previousStock: prev,
                newStock,
                date: new Date().toISOString(),
                notes: `Stock returned: Order ${id} moved back to Queue`
              }, ...updatedLogs];
            }
          });
        }

        if (status === 'paid' && order) {
          // E1: Predictive Maintenance Algorithm
          const vehicleHistory = state.serviceOrders
            .filter(o => o.vehicleId === order.vehicleId && o.status === 'paid' && o.id !== id)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

          let nextServiceDays = 120; // Fallback: 4 bulan

          if (vehicleHistory.length > 0) {
            const lastService = vehicleHistory[0];
            const msDiff = new Date(order.createdAt).getTime() - new Date(lastService.createdAt).getTime();
            const daysDiff = Math.floor(msDiff / (1000 * 60 * 60 * 24));
            
            if (daysDiff > 10) {
              nextServiceDays = daysDiff;
            }
          }

          const nextDate = new Date();
          nextDate.setDate(nextDate.getDate() + nextServiceDays);

          updatedCustomers = state.customers.map(c => 
            c.id === order.customer.id 
              ? { ...c, nextServiceDate: nextDate.toISOString() } 
              : c
          );
        }

        return {
          serviceOrders: state.serviceOrders.map((o) => o.id === id ? { ...o, status, startedAt: newStartedAt, completedAt: newCompletedAt } : o),
          customers: updatedCustomers,
          inventory: updatedInventory,
          inventoryLogs: updatedLogs,
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

      deleteServiceOrder: (id) => set((state) => {
        const order = state.serviceOrders.find(o => o.id === id);
        let updatedInventory = [...state.inventory];
        let updatedLogs = [...state.inventoryLogs];
        
        // Return stock if it was already deducted (status is in_progress, completed, or paid)
        if (order && order.status !== 'queued' && order.items) {
          order.items.forEach((item: any) => {
            const invIdx = updatedInventory.findIndex(i => i.name === item.name);
            if (invIdx !== -1) {
              const prev = updatedInventory[invIdx].stock;
              const newStock = prev + (item.qty || 1);
              updatedInventory[invIdx] = { ...updatedInventory[invIdx], stock: newStock };
              updatedLogs = [{
                id: `LOG-SRV-DEL-${Date.now()}-${invIdx}`,
                itemId: updatedInventory[invIdx].id,
                type: 'restock' as const,
                quantity: (item.qty || 1),
                previousStock: prev,
                newStock,
                date: new Date().toISOString(),
                notes: `Stock returned: Order ${id} deleted`
              }, ...updatedLogs];
            }
          });
        }

        return {
          serviceOrders: state.serviceOrders.filter(o => o.id !== id),
          inventory: updatedInventory,
          inventoryLogs: updatedLogs,
          activities: [{
            id: Date.now().toString(),
            type: 'order' as const,
            message: `Pesanan ${id} telah dihapus${order?.status !== 'queued' ? ' (Stok dikembalikan)' : ''}`,
            timestamp: new Date().toISOString()
          }, ...state.activities]
        };
      }),

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
        inventory: state.inventory.map((i) => i.id === id ? { ...i, stock: Math.max(0, i.stock + delta) } : i)
      })),

      updateStock: (id, newStock) => set((state) => ({
        inventory: state.inventory.map((i) => i.id === id ? { ...i, stock: Math.max(0, newStock) } : i)
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

      addSaleTransaction: (trx) => set((state) => {
        // --- Enterprise Integritas: Avoid Double Stock Deduction ---
        // If this transaction is linked to a Service Order, stock was ALREADY deducted 
        // when status became 'in_progress' in `updateServiceOrderStatus`.
        const skipDeduction = !!trx.linkedOrderId;
        
        let updatedInventory = [...state.inventory];
        let updatedLogs = [...state.inventoryLogs];
        
        if (!skipDeduction) {
          trx.items.forEach((item: any) => {
            const invIdx = updatedInventory.findIndex(i => i.name === item.name);
            if (invIdx !== -1) {
              const prev = updatedInventory[invIdx].stock;
              const newStock = Math.max(0, prev - (item.qty || 1));
              updatedInventory[invIdx] = { ...updatedInventory[invIdx], stock: newStock };
              updatedLogs = [{
                id: `LOG-POS-${Date.now()}-${invIdx}`,
                itemId: updatedInventory[invIdx].id,
                type: 'usage' as const,
                quantity: -(item.qty || 1),
                previousStock: prev,
                newStock,
                date: new Date().toISOString(),
                notes: `Terjual via POS (Retail) ${trx.receiptNumber}`
              }, ...updatedLogs];
            }
          });
        }

        return {
          transactions: [trx, ...state.transactions],
          receiptCounter: state.receiptCounter + 1,
          inventory: updatedInventory,
          inventoryLogs: updatedLogs,
          activities: [{
            id: Date.now().toString(),
            type: 'finance',
            message: `Transaksi POS ${trx.receiptNumber} — ${trx.method} ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(trx.total)}`,
            timestamp: new Date().toISOString()
          }, ...state.activities]
        };
      }),

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

      updateCustomer: (customer) => set((state) => ({
        customers: state.customers.map(c => c.id === customer.id ? customer : c)
      })),

      deleteCustomer: (id) => set((state) => ({
        customers: state.customers.filter(c => c.id !== id),
        vehicles: state.vehicles.filter(v => v.customerId !== id),
        serviceOrders: state.serviceOrders.filter(o => o.customer.id !== id),
        activities: [{
          id: Date.now().toString(),
          type: 'customer',
          message: `Pelanggan & data terkait (kendaraan/pesanan) dihapus`,
          timestamp: new Date().toISOString()
        }, ...state.activities]
      })),

      updateVehicle: (vehicle) => set((state) => ({
        vehicles: state.vehicles.map(v => v.id === vehicle.id ? vehicle : v)
      })),

      deleteVehicle: (id) => set((state) => ({
        vehicles: state.vehicles.filter(v => v.id !== id),
        serviceOrders: state.serviceOrders.filter(o => o.vehicle.id !== id),
        activities: [{
          id: Date.now().toString(),
          type: 'customer',
          message: `Kendaraan & riwayat pesanan dihapus`,
          timestamp: new Date().toISOString()
        }, ...state.activities]
      })),

      updateInventoryItem: (item) => set((state) => ({
        inventory: state.inventory.map(i => i.id === item.id ? item : i)
      })),

      deleteInventoryItem: (id) => set((state) => ({
        inventory: state.inventory.filter(i => i.id !== id),
        activities: [{
          id: Date.now().toString(),
          type: 'inventory',
          message: `Item inventaris dihapus`,
          timestamp: new Date().toISOString()
        }, ...state.activities]
      })),
      
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

      loadBackup: (data) => set(() => ({
        ...data
      })),

      pruneArchivedData: (beforeDate: Date) => {
        let archivedOrders: ServiceOrder[] = [];
        let archivedTransactions: Transaction[] = [];
        let archivedExpenses: Expense[] = [];

        set((state) => {
          archivedOrders = state.serviceOrders.filter(o => new Date(o.createdAt) < beforeDate);
          archivedTransactions = state.transactions.filter(t => new Date(t.date) < beforeDate);
          archivedExpenses = state.expenses.filter(e => new Date(e.date) < beforeDate);

          return {
            serviceOrders: state.serviceOrders.filter(o => new Date(o.createdAt) >= beforeDate),
            transactions: state.transactions.filter(t => new Date(t.date) >= beforeDate),
            expenses: state.expenses.filter(e => new Date(e.date) >= beforeDate),
            activities: state.activities.filter(a => new Date(a.timestamp) >= beforeDate),
            payouts: state.payouts.filter(p => new Date(p.date) >= beforeDate),
          };
        });

        return { archivedOrders, archivedTransactions, archivedExpenses };
      },
    }),

    {
      name: 'workshop-storage',
      storage: createJSONStorage(() => idbStorage),
    }
  )
);
