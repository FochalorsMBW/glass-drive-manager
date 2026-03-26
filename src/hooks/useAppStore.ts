import { create } from 'zustand';
import { persist, createJSONStorage, type StateStorage } from 'zustand/middleware';
import { get, set, del } from 'idb-keyval';
import { supabase } from "@/lib/supabase";

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
  
  // Auth State
  session: any | null;
  user: any | null;
  setSession: (session: any) => void;
  signOut: () => Promise<void>;
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
  initializeSupabase: () => Promise<void>;
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
    (set, get) => ({
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

      // Auth
      session: null,
      user: null,
      setSession: (session) => set({ session, user: session?.user ?? null }),
      signOut: async () => {
        await supabase.auth.signOut();
        set({ session: null, user: null });
      },

      initializeSupabase: async () => {
        // Init Auth Listener (Only once)
        if (!(window as any)._supabaseAuthListener) {
          (window as any)._supabaseAuthListener = true;
          supabase.auth.onAuthStateChange((_event, session) => {
            set({ session, user: session?.user ?? null });
            if (session) {
              get().initializeSupabase();
            }
          });
        }

        const { data: { session } } = await supabase.auth.getSession();
        set({ session, user: session?.user ?? null });

        if (!session) return; // Don't fetch data if not logged in

        try {
          const [
            { data: inv },
            { data: cust },
            { data: veh },
            { data: mech },
            { data: orders },
            { data: setts }
          ] = await Promise.all([
            supabase.from('inventory').select('*'),
            supabase.from('customers').select('*'),
            supabase.from('vehicles').select('*'),
            supabase.from('mechanics').select('*'),
            supabase.from('service_orders').select('*'),
            supabase.from('workshop_settings').select('*')
          ]);

          const mappedInventory = (inv || []).map((item: any) => ({
            ...item,
            minThreshold: item.min_threshold,
            costPrice: item.cost_price
          }));

          const mappedCustomers = (cust || []).map((item: any) => ({
            ...item,
            lastVisit: item.last_visit,
            nextServiceDate: item.next_service_date
          }));

          const mappedVehicles = (veh || []).map((item: any) => ({
            ...item,
            plateNumber: item.plate_number,
            engineNumber: item.engine_number,
            customerId: item.customer_id
          }));

          const mappedMechanics = (mech || []).map((item: any) => ({
            ...item,
            activeJobs: item.active_jobs,
            completedJobs: item.completed_jobs,
            totalCommissionPaid: item.total_commission_paid,
            lastPayoutDate: item.last_payout_date
          }));

          const mappedOrders = (orders || []).map((o: any) => {
            const vehicle = mappedVehicles.find(v => v.id === o.vehicle_id);
            const customer = mappedCustomers.find(c => c.id === o.customer_id);
            const mechanic = mappedMechanics.find(m => m.id === o.mechanic_id);

            return {
              ...o,
              vehicleId: o.vehicle_id,
              customerId: o.customer_id,
              mechanicId: o.mechanic_id,
              laborCost: o.labor_cost,
              totalAmount: o.total_amount,
              packageId: o.package_id,
              startedAt: o.started_at,
              completedAt: o.completed_at,
              createdAt: o.created_at,
              vehicle: vehicle || {},
              customer: customer || {},
              mechanic: mechanic || {}
            };
          });

          set({
            inventory: mappedInventory,
            customers: mappedCustomers,
            vehicles: mappedVehicles,
            mechanics: mappedMechanics,
            serviceOrders: mappedOrders
          });

          if (setts && setts.length > 0) {
            const s = setts[0];
            set({ settings: {
              workshopName: s.workshop_name,
              workshopAddress: s.workshop_address,
              workshopPhone: s.workshop_phone,
              workshopLogo: s.workshop_logo,
              currency: s.currency,
              taxRate: s.tax_rate,
              commissionRate: s.commission_rate,
              invoiceTerms: s.invoice_terms,
              waGatewayUrl: s.wa_gateway_url,
              waApiKey: s.wa_api_key
            }});
          }
          
          console.log("Supabase data synced and enriched successfully.");
        } catch (error) {
          console.error("Error initializing Supabase:", error);
        }
      },

      setSearchQuery: (query) => set({ searchQuery: query }),
      
      addServiceOrder: async (order) => {
        set((state) => ({ 
          serviceOrders: [order, ...state.serviceOrders],
          activities: [{
            id: Date.now().toString(),
            type: 'order',
            message: `Pesanan baru ${order.id} dibuat`,
            timestamp: new Date().toISOString()
          }, ...state.activities]
        }));
        
        await supabase.from('service_orders').insert([{
          id: order.id,
          vehicle_id: order.vehicleId,
          customer_id: order.customer.id,
          mechanic_id: order.mechanicId,
          status: order.status,
          description: order.description,
          items: order.items,
          labor_cost: order.laborCost,
          total_amount: order.totalAmount,
          notes: order.notes,
          package_id: order.packageId,
          checklist: order.checklist,
          created_at: order.createdAt
        }]);
      },

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

        const updatedOrders = state.serviceOrders.map((o) => o.id === id ? { ...o, status, startedAt: newStartedAt, completedAt: newCompletedAt } : o);
        
        // Sync status to Supabase
        supabase.from('service_orders').update({ 
          status, 
          started_at: newStartedAt, 
          completed_at: newCompletedAt 
        }).eq('id', id).then();

        return {
          serviceOrders: updatedOrders,
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

      updateServiceChecklist: async (orderId, checklist) => {
        set((state) => ({
          serviceOrders: state.serviceOrders.map(o => o.id === orderId ? { ...o, checklist } : o)
        }));
        await supabase.from('service_orders').update({ checklist }).eq('id', orderId);
      },

      deleteServiceOrder: async (id) => {
        const order = useAppStore.getState().serviceOrders.find(o => o.id === id);
        let updatedInventory = [...useAppStore.getState().inventory];
        
        // Return stock logic
        if (order && order.status !== 'queued' && order.items) {
          order.items.forEach((item: any) => {
            const invIdx = updatedInventory.findIndex(i => i.name === item.name);
            if (invIdx !== -1) {
              const newStock = updatedInventory[invIdx].stock + (item.qty || 1);
              updatedInventory[invIdx] = { ...updatedInventory[invIdx], stock: newStock };
              supabase.from('inventory').update({ stock: newStock }).eq('id', updatedInventory[invIdx].id).then();
            }
          });
        }

        set((state) => ({
          serviceOrders: state.serviceOrders.filter(o => o.id !== id),
          inventory: updatedInventory,
          activities: [{
            id: Date.now().toString(),
            type: 'order' as const,
            message: `Pesanan ${id} telah dihapus${order?.status !== 'queued' ? ' (Stok dikembalikan)' : ''}`,
            timestamp: new Date().toISOString()
          }, ...state.activities]
        }));

        await supabase.from('service_orders').delete().eq('id', id);
      },

      addInventoryItem: async (item) => {
        set((state) => ({ 
          inventory: [...state.inventory, item],
          activities: [{
            id: Date.now().toString(),
            type: 'inventory',
            message: `Item baru ${item.name} ditambahkan ke inventaris`,
            timestamp: new Date().toISOString()
          }, ...state.activities]
        }));
        
        const { error } = await supabase.from('inventory').insert([{
          id: item.id,
          sku: item.sku,
          name: item.name,
          category: item.category,
          stock: item.stock,
          min_threshold: item.minThreshold,
          price: item.price,
          cost_price: item.costPrice,
          supplier: item.supplier,
          unit: item.unit
        }]);

        if (error) console.error("Supabase Error (addInventoryItem):", error.message);
      },

      updateInventoryStock: async (id, delta) => {
        set((state) => ({
          inventory: state.inventory.map((i) => i.id === id ? { ...i, stock: Math.max(0, i.stock + delta) } : i)
        }));
        
        const { data: item } = await supabase.from('inventory').select('stock').eq('id', id).single();
        if (item) {
          await supabase.from('inventory').update({ stock: Math.max(0, item.stock + delta) }).eq('id', id);
        }
      },

      updateStock: async (id, newStock) => {
        set((state) => ({
          inventory: state.inventory.map((i) => i.id === id ? { ...i, stock: Math.max(0, newStock) } : i)
        }));
        
        await supabase.from('inventory').update({ stock: Math.max(0, newStock) }).eq('id', id);
      },

      addCustomer: async (customer) => {
        set((state) => ({ 
          customers: [...state.customers, customer],
          activities: [{
            id: Date.now().toString(),
            type: 'customer',
            message: `Pelanggan baru ${customer.name} terdaftar`,
            timestamp: new Date().toISOString()
          }, ...state.activities]
        }));
        
        const { error } = await supabase.from('customers').insert([{
          id: customer.id,
          name: customer.name,
          phone: customer.phone,
          email: customer.email,
          address: customer.address,
          points: customer.points,
          last_visit: customer.lastVisit,
          next_service_date: customer.nextServiceDate
        }]);

        if (error) console.error("Supabase Error (addCustomer):", error.message);
      },

      addVehicle: async (vehicle) => {
        set((state) => ({ 
          vehicles: [...state.vehicles, vehicle],
          activities: [{
            id: Date.now().toString(),
            type: 'customer',
            message: `Kendaraan ${vehicle.plateNumber} (${vehicle.make}) didaftarkan`,
            timestamp: new Date().toISOString()
          }, ...state.activities]
        }));
        
        const { error } = await supabase.from('vehicles').insert([{
          id: vehicle.id,
          plate_number: vehicle.plateNumber,
          make: vehicle.make,
          model: vehicle.model,
          year: vehicle.year,
          mileage: vehicle.mileage,
          engine_number: vehicle.engineNumber,
          customer_id: vehicle.customerId
        }]);

        if (error) console.error("Supabase Error (addVehicle):", error.message);
      },

      addActivity: (type, message) => set((state) => ({
        activities: [{
          id: Date.now().toString(),
          type,
          message,
          timestamp: new Date().toISOString()
        }, ...state.activities]
      })),

      addExpense: async (expense) => {
        set((state) => ({
          expenses: [...state.expenses, expense],
          activities: [{
            id: Date.now().toString(),
            type: 'finance',
            message: `Pengeluaran baru: ${expense.category} - Rp ${expense.amount.toLocaleString()}`,
            timestamp: new Date().toISOString()
          }, ...state.activities]
        }));
        
        await supabase.from('expenses').insert([expense]);
      },

      deleteExpense: async (id) => {
        set((state) => ({
          expenses: state.expenses.filter(e => e.id !== id)
        }));
        
        await supabase.from('expenses').delete().eq('id', id);
      },

      updateSettings: async (newSettings) => {
        set((state) => ({
          settings: { ...state.settings, ...newSettings }
        }));
        // Since it's a single row, we update by the common ID or just the first row
        const { data } = await supabase.from('workshop_settings').select('id').single();
        if (data) {
          await supabase.from('workshop_settings').update({
            workshop_name: newSettings.workshopName,
            workshop_address: newSettings.workshopAddress,
            workshop_phone: newSettings.workshopPhone,
            workshop_logo: newSettings.workshopLogo,
            currency: newSettings.currency,
            tax_rate: newSettings.taxRate,
            commission_rate: newSettings.commissionRate,
            invoice_terms: newSettings.invoiceTerms,
            wa_gateway_url: newSettings.waGatewayUrl,
            wa_api_key: newSettings.waApiKey
          }).eq('id', data.id);
        }
      },

      addMechanic: async (mechanic) => {
        set((state) => ({
          mechanics: [...state.mechanics, mechanic],
          activities: [{
            id: Date.now().toString(),
            type: 'order',
            message: `Mekanik baru ${mechanic.name} bergabung`,
            timestamp: new Date().toISOString()
          }, ...state.activities]
        }));
        
        const { error } = await supabase.from('mechanics').insert([{
          id: mechanic.id,
          name: mechanic.name,
          avatar: mechanic.avatar,
          specialization: mechanic.specialization,
          active_jobs: mechanic.activeJobs,
          completed_jobs: mechanic.completedJobs,
          rating: mechanic.rating,
          total_commission_paid: mechanic.totalCommissionPaid,
          last_payout_date: mechanic.lastPayoutDate
        }]);

        if (error) console.error("Supabase Error (addMechanic):", error.message);
      },

      updateMechanic: async (mechanic) => {
        set((state) => ({
          mechanics: state.mechanics.map(m => m.id === mechanic.id ? mechanic : m)
        }));
        
        const { error } = await supabase.from('mechanics').update({
          name: mechanic.name,
          avatar: mechanic.avatar,
          specialization: mechanic.specialization,
          active_jobs: mechanic.activeJobs,
          completed_jobs: mechanic.completedJobs,
          rating: mechanic.rating,
          total_commission_paid: mechanic.totalCommissionPaid,
          last_payout_date: mechanic.lastPayoutDate
        }).eq('id', mechanic.id);

        if (error) console.error("Supabase Error (updateMechanic):", error.message);
      },

      deleteMechanic: (id) => set((state) => ({
        mechanics: state.mechanics.filter(m => m.id !== id)
      })),

      processPayout: async (payout) => {
        const mechanic = useAppStore.getState().mechanics.find(m => m.id === payout.mechanicId);
        const amountStr = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(payout.amount);
        
        set((state) => ({
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
        }));

        await supabase.from('payouts').insert([{
          id: payout.id,
          mechanic_id: payout.mechanicId,
          amount: payout.amount,
          order_ids: payout.orderIds,
          date: payout.date
        }]);

        if (mechanic) {
          await supabase.from('mechanics').update({
            total_commission_paid: (mechanic.totalCommissionPaid || 0) + payout.amount,
            last_payout_date: payout.date
          }).eq('id', mechanic.id);
        }
      },

      addTransaction: (amount) => set((state) => {
        const today = new Date().toLocaleDateString('id-ID', { weekday: 'short' });
        const dayLabel = today.charAt(0).toUpperCase() + today.slice(1);
        
        return {
          revenueData: state.revenueData.map(d => 
            d.date === dayLabel ? { ...d, revenue: d.revenue + amount } : d
          )
        };
      }),

      addSaleTransaction: async (trx) => {
        const skipDeduction = !!trx.linkedOrderId;
        let updatedInventory = [...useAppStore.getState().inventory];
        let updatedLogs = [...useAppStore.getState().inventoryLogs];
        
        if (!skipDeduction) {
          trx.items.forEach((item: any) => {
            const invIdx = updatedInventory.findIndex(i => i.name === item.name);
            if (invIdx !== -1) {
              const prev = updatedInventory[invIdx].stock;
              const newStock = Math.max(0, prev - (item.qty || 1));
              updatedInventory[invIdx] = { ...updatedInventory[invIdx], stock: newStock };
              // Sync each item stock change to Supabase
              supabase.from('inventory').update({ stock: newStock }).eq('id', updatedInventory[invIdx].id).then();
            }
          });
        }

        set((state) => ({
          transactions: [trx, ...state.transactions],
          receiptCounter: state.receiptCounter + 1,
          inventory: updatedInventory,
          activities: [{
            id: Date.now().toString(),
            type: 'finance',
            message: `Transaksi POS ${trx.receiptNumber} — ${trx.method} ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(trx.total)}`,
            timestamp: new Date().toISOString()
          }, ...state.activities]
        }));

        const { error } = await supabase.from('transactions').insert([{
          id: trx.id,
          receipt_number: trx.receiptNumber,
          items: trx.items,
          labor_cost: trx.laborCost,
          subtotal: trx.subtotal,
          tax_amount: trx.taxAmount,
          tax_rate: trx.taxRate,
          discount: trx.discount,
          total: trx.total,
          amount_paid: trx.amountPaid,
          change: trx.change,
          method: trx.method,
          customer_name: trx.customerName,
          customer_id: trx.customerId,
          linked_order_id: trx.linkedOrderId,
          date: trx.date
        }]);

        if (error) console.error("Supabase Error (addSaleTransaction):", error.message);
      },

      addLoyaltyPoints: async (customerId, points) => {
        const customer = useAppStore.getState().customers.find(c => c.id === customerId);
        const newPoints = (customer?.points || 0) + points;
        
        set((state) => ({
          customers: state.customers.map(c => 
            c.id === customerId ? { ...c, points: newPoints } : c
          )
        }));

        await supabase.from('customers').update({ points: newPoints }).eq('id', customerId);
      },

      addNotificationLog: async (log) => {
        set((state) => ({ 
          notifications: [log, ...state.notifications] 
        }));
        await supabase.from('notification_logs').insert([{
          id: log.id,
          order_id: log.orderId,
          customer_name: log.customerName,
          type: log.type,
          status: log.status,
          message: log.message,
          timestamp: log.timestamp
        }]);
      },

      addServicePackage: async (pkg) => {
        set((state) => ({
          servicePackages: [...state.servicePackages, pkg]
        }));
        await supabase.from('service_packages').insert([pkg]);
      },

      updateServicePackage: async (pkg) => {
        set((state) => ({
          servicePackages: state.servicePackages.map(p => p.id === pkg.id ? pkg : p)
        }));
        
        const { error } = await supabase.from('service_packages').update({
          name: pkg.name,
          description: pkg.description,
          labor_cost: pkg.laborCost,
          items: pkg.items,
          total_price: pkg.totalPrice
        }).eq('id', pkg.id);

        if (error) console.error("Supabase Error (updateServicePackage):", error.message);
      },

      deleteServicePackage: async (id) => {
        set((state) => ({
          servicePackages: state.servicePackages.filter(p => p.id !== id)
        }));
        await supabase.from('service_packages').delete().eq('id', id);
      },

      restockItem: async (itemId, quantity, notes) => {
        const item = useAppStore.getState().inventory.find(i => i.id === itemId);
        if (!item) return;
        
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

        set((state) => ({
          inventory: state.inventory.map(i => i.id === itemId ? { ...i, stock: newStock } : i),
          inventoryLogs: [log, ...state.inventoryLogs],
          activities: [{
            id: Date.now().toString(),
            type: 'inventory',
            message: `Restock item: ${item.name} (+${quantity})`,
            timestamp: new Date().toISOString()
          }, ...state.activities]
        }));

        await supabase.from('inventory').update({ stock: newStock }).eq('id', itemId);
        await supabase.from('inventory_logs').insert([{
          id: log.id,
          item_id: log.itemId,
          type: log.type,
          quantity: log.quantity,
          previous_stock: log.previousStock,
          new_stock: log.newStock,
          notes: log.notes,
          date: log.date
        }]);
      },

      updateCustomer: async (customer) => {
        set((state) => ({
          customers: state.customers.map(c => c.id === customer.id ? customer : c)
        }));
        
        const { error } = await supabase.from('customers').update({
          name: customer.name,
          phone: customer.phone,
          email: customer.email,
          address: customer.address,
          points: customer.points,
          last_visit: customer.lastVisit,
          next_service_date: customer.nextServiceDate
        }).eq('id', customer.id);

        if (error) console.error("Supabase Error (updateCustomer):", error.message);
      },

      deleteCustomer: async (id) => {
        set((state) => ({
          customers: state.customers.filter(c => c.id !== id),
          vehicles: state.vehicles.filter(v => v.customerId !== id),
          serviceOrders: state.serviceOrders.filter(o => o.customerId !== id),
          activities: [{
            id: Date.now().toString(),
            type: 'customer',
            message: `Pelanggan & data terkait (kendaraan/pesanan) dihapus`,
            timestamp: new Date().toISOString()
          }, ...state.activities]
        }));
        
        await supabase.from('customers').delete().eq('id', id);
      },

      updateVehicle: async (vehicle) => {
        set((state) => ({
          vehicles: state.vehicles.map(v => v.id === vehicle.id ? vehicle : v)
        }));
        
        const { error } = await supabase.from('vehicles').update({
          plate_number: vehicle.plateNumber,
          make: vehicle.make,
          model: vehicle.model,
          year: vehicle.year,
          mileage: vehicle.mileage,
          engine_number: vehicle.engineNumber,
          customer_id: vehicle.customerId
        }).eq('id', vehicle.id);

        if (error) console.error("Supabase Error (updateVehicle):", error.message);
      },

      deleteVehicle: async (id) => {
        set((state) => ({
          vehicles: state.vehicles.filter(v => v.id !== id),
          serviceOrders: state.serviceOrders.filter(o => o.vehicleId !== id),
          activities: [{
            id: Date.now().toString(),
            type: 'customer',
            message: `Kendaraan & riwayat pesanan dihapus`,
            timestamp: new Date().toISOString()
          }, ...state.activities]
        }));
        
        await supabase.from('vehicles').delete().eq('id', id);
      },

      updateInventoryItem: async (item) => {
        set((state) => ({
          inventory: state.inventory.map(i => i.id === item.id ? item : i)
        }));
        
        const { error } = await supabase.from('inventory').update({
          sku: item.sku,
          name: item.name,
          category: item.category,
          stock: item.stock,
          min_threshold: item.minThreshold,
          price: item.price,
          cost_price: item.costPrice,
          supplier: item.supplier,
          unit: item.unit
        }).eq('id', item.id);

        if (error) console.error("Supabase Error (updateInventoryItem):", error.message);
      },

      deleteInventoryItem: async (id) => {
        set((state) => ({
          inventory: state.inventory.filter(i => i.id !== id),
          activities: [{
            id: Date.now().toString(),
            type: 'inventory',
            message: `Item inventaris dihapus`,
            timestamp: new Date().toISOString()
          }, ...state.activities]
        }));
        
        await supabase.from('inventory').delete().eq('id', id);
      },
      
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
