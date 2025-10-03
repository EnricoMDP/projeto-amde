
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import AdminLayout from "./pages/AdminLayout";
import AdminUsers from "./pages/AdminUsers";
import { getAuth, type Role } from "@/lib/auth";
import Patients from "./pages/Patients";
import { ReactNode } from "react";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RedirectIfAuth><Login /></RedirectIfAuth>} />
          <Route path="/login" element={<RedirectIfAuth><Login /></RedirectIfAuth>} />
          <Route path="/cadastro" element={<Register />} />
          {/* Layout protegido para páginas gerais (sem prefixo /admin) */}
          <Route
            element={
              <RequireAuth>
                <AdminLayout />
              </RequireAuth>
            }
          >
            <Route
              path="/overview"
              element={
                <div className="p-6"><h1 className="text-2xl font-bold">Visão Geral</h1><p className="text-gray-600">Em desenvolvimento...</p></div>
              }
            />
            <Route
              path="/patients"
              element={
                <RequireRole roles={["ADMINISTRADOR", "MEDICO"]}>
                  <Patients />
                </RequireRole>
              }
            />
          </Route>

          {/* Somente /admin/users mantém o prefixo /admin */}
          <Route
            path="/admin"
            element={
              <RequireAuth>
                <AdminLayout />
              </RequireAuth>
            }
          >
            <Route
              path="users"
              element={
                <RequireRole roles={["ADMINISTRADOR"]}>
                  <AdminUsers />
                </RequireRole>
              }
            />
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

function RequireAuth({ children }: Readonly<{ children: ReactNode }>) {
  const { token } = getAuth();
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function RequireRole({ roles, children }: Readonly<{ roles: Role[]; children: ReactNode }>) {
  const { token, role } = getAuth();
  if (!token) return <Navigate to="/login" replace />;
  if (!role || !roles.includes(role)) return <Navigate to="/overview" replace />;
  return <>{children}</>;
}

function RedirectIfAuth({ children }: Readonly<{ children: ReactNode }>) {
  const { token } = getAuth();
  if (token) return <Navigate to="/overview" replace />;
  return <>{children}</>;
}
