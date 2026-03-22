import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ServiceOrders from "./pages/ServiceOrders";
import Vehicles from "./pages/Vehicles";
import InventoryPage from "./pages/Inventory";
import Customers from "./pages/Customers";
import Settings from "./pages/Settings";
import Mechanics from "./pages/Mechanics";
import POS from "./pages/POS";
import Analytics from "./pages/Analytics";
import Finance from "./pages/Finance";
import Expenses from "./pages/Expenses";
import Notifications from "./pages/Notifications";
import Packages from "./pages/Packages";
import Login from "./pages/Login";
import { CommandPalette } from "./components/ui/CommandPalette";
import { Navigate } from "react-router-dom";

import { ThemeProvider } from "next-themes";
const queryClient = new QueryClient();

import { useEffect } from "react";
import { useAppStore } from "@/hooks/useAppStore";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const session = useAppStore((state) => state.session);
  if (!session) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const App = () => {
  const initializeSupabase = useAppStore((state) => state.initializeSupabase);

  useEffect(() => {
    initializeSupabase();
  }, [initializeSupabase]);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <CommandPalette />
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
              <Route path="/orders" element={<ProtectedRoute><ServiceOrders /></ProtectedRoute>} />
              <Route path="/vehicles" element={<ProtectedRoute><Vehicles /></ProtectedRoute>} />
              <Route path="/inventory" element={<ProtectedRoute><InventoryPage /></ProtectedRoute>} />
              <Route path="/customers" element={<ProtectedRoute><Customers /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              <Route path="/mechanics" element={<ProtectedRoute><Mechanics /></ProtectedRoute>} />
              <Route path="/pos" element={<ProtectedRoute><POS /></ProtectedRoute>} />
              <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
              <Route path="/finance" element={<ProtectedRoute><Finance /></ProtectedRoute>} />
              <Route path="/expenses" element={<ProtectedRoute><Expenses /></ProtectedRoute>} />
              <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
              <Route path="/packages" element={<ProtectedRoute><Packages /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};


export default App;
