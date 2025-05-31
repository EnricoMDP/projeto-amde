
import { useState } from "react";
import { Users, Plus, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Dados fictícios para popular a tabela
const usersData = [
  {
    id: "001",
    name: "Dr. João Silva",
    email: "joao.silva@amde.com.br",
    accessLevel: "Administrador",
    birthDate: "15/03/1985",
    country: "Brasil",
    state: "São Paulo",
    city: "São Paulo",
    street: "Rua das Flores, 123",
    phone: "(11) 99999-0001",
  },
  {
    id: "002",
    name: "Dra. Maria Santos",
    email: "maria.santos@amde.com.br",
    accessLevel: "Médico",
    birthDate: "22/07/1990",
    country: "Brasil",
    state: "Rio de Janeiro",
    city: "Rio de Janeiro",
    street: "Av. Copacabana, 456",
    phone: "(21) 99999-0002",
  },
  {
    id: "003",
    name: "Carlos Oliveira",
    email: "carlos.oliveira@amde.com.br",
    accessLevel: "Recepcionista",
    birthDate: "10/12/1988",
    country: "Brasil",
    state: "Minas Gerais",
    city: "Belo Horizonte",
    street: "Rua da Liberdade, 789",
    phone: "(31) 99999-0003",
  },
  {
    id: "004",
    name: "Ana Costa",
    email: "ana.costa@amde.com.br",
    accessLevel: "Enfermeira",
    birthDate: "05/09/1992",
    country: "Brasil",
    state: "Paraná",
    city: "Curitiba",
    street: "Av. Brasil, 321",
    phone: "(41) 99999-0004",
  },
  {
    id: "005",
    name: "Roberto Lima",
    email: "roberto.lima@amde.com.br",
    accessLevel: "Médico",
    birthDate: "18/11/1983",
    country: "Brasil",
    state: "Bahia",
    city: "Salvador",
    street: "Rua do Campo, 654",
    phone: "(71) 99999-0005",
  },
];

const AdminUsers = () => {
  const [users] = useState(usersData);

  const getAccessLevelColor = (level: string) => {
    switch (level) {
      case "Administrador":
        return "bg-red-100 text-red-800";
      case "Médico":
        return "bg-blue-100 text-blue-800";
      case "Enfermeira":
        return "bg-green-100 text-green-800";
      case "Recepcionista":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="bg-primary-100 p-2 rounded-lg">
            <Users className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Usuários</h1>
            <p className="text-gray-600">Gerencie os usuários do sistema</p>
          </div>
        </div>
        <Button className="bg-primary-500 hover:bg-primary-600 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Usuário
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total de Usuários</p>
                <p className="text-2xl font-bold text-gray-900">{users.length}</p>
              </div>
              <Users className="w-8 h-8 text-primary-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Administradores</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(u => u.accessLevel === "Administrador").length}
                </p>
              </div>
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <Users className="w-4 h-4 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Médicos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(u => u.accessLevel === "Médico").length}
                </p>
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="w-4 h-4 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Outros</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(u => !["Administrador", "Médico"].includes(u.accessLevel)).length}
                </p>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Users className="w-4 h-4 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Lista de Usuários</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-semibold text-gray-700">ID</TableHead>
                  <TableHead className="font-semibold text-gray-700">Nome Completo</TableHead>
                  <TableHead className="font-semibold text-gray-700">Email</TableHead>
                  <TableHead className="font-semibold text-gray-700">Nível de Acesso</TableHead>
                  <TableHead className="font-semibold text-gray-700">Data de Nascimento</TableHead>
                  <TableHead className="font-semibold text-gray-700">País</TableHead>
                  <TableHead className="font-semibold text-gray-700">Estado</TableHead>
                  <TableHead className="font-semibold text-gray-700">Cidade</TableHead>
                  <TableHead className="font-semibold text-gray-700">Rua</TableHead>
                  <TableHead className="font-semibold text-gray-700">Celular</TableHead>
                  <TableHead className="font-semibold text-gray-700">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium text-gray-900">{user.id}</TableCell>
                    <TableCell className="font-medium text-gray-900">{user.name}</TableCell>
                    <TableCell className="text-gray-600">{user.email}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAccessLevelColor(user.accessLevel)}`}>
                        {user.accessLevel}
                      </span>
                    </TableCell>
                    <TableCell className="text-gray-600">{user.birthDate}</TableCell>
                    <TableCell className="text-gray-600">{user.country}</TableCell>
                    <TableCell className="text-gray-600">{user.state}</TableCell>
                    <TableCell className="text-gray-600">{user.city}</TableCell>
                    <TableCell className="text-gray-600 max-w-xs truncate">{user.street}</TableCell>
                    <TableCell className="text-gray-600">{user.phone}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUsers;
