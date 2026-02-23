import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, HashRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Settings from "./pages/Settings";
import MyRequests from "./pages/MyRequests";
import MyRequestDetail from "./pages/MyRequestDetail";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminSubmissionDetail from "./pages/admin/AdminSubmissionDetail";
import AdminLabels from "./pages/admin/AdminLabels";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminActivity from "./pages/admin/AdminActivity";

const queryClient = new QueryClient();
const Router = import.meta.env.PROD ? HashRouter : BrowserRouter;

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Router>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/my-requests" element={<ProtectedRoute><MyRequests /></ProtectedRoute>} />
            <Route path="/my-requests/:id" element={<ProtectedRoute><MyRequestDetail /></ProtectedRoute>} />
            <Route path="/admin/dashboard" element={<ProtectedRoute requireAdmin><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/submissions/:id" element={<ProtectedRoute requireAdmin><AdminSubmissionDetail /></ProtectedRoute>} />
            <Route path="/admin/labels" element={<ProtectedRoute requireAdmin><AdminLabels /></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute requireAdmin><AdminUsers /></ProtectedRoute>} />
            <Route path="/admin/activity" element={<ProtectedRoute requireAdmin><AdminActivity /></ProtectedRoute>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
