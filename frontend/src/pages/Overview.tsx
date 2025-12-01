import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Calendar, Users, UserCheck, Activity, TrendingUp, Clock } from "lucide-react";
import { getAuth } from "@/lib/auth";
import { toast } from "sonner";
import apiClient from "@/lib/apiClient";
import { format, subDays, startOfMonth, endOfMonth } from "date-fns";

interface DashboardStats {
  totalConsultas: number;
  totalPacientes: number;
  totalProfissionais: number;
  consultasHoje: number;
}

interface ConsultasPorProfissional {
  nomeProfissional: string;
  totalConsultas: number;
  cargo: string;
}

interface ConsultasPorPeriodo {
  data: string;
  total: number;
}

interface EspecialidadeStats {
  especialidade: string;
  total: number;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const PRESET_PERIODS = [
  { label: "Hoje", value: "today" },
  { label: "Últimos 7 dias", value: "7days" },
  { label: "Últimos 30 dias", value: "30days" },
  { label: "Este mês", value: "month" },
];

export default function Overview() {
  const { role } = getAuth();
  const [loading, setLoading] = useState(false);
  
  // Filtros
  const [selectedPeriod, setSelectedPeriod] = useState("30days");
  const [selectedProfessional, setSelectedProfessional] = useState<string>("all");
  const [professionals, setProfessionals] = useState<any[]>([]);
  
  // Dados
  const [stats, setStats] = useState<DashboardStats>({
    totalConsultas: 0,
    totalPacientes: 0,
    totalProfissionais: 0,
    consultasHoje: 0,
  });
  const [consultasPorProfissional, setConsultasPorProfissional] = useState<ConsultasPorProfissional[]>([]);
  const [consultasPorPeriodo, setConsultasPorPeriodo] = useState<ConsultasPorPeriodo[]>([]);
  const [especialidadeStats, setEspecialidadeStats] = useState<EspecialidadeStats[]>([]);

  // Calcula datas baseado no período selecionado
  const getDateRange = () => {
    const now = new Date();
    let startDate, endDate;

    switch (selectedPeriod) {
      case "today":
        startDate = endDate = format(now, "yyyy-MM-dd");
        break;
      case "7days":
        startDate = format(subDays(now, 7), "yyyy-MM-dd");
        endDate = format(now, "yyyy-MM-dd");
        break;
      case "30days":
        startDate = format(subDays(now, 30), "yyyy-MM-dd");
        endDate = format(now, "yyyy-MM-dd");
        break;
      case "month":
        startDate = format(startOfMonth(now), "yyyy-MM-dd");
        endDate = format(endOfMonth(now), "yyyy-MM-dd");
        break;
      default:
        startDate = format(subDays(now, 30), "yyyy-MM-dd");
        endDate = format(now, "yyyy-MM-dd");
    }

    return { startDate, endDate };
  };

  // Buscar profissionais para o filtro
  useEffect(() => {
    async function loadProfessionals() {
      try {
        const { data } = await apiClient.get("/api/usuarios");
        // Garante que data é um array antes de filtrar
        const usuarios = Array.isArray(data) ? data : [];
        const medicos = usuarios.filter((u: any) => u.nivelAcesso === "MEDICO");
        setProfessionals(medicos);
      } catch (err) {
        console.error("Erro ao carregar profissionais:", err);
        setProfessionals([]);
      }
    }
    if (role === "ADMINISTRADOR") {
      loadProfessionals();
    }
  }, [role]);

  // Carregar dados da dashboard
  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const { startDate, endDate } = getDateRange();
      const params: any = { startDate, endDate };
      
      if (selectedProfessional !== "all") {
        params.profissionalId = selectedProfessional;
      }

      // Buscar estatísticas gerais
      const { data: statsData } = await apiClient.get("/api/dashboard/stats", { params });
      setStats(statsData || {
        totalConsultas: 0,
        totalPacientes: 0,
        totalProfissionais: 0,
        consultasHoje: 0,
      });

      // Buscar consultas por profissional
      const { data: profData } = await apiClient.get("/api/dashboard/consultas-por-profissional", { params });
      setConsultasPorProfissional(Array.isArray(profData) ? profData : []);

      // Buscar consultas por período (gráfico de linha)
      const { data: periodoData } = await apiClient.get("/api/dashboard/consultas-por-periodo", { params });
      setConsultasPorPeriodo(Array.isArray(periodoData) ? periodoData : []);

      // Buscar estatísticas por especialidade
      const { data: especData } = await apiClient.get("/api/dashboard/consultas-por-especialidade", { params });
      setEspecialidadeStats(Array.isArray(especData) ? especData : []);

    } catch (err: any) {
      toast.error("Erro ao carregar dashboard", {
        description: err?.response?.data?.message || "Tente novamente mais tarde"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [selectedPeriod, selectedProfessional]);

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Análise e estatísticas da plataforma</p>
        </div>

        {/* Filtros */}
        <div className="flex gap-3 flex-wrap">
          <div className="flex flex-col gap-1.5 min-w-[180px]">
            <Label className="text-sm text-gray-600">Período</Label>
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRESET_PERIODS.map((period) => (
                  <SelectItem key={period.value} value={period.value}>
                    {period.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {role === "ADMINISTRADOR" && (
            <div className="flex flex-col gap-1.5 min-w-[200px]">
              <Label className="text-sm text-gray-600">Profissional</Label>
              <Select value={selectedProfessional} onValueChange={setSelectedProfessional}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os profissionais</SelectItem>
                  {professionals.map((prof) => (
                    <SelectItem key={prof.idUsuario} value={String(prof.idUsuario)}>
                      {prof.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex items-end">
            <Button onClick={loadDashboardData} disabled={loading}>
              {loading ? "Carregando..." : "Atualizar"}
            </Button>
          </div>
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total de Consultas
            </CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.totalConsultas}</div>
            <p className="text-xs text-gray-500 mt-1">No período selecionado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Consultas Hoje
            </CardTitle>
            <Clock className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.consultasHoje}</div>
            <p className="text-xs text-gray-500 mt-1">Agendamentos do dia</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total de Pacientes
            </CardTitle>
            <UserCheck className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.totalPacientes}</div>
            <p className="text-xs text-gray-500 mt-1">Pacientes atendidos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Profissionais Ativos
            </CardTitle>
            <Users className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.totalProfissionais}</div>
            <p className="text-xs text-gray-500 mt-1">Médicos cadastrados</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Consultas por Período */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Consultas ao Longo do Tempo
            </CardTitle>
            <CardDescription>Evolução diária de agendamentos</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={consultasPorPeriodo}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="data" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={2} name="Consultas" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico de Consultas por Especialidade */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-600" />
              Consultas por Especialidade
            </CardTitle>
            <CardDescription>Distribuição por área de atuação</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={especialidadeStats}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ especialidade, percent }) => `${especialidade}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="total"
                >
                  {especialidadeStats.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico de Consultas por Profissional */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-600" />
              Consultas por Profissional
            </CardTitle>
            <CardDescription>Ranking de atendimentos por médico</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={consultasPorProfissional}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="nomeProfissional" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="totalConsultas" fill="#8b5cf6" name="Total de Consultas" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
