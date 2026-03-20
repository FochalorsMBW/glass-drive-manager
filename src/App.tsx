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

import { ThemeProvider } from "next-themes";
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/orders" element={<ServiceOrders />} />
            <Route path="/vehicles" element={<Vehicles />} />
            <Route path="/inventory" element={<InventoryPage />} />
            <Route path="/customers" element={<Customers />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/mechanics" element={<Mechanics />} />
            <Route path="/pos" element={<POS />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/finance" element={<Finance />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/packages" element={<Packages />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
