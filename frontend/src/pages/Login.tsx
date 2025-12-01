import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Eye, EyeOff, Mail, User } from "lucide-react";
import apiClient from "@/lib/apiClient";
import { AxiosError } from "axios";
import { useAuth } from "@/contexts/AuthContext"; // <-- Importa o hook do nosso novo contexto

const Login = () => {
  const { login } = useAuth(); // <-- Pega a função de login do contexto
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};
    if (!email) newErrors.email = "Email é obrigatório";
    if (!password) newErrors.password = "Senha é obrigatória";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        const response = await apiClient.post<string>("/api/usuarios/login", {
          email: email,
          senha: password,
        });

        // LOG DETALHADO PARA DEBUG
        console.log('=== DEBUG LOGIN ===');
        console.log('Status:', response.status);
        console.log('Headers:', response.headers);
        console.log('Content-Type:', response.headers['content-type']);
        console.log('Tipo do dado:', typeof response.data);
        console.log('Primeiros 200 caracteres da resposta:', String(response.data).substring(0, 200));
        console.log('==================');

        // Limpa o token de espaços, quebras de linha e outros caracteres indesejados
        let token = response.data;
        
        if (typeof token === 'string') {
          token = token.trim();
          
          // Valida formato básico de JWT (3 partes separadas por pontos)
          const jwtParts = token.split('.');
          if (jwtParts.length !== 3) {
            throw new Error("Formato de token inválido");
          }
          
          login(token); // <-- ATUALIZA O ESTADO GLOBAL DE AUTENTICAÇÃO
          
          toast.success("Login realizado com sucesso!", {
            description: "Redirecionando...",
          });
          
          // Navega DEPOIS de atualizar o estado, com 'replace' para não voltar para o login
          navigate("/overview", { replace: true });
        } else {
          throw new Error("Token inválido recebido do servidor.");
        }

      } catch (error) {
        if (error instanceof AxiosError && error.response) {
          toast.error("Falha no login", {
            description: error.response.data.message || "Credenciais inválidas."
          });
        } else {
          toast.error("Erro de Conexão", {
            description: "Não foi possível conectar ao servidor."
          });
        }
        console.error("Login error:", error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-primary-500 p-3 rounded-full">
              <User className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-primary-700 mb-2">AMDE</h1>
          <p className="text-medical-gray">Sistema de Gestão Médica</p>
        </div>

        <Card className="shadow-lg border-0">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-semibold text-gray-900">
              Fazer Login
            </CardTitle>
            <CardDescription className="text-medical-gray">
              Acesse sua conta para continuar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-medical-gray" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-11"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">Senha *</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Digite sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pr-10 h-11"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-medical-gray">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end">
                <Link to="/esqueci-senha" className="text-sm text-primary-600 hover:underline">
                  Esqueceu a senha?
                </Link>
              </div>

              <Button type="submit" className="w-full h-11 bg-primary-500 hover:bg-primary-600">
                Entrar
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;