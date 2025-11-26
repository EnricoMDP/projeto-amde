
import { Users, BarChart3, UserCheck, LogOut, CalendarCheck } from "lucide-react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { getAuth } from "@/lib/auth";
import { useAuth } from "@/contexts/AuthContext";

const menuItems = [
  {
    title: "Visão Geral",
    url: "/overview",
    icon: BarChart3,
  },
  {
    title: "Pacientes",
    url: "/patients",
    icon: UserCheck,
  },
  {
    title: "Agendamentos",
    url: "/appointments",
    icon: CalendarCheck,
  },
  {
    title: "Usuários",
    url: "/admin/users",
    icon: Users,
  },
];

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { role } = getAuth();
  const { logout } = useAuth(); // Pega o logout do contexto

  const items = menuItems.filter((item) => {
    if (item.url === "/admin/users") {
      return role === "ADMINISTRADOR"; // somente admin
    }
    if (item.url === "/patients" || item.url === "/appointments") { // <--- Adicione /appointments aqui
      return role === "ADMINISTRADOR" || role === "MEDICO"; // admin e médico
    }
    // visão geral disponível para todos autenticados
    return true;
  });

  const handleLogout = () => {
    logout(); // Usa o logout do AuthContext que atualiza o estado e redireciona
  };

  return (
    <Sidebar className="border-r border-gray-200">
      <SidebarHeader className="border-b border-gray-200 p-4">
        <div className="flex items-center space-x-2">
          <div className="bg-primary-500 p-2 rounded-lg">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-primary-700">AMDE</h2>
            <p className="text-sm text-gray-600">Administração</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-500 font-medium mb-2">
            Menu Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.url}
                    className="w-full"
                  >
                    <Link to={item.url} className="flex items-center space-x-3 p-3 rounded-lg transition-colors">
                      <item.icon className="w-5 h-5" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <div className="mt-auto p-4">
          <Button variant="outline" className="w-full justify-start" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" /> Sair
          </Button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
