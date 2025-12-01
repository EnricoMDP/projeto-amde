import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom"; // Adicione Outlet
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import AdminLayout from "./pages/AdminLayout";
import AdminUsers from "./pages/AdminUsers";
import Overview from "./pages/Overview";
import { getAuth, type Role } from "@/lib/auth";
import Patients from "./pages/Patients";
import Appointments from "./pages/Appointments";
import { ReactNode } from "react";
import { useAuth } from "./contexts/AuthContext";
import ErrorBoundary from "./components/ErrorBoundary";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Rotas Públicas */}
            <Route path="/login" element={<RedirectIfAuth><Login /></RedirectIfAuth>} />
            <Route path="/cadastro" element={<Register />} />
            <Route path="/" element={<RedirectIfAuth><Login /></RedirectIfAuth>} />

            {/* Rotas Protegidas */}
            <Route element={<RequireAuth><AdminLayout /></RequireAuth>}>
              {/* Todas as rotas aqui dentro requerem login e usam o AdminLayout */}
              
              <Route path="/overview" element={<Overview />} />

              {/* Nova Rota: Agendamentos (Permite Médico e Admin) */}
              <Route element={<RequireRole roles={["ADMINISTRADOR", "MEDICO"]} />}>
                <Route path="/appointments" element={<Appointments />} /> 
              </Route>

              {/* Agrupamento de rotas que requerem papel de MÉDICO ou superior */}
              <Route element={<RequireRole roles={["ADMINISTRADOR", "MEDICO"]} />}>
                <Route path="/patients" element={<Patients />} />
              </Route>

              {/* Agrupamento de rotas que requerem papel de ADMINISTRADOR */}
              <Route element={<RequireRole roles={["ADMINISTRADOR"]} />}>
                <Route path="/admin/users" element={<AdminUsers />} />
              </Route>
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;

// --- COMPONENTES DE PROTEÇÃO ATUALIZADOS ---

function RequireAuth({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

// RequireRole agora renderiza um <Outlet /> para as rotas filhas
function RequireRole({ roles }: { roles: Role[] }) {
  const { isAuthenticated } = useAuth();
  const { role } = getAuth(); // A role vem do token decodificado
  
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  
  if (!role || !roles.includes(role)) {
    // Se não tiver o papel, redireciona para uma página segura (ex: overview)
    return <Navigate to="/overview" replace />;
  }

  // Se passou em todas as verificações, permite o acesso à rota filha
  return <Outlet />;
}

function RedirectIfAuth({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to="/overview" replace />;
  return <>{children}</>;
}