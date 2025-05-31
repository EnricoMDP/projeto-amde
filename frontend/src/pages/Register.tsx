
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Eye, EyeOff, User, ArrowLeft, CheckCircle } from "lucide-react";

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  country: string;
  state: string;
  city: string;
  street: string;
  birthDate: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  [key: string]: string;
}

const Register = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    phone: "",
    country: "",
    state: "",
    city: "",
    street: "",
    birthDate: "",
    password: "",
    confirmPassword: ""
  });

  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = () => {
    const newErrors: FormErrors = {};

    // Validações obrigatórias
    if (!formData.fullName) newErrors.fullName = "Nome completo é obrigatório";
    if (!formData.email) newErrors.email = "Email é obrigatório";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email inválido";
    
    if (!formData.phone) newErrors.phone = "Telefone é obrigatório";
    if (!formData.country) newErrors.country = "País é obrigatório";
    if (!formData.state) newErrors.state = "Estado é obrigatório";
    if (!formData.city) newErrors.city = "Cidade é obrigatória";
    if (!formData.street) newErrors.street = "Rua é obrigatória";
    if (!formData.birthDate) newErrors.birthDate = "Data de nascimento é obrigatória";
    
    if (!formData.password) newErrors.password = "Senha é obrigatória";
    else if (formData.password.length < 6) newErrors.password = "Senha deve ter pelo menos 6 caracteres";
    
    if (!formData.confirmPassword) newErrors.confirmPassword = "Confirmação de senha é obrigatória";
    else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Senhas não coincidem";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: undefined });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      console.log("Registration data:", formData);
      setIsSuccess(true);
      
      toast.success("Conta criada com sucesso!", {
        description: "Você será redirecionado para o login em alguns segundos..."
      });

      // Redirecionar para login após 3 segundos
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center shadow-lg border-0 animate-fade-in">
          <CardContent className="pt-6">
            <div className="flex justify-center mb-4">
              <CheckCircle className="w-16 h-16 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Conta Criada com Sucesso!
            </h2>
            <p className="text-medical-gray mb-6">
              Sua conta foi criada com sucesso. Você será redirecionado para a tela de login.
            </p>
            <Button 
              onClick={() => navigate("/login")}
              className="w-full bg-primary-500 hover:bg-primary-600"
            >
              Ir para Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl animate-fade-in">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-primary-500 p-3 rounded-full">
              <User className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-primary-700 mb-2">AMDE</h1>
          <p className="text-medical-gray">Sistema de Gestão Médica</p>
        </div>

        <Card className="shadow-lg border-0">
          <CardHeader className="space-y-1">
            <div className="flex items-center gap-4 mb-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/login")}
                className="p-2 h-8 w-8"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <CardTitle className="text-2xl font-semibold text-gray-900">
                  Criar Conta
                </CardTitle>
                <CardDescription className="text-medical-gray">
                  Preencha os dados para criar sua conta
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nome Completo */}
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">
                  Nome Completo *
                </Label>
                <Input
                  id="fullName"
                  placeholder="Digite seu nome completo"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  className={`h-11 ${errors.fullName ? 'border-red-500' : 'border-gray-300 focus:border-primary-500'}`}
                />
                {errors.fullName && <p className="text-sm text-red-500">{errors.fullName}</p>}
              </div>

              {/* Email e Telefone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`h-11 ${errors.email ? 'border-red-500' : 'border-gray-300 focus:border-primary-500'}`}
                  />
                  {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                    Telefone *
                  </Label>
                  <Input
                    id="phone"
                    placeholder="(11) 99999-9999"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className={`h-11 ${errors.phone ? 'border-red-500' : 'border-gray-300 focus:border-primary-500'}`}
                  />
                  {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
                </div>
              </div>

              {/* País, Estado, Cidade */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="country" className="text-sm font-medium text-gray-700">
                    País *
                  </Label>
                  <Select onValueChange={(value) => handleInputChange('country', value)}>
                    <SelectTrigger className={`h-11 ${errors.country ? 'border-red-500' : 'border-gray-300'}`}>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="brasil">Brasil</SelectItem>
                      <SelectItem value="eua">Estados Unidos</SelectItem>
                      <SelectItem value="portugal">Portugal</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.country && <p className="text-sm text-red-500">{errors.country}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state" className="text-sm font-medium text-gray-700">
                    Estado *
                  </Label>
                  <Input
                    id="state"
                    placeholder="Estado"
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    className={`h-11 ${errors.state ? 'border-red-500' : 'border-gray-300 focus:border-primary-500'}`}
                  />
                  {errors.state && <p className="text-sm text-red-500">{errors.state}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city" className="text-sm font-medium text-gray-700">
                    Cidade *
                  </Label>
                  <Input
                    id="city"
                    placeholder="Cidade"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className={`h-11 ${errors.city ? 'border-red-500' : 'border-gray-300 focus:border-primary-500'}`}
                  />
                  {errors.city && <p className="text-sm text-red-500">{errors.city}</p>}
                </div>
              </div>

              {/* Rua e Data de Nascimento */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="street" className="text-sm font-medium text-gray-700">
                    Rua *
                  </Label>
                  <Input
                    id="street"
                    placeholder="Nome da rua e número"
                    value={formData.street}
                    onChange={(e) => handleInputChange('street', e.target.value)}
                    className={`h-11 ${errors.street ? 'border-red-500' : 'border-gray-300 focus:border-primary-500'}`}
                  />
                  {errors.street && <p className="text-sm text-red-500">{errors.street}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="birthDate" className="text-sm font-medium text-gray-700">
                    Data de Nascimento *
                  </Label>
                  <Input
                    id="birthDate"
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => handleInputChange('birthDate', e.target.value)}
                    className={`h-11 ${errors.birthDate ? 'border-red-500' : 'border-gray-300 focus:border-primary-500'}`}
                  />
                  {errors.birthDate && <p className="text-sm text-red-500">{errors.birthDate}</p>}
                </div>
              </div>

              {/* Senhas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Senha *
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Crie uma senha"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className={`pr-10 h-11 ${errors.password ? 'border-red-500' : 'border-gray-300 focus:border-primary-500'}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-medical-gray hover:text-primary-500 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                    Confirmar Senha *
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirme a senha"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      className={`pr-10 h-11 ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300 focus:border-primary-500'}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-3 text-medical-gray hover:text-primary-500 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword}</p>}
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-primary-500 hover:bg-primary-600 text-white font-medium transition-colors mt-6"
              >
                Criar Conta
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-medical-gray">
                Já tem uma conta?{" "}
                <Link
                  to="/login"
                  className="text-primary-600 hover:text-primary-700 font-medium hover:underline transition-colors"
                >
                  Fazer login
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

export default Register;
