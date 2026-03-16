import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  customers as initialCustomers, 
  mechanics as initialMechanics, 
  vehicles as initialVehicles, 
  inventory as initialInventory, 
  serviceOrders as initialServiceOrders,
  revenueData as initialRevenueData,
  Customer, Mechanic, Vehicle, InventoryItem, ServiceOrder, ServiceStatus
} from '@/lib/mock-data';

interface Activity {
  id: string;
  type: 'order' | 'inventory' | 'customer' | 'payment';
  message: string;
  timestamp: string;
}

interface WorkshopSettings {
  name: string;
  logo: string;
  address: string;
  currency: string;
  taxRate: number;
}

interface AppState {
  customers: Customer[];
  mechanics: Mechanic[];
  vehicles: Vehicle[];
  inventory: InventoryItem[];
  serviceOrders: ServiceOrder[];
  revenueData: { date: string; revenue: number }[];
  activities: Activity[];
  searchQuery: string;
  settings: WorkshopSettings;
  
  // Actions
  setSearchQuery: (query: string) => void;
  updateSettings: (settings: Partial<WorkshopSettings>) => void;
  addServiceOrder: (order: ServiceOrder) => void;
  updateServiceOrder: (orderId: string, updates: Partial<ServiceOrder>) => void;
  updateServiceOrderStatus: (orderId: string, status: ServiceStatus) => void;
  removeServiceOrder: (orderId: string) => void;
  updateInventoryStock: (itemId: string, delta: number) => void;
  addInventoryItem: (item: InventoryItem) => void;
  addTransaction: (amount: number) => void;
  addCustomer: (customer: Customer) => void;
  addVehicle: (vehicle: Vehicle) => void;
  addActivity: (activity: Omit<Activity, 'id' | 'timestamp'>) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      customers: initialCustomers,
      mechanics: initialMechanics,
      vehicles: initialVehicles,
      inventory: initialInventory,
      serviceOrders: initialServiceOrders,
      revenueData: initialRevenueData,
      activities: [
        { id: '1', type: 'order', message: 'Servis SO-892 selesai', timestamp: new Date().toISOString() },
        { id: '2', type: 'inventory', message: 'Oli Shell Helix ditambah 12 botol', timestamp: new Date().toISOString() },
      ],
      searchQuery: '',
      settings: {
        name: "UB Service",
        logo: "/IconUB.png",
        address: "Jl. Veteran No. 1, Malang",
        currency: "Rp",
        taxRate: 11
      },

      setSearchQuery: (query) => set({ searchQuery: query }),
      
      updateSettings: (newSettings) => set((state) => ({ 
        settings: { ...state.settings, ...newSettings } 
      })),

      addServiceOrder: (order) => set((state) => ({
        serviceOrders: [order, ...state.serviceOrders],
        activities: [{ 
          id: Math.random().toString(36).substr(2, 9), 
          type: 'order' as const, 
          message: `Pesanan baru ${order.id} dibuat`, 
          timestamp: new Date().toISOString() 
        }, ...state.activities].slice(0, 10)
      })),

      updateServiceOrder: (orderId, updates) => set((state) => ({
        serviceOrders: state.serviceOrders.map((order) =>
          order.id === orderId ? { ...order, ...updates } : order
        )
      })),

      updateServiceOrderStatus: (orderId, status) => set((state) => {
        const order = state.serviceOrders.find(o => o.id === orderId);
        return {
          serviceOrders: state.serviceOrders.map((o) =>
            o.id === orderId ? { ...o, status } : o
          ),
          activities: [{ 
            id: Math.random().toString(36).substr(2, 9), 
            type: 'order' as const, 
            message: `${orderId} pindah ke status ${status}`, 
            timestamp: new Date().toISOString() 
          }, ...state.activities].slice(0, 10)
        };
      }),

      removeServiceOrder: (orderId) => set((state) => ({
        serviceOrders: state.serviceOrders.filter((order) => order.id !== orderId)
      })),

      updateInventoryStock: (itemId, delta) => set((state) => {
        const item = state.inventory.find(i => i.id === itemId);
        return {
          inventory: state.inventory.map((i) =>
            i.id === itemId ? { ...i, stock: Math.max(0, i.stock + delta) } : i
          ),
          activities: [{ 
            id: Math.random().toString(36).substr(2, 9), 
            type: 'inventory' as const, 
            message: `Stok ${item?.name} ${delta > 0 ? 'bertambah' : 'berkurang'} ${Math.abs(delta)}`, 
            timestamp: new Date().toISOString() 
          }, ...state.activities].slice(0, 10)
        };
      }),

      addInventoryItem: (item) => set((state) => ({
        inventory: [item, ...state.inventory],
        activities: [{ 
          id: Math.random().toString(36).substr(2, 9), 
          type: 'inventory' as const, 
          message: `Suku cadang baru ${item.name} ditambahkan`, 
          timestamp: new Date().toISOString() 
        }, ...state.activities].slice(0, 10)
      })),

      addTransaction: (amount) => set((state) => {
        const today = new Date().toLocaleDateString('id-ID', { weekday: 'short' });
        const dayLabel = today.charAt(0).toUpperCase() + today.slice(1);
        
        const found = state.revenueData.some((d) => d.date === dayLabel);
        const newRevenueData = found 
          ? state.revenueData.map((d) => d.date === dayLabel ? { ...d, revenue: d.revenue + amount } : d)
          : [...state.revenueData, { date: dayLabel, revenue: amount }];

        return { 
          revenueData: newRevenueData,
          activities: [{ 
            id: Math.random().toString(36).substr(2, 9), 
            type: 'payment' as const, 
            message: `Transaksi lunas sebesar Rp ${amount.toLocaleString()}`, 
            timestamp: new Date().toISOString() 
          }, ...state.activities].slice(0, 10)
        };
      }),

      addCustomer: (customer) => set((state) => ({
        customers: [customer, ...state.customers],
        activities: [{ 
          id: Math.random().toString(36).substr(2, 9), 
          type: 'customer' as const, 
          message: `Pelanggan baru ${customer.name} terdaftar`, 
          timestamp: new Date().toISOString() 
        }, ...state.activities].slice(0, 10)
      })),

      addVehicle: (vehicle) => set((state) => ({
        vehicles: [vehicle, ...state.vehicles]
      })),

      addActivity: (activity) => set((state) => ({
        activities: [{ 
          id: Math.random().toString(36).substr(2, 9), 
          ...activity, 
          timestamp: new Date().toISOString() 
        }, ...state.activities].slice(0, 10)
      })),
    }),
    {
      name: 'workshop-storage',
    }
  )
);
