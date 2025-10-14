import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Eye, EyeOff, Mail, User } from "lucide-react";
import axios from "axios"; // Importa o axios

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const navigate = useNavigate(); // Hook para fazer o redirecionamento

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};
    
    if (!email) {
      newErrors.email = "Email é obrigatório";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email inválido";
    }
    
    if (!password) {
      newErrors.password = "Senha é obrigatória";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // --- FUNÇÃO handleSubmit CORRIGIDA ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/api/usuarios/login`;

      try {
        const response = await axios.post(apiUrl, {
          email: email,
          // CORREÇÃO PRINCIPAL: Enviando 'senha' como o backend espera
          senha: password, 
        });

        // Se o login for bem-sucedido (status 200)
        toast.success("Login realizado com sucesso!", {
          description: "Redirecionando para o sistema...",
        });
        
        // Exemplo: Salvar o token e redirecionar
        const { token } = response.data;
        localStorage.setItem("authToken", token); // Salva o token no navegador
        
        // Redireciona para a página principal após um pequeno atraso
        setTimeout(() => {
          navigate("/dashboard"); // ou a rota principal do seu sistema
        }, 1000);

      } catch (error) {
        // CORREÇÃO DO "Unexpected any": Verificamos se o erro é do axios
        if (axios.isAxiosError(error) && error.response) {
          // O backend respondeu com um erro (ex: 401 Unauthorized)
          toast.error("Falha no login", {
            description: error.response.data.message || "Credenciais inválidas. Verifique seu email e senha."
          });
        } else {
          // Erro de rede ou outro problema
          toast.error("Erro de Conexão", {
            description: "Não foi possível conectar ao servidor. Tente novamente mais tarde."
          });
        }
        console.error("Login error:", error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo/Header */}
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
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email *
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-medical-gray" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) {
                        setErrors({ ...errors, email: undefined });
                      }
                    }}
                    className={`pl-10 h-11 ${errors.email ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-primary-500'}`}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-red-500 mt-1">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Senha *
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Digite sua senha"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) {
                        setErrors({ ...errors, password: undefined });
                      }
                    }}
                    className={`pr-10 h-11 ${errors.password ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-primary-500'}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-medical-gray hover:text-primary-500 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-500 mt-1">{errors.password}</p>
                )}
              </div>

              <div className="flex justify-end">
                <Link
                  to="/esqueci-senha"
                  className="text-sm text-primary-600 hover:text-primary-700 hover:underline transition-colors"
                >
                  Esqueceu a senha?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-primary-500 hover:bg-primary-600 text-white font-medium transition-colors"
              >
                Entrar
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-medical-gray">
                Não tem uma conta?{" "}
                <Link
                  to="/cadastro"
                  className="text-primary-600 hover:text-primary-700 font-medium hover:underline transition-colors"
                >
                  Criar conta
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <p className="text-xs text-medical-gray">
            © 2024 AMDE. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;