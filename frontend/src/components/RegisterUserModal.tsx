import { useMemo, useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { register as registerApi, type RegisterPayload } from "@/services/auth";
import { UFS_BRASILEIRAS, getDataNascimentoMinima, getDataNascimentoMaxima } from "@/lib/constants";

type Nivel = "PACIENTE" | "MEDICO" | "ADMINISTRADOR";

export interface RegisterUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void; // chamado após cadastro com sucesso
}

export default function RegisterUserModal({ open, onOpenChange, onSuccess }: RegisterUserModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    nome: "",
    email: "",
    senha: "",
    confirmarSenha: "",
    nivelAcesso: "PACIENTE" as Nivel,
    cpf: "", // CPF para PACIENTE
    descPaciente: "",
    grauSuporte: "", // 1, 2 ou 3 (string para facilitar o Select)
    crm: "", // CRM para MEDICO
    cargo: "", // Especialidade (MEDICO)
    dataNasc: "",
    pais: "",
    estado: "",
    cidade: "",
    rua: "",
    numCelular: "",
  });

  const isPaciente = useMemo(() => form.nivelAcesso === "PACIENTE", [form.nivelAcesso]);
  const isMedico = useMemo(() => form.nivelAcesso === "MEDICO", [form.nivelAcesso]);

  const setField = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  // Atualiza automaticamente o CRM quando a UF mudar
  useEffect(() => {
    if (form.estado && form.crm) {
      const numeros = form.crm.replace(/\D/g, "");
      const novoCrm = maskCRM(numeros, form.estado);
      if (novoCrm !== form.crm) {
        setField("crm", novoCrm);
      }
    }
  }, [form.estado]);

  // Máscara de CPF: 999.999.999-99
  const maskCPF = (value: string) => {
    const digits = value.replace(/\D/g, "");
    return digits
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})/, "$1-$2")
      .slice(0, 14); // Limita a 14 caracteres (999.999.999-99)
  };

  // Máscara de CRM: apenas números (a UF será concatenada automaticamente)
  const maskCRM = (value: string, uf: string) => {
    // Remove tudo que não é número
    const numeros = value.replace(/\D/g, "");
    
    // Limita a 8 dígitos
    const numerosLimitados = numeros.slice(0, 8);
    
    // Se tem UF selecionada, concatena automaticamente
    if (numerosLimitados && uf) {
      return `${numerosLimitados}/${uf}`;
    }
    
    return numerosLimitados;
  };

  // Máscara de telefone (BR): (99) 99999-9999 ou (99) 9999-9999
  const maskPhoneBR = (value: string) => {
    const digits = value.replace(/\D/g, "");
    if (digits.length <= 10) {
      // (99) 9999-9999
      return digits
        .replace(/(\d{0,2})(\d{0,4})(\d{0,4}).*/, (m, p1, p2, p3) => {
          let out = "";
          if (p1) out = `(${p1}` + (p1.length === 2 ? ") " : "" );
          if (p2) out += p2 + (p2.length === 4 ? "-" : "");
          if (p3) out += p3;
          return out;
        });
    }
    // (99) 99999-9999
    return digits
      .replace(/(\d{0,2})(\d{0,5})(\d{0,4}).*/, (m, p1, p2, p3) => {
        let out = "";
        if (p1) out = `(${p1}` + (p1.length === 2 ? ") " : "" );
        if (p2) out += p2 + (p2.length === 5 ? "-" : "");
        if (p3) out += p3;
        return out;
      });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validações obrigatórias
    if (!form.nome) return toast.error("Nome é obrigatório");
    if (!form.email) return toast.error("Email é obrigatório");
    if (!/\S+@\S+\.\S+/.test(form.email)) return toast.error("Email inválido");
    if (!form.senha) return toast.error("Senha é obrigatória");
    if (form.senha.length < 6) {
      toast.error("Senha deve ter pelo menos 6 caracteres");
      return;
    }
    if (form.senha !== form.confirmarSenha) {
      toast.error("Senhas não coincidem");
      return;
    }
    if (!form.nivelAcesso) return toast.error("Nível de acesso é obrigatório");
    if (!form.numCelular) return toast.error("Telefone é obrigatório");
    if (!form.pais) return toast.error("País é obrigatório");
    if (!form.estado) return toast.error("Estado (UF) é obrigatório");
    if (!form.cidade) return toast.error("Cidade é obrigatória");
    if (!form.dataNasc) return toast.error("Data de nascimento é obrigatória");
    if (!form.rua) return toast.error("Rua é obrigatória");

    const payload: RegisterPayload = {
      nome: form.nome,
      email: form.email,
      senha: form.senha,
      nivelAcesso: form.nivelAcesso,
      cpf: (isPaciente && form.cpf) ? form.cpf : undefined,
      descPaciente: isPaciente && form.descPaciente ? form.descPaciente : undefined,
      grauSuporte: isPaciente && form.grauSuporte ? parseInt(form.grauSuporte) : undefined,
      crm: (isMedico && form.crm) ? form.crm : undefined,
      cargo: isMedico && form.cargo ? form.cargo : undefined,
      dataNasc: form.dataNasc || undefined,
      pais: form.pais || undefined,
      estado: form.estado || undefined,
      cidade: form.cidade || undefined,
      rua: form.rua || undefined,
      numCelular: form.numCelular || undefined,
    };

    try {
      setSubmitting(true);
      await registerApi(payload);
      toast.success("Usuário criado com sucesso");
      onOpenChange(false);
      onSuccess?.();
      // limpa formulário ao fechar
      setForm({
        nome: "",
        email: "",
        senha: "",
        confirmarSenha: "",
        nivelAcesso: "PACIENTE",
        cpf: "",
        descPaciente: "",
        grauSuporte: "",
        crm: "",
        cargo: "",
        dataNasc: "",
        pais: "",
        estado: "",
        cidade: "",
        rua: "",
        numCelular: "",
      });
    } catch (err: unknown) {
      toast.error("Falha ao criar usuário", { description: err instanceof Error ? err.message : "Erro desconhecido" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Novo usuário</DialogTitle>
          <DialogDescription>Preencha os dados para cadastrar um novo usuário.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nome completo *</Label>
              <Input value={form.nome} required onChange={(e) => setField("nome", e.target.value)} placeholder="Nome e sobrenome" />
            </div>
            <div className="space-y-2">
              <Label>Email *</Label>
              <Input type="email" required value={form.email} onChange={(e) => setField("email", e.target.value)} placeholder="email@dominio.com" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Senha *</Label>
              <Input type="password" required value={form.senha} onChange={(e) => setField("senha", e.target.value)} placeholder="Crie uma senha" />
            </div>
            <div className="space-y-2">
              <Label>Confirmar senha *</Label>
              <Input type="password" required value={form.confirmarSenha} onChange={(e) => setField("confirmarSenha", e.target.value)} placeholder="Confirme a senha" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nível de acesso *</Label>
              {/* Select não suporta required nativo; validamos no submit */}
              <Select value={form.nivelAcesso} onValueChange={(v) => setField("nivelAcesso", v as Nivel)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PACIENTE">Paciente</SelectItem>
                  <SelectItem value="MEDICO">Médico</SelectItem>
                  <SelectItem value="ADMINISTRADOR">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Telefone *</Label>
              <Input required value={form.numCelular} onChange={(e) => setField("numCelular", maskPhoneBR(e.target.value))} placeholder="(11) 99999-9999" />
            </div>
          </div>

          {isPaciente && (
            <div className="space-y-2">
              <Label>Descrição do paciente</Label>
              <Textarea value={form.descPaciente} onChange={(e) => setField("descPaciente", e.target.value)} placeholder="Condição, observações, etc." />
            </div>
          )}

          {isPaciente && (
            <div className="space-y-2">
              <Label>Grau de suporte (TEA)</Label>
              <Select value={form.grauSuporte} onValueChange={(v) => setField("grauSuporte", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o nível de suporte" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Nível 1 - Requer apoio</SelectItem>
                  <SelectItem value="2">Nível 2 - Requer apoio substancial</SelectItem>
                  <SelectItem value="3">Nível 3 - Requer apoio muito substancial</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {isPaciente && (
            <div className="space-y-2">
              <Label>CPF</Label>
              <Input 
                value={form.cpf} 
                onChange={(e) => setField("cpf", maskCPF(e.target.value))} 
                placeholder="000.000.000-00" 
                maxLength={14}
              />
            </div>
          )}

          {isMedico && (
            <div className="space-y-2">
              <Label>CRM (apenas números)</Label>
              <Input 
                value={form.crm} 
                onChange={(e) => setField("crm", maskCRM(e.target.value, form.estado))} 
                placeholder={form.estado ? `Digite apenas os números (ex: 123456 → 123456/${form.estado})` : "Selecione a UF primeiro"} 
                maxLength={11}
                disabled={!form.estado}
              />
              {form.estado && form.crm && (
                <p className="text-xs text-muted-foreground">
                  CRM completo: <span className="font-semibold">{form.crm}</span>
                </p>
              )}
            </div>
          )}

          {isMedico && (
            <div className="space-y-2">
              <Label>Especialidade Médica</Label>
              <Input
                value={form.cargo}
                onChange={(e) => setField("cargo", e.target.value)}
                placeholder="Ex: Cardiologista, Pediatra, Neurologista..."
              />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2 md:col-span-1">
              <Label>País *</Label>
              <Input required value={form.pais} onChange={(e) => setField("pais", e.target.value)} placeholder="Brasil" />
            </div>
            <div className="space-y-2 md:col-span-1">
              <Label>Estado (UF) *</Label>
              <Select value={form.estado} onValueChange={(v) => setField("estado", v)} required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a UF" />
                </SelectTrigger>
                <SelectContent>
                  {UFS_BRASILEIRAS.map((uf) => (
                    <SelectItem key={uf.value} value={uf.value}>
                      {uf.value} - {uf.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 md:col-span-1">
              <Label>Cidade *</Label>
              <Input required value={form.cidade} onChange={(e) => setField("cidade", e.target.value)} placeholder="São Paulo" />
            </div>
            <div className="space-y-2 md:col-span-1">
              <Label>Data de nascimento *</Label>
              <Input 
                type="date" 
                required 
                value={form.dataNasc} 
                onChange={(e) => setField("dataNasc", e.target.value)} 
                min={getDataNascimentoMinima()}
                max={getDataNascimentoMaxima()}
              />
              <p className="text-xs text-muted-foreground">
                Entre 150 anos e 6 meses atrás (apenas datas passadas)
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Rua *</Label>
            <Input required value={form.rua} onChange={(e) => setField("rua", e.target.value)} placeholder="Rua, número e complemento" />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Salvando..." : "Criar usuário"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
