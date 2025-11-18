import { useEffect, useMemo, useState } from "react";
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
import { type UsuarioDTO, updateUsuario, getPerfilPaciente } from "@/services/users";

type Nivel = "PACIENTE" | "MEDICO" | "ADMINISTRADOR";

export interface EditUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: UsuarioDTO | null;
  onSuccess?: () => void;
}

export default function EditUserModal({ open, onOpenChange, user, onSuccess }: EditUserModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    nome: "",
    email: "",
    nivelAcesso: "PACIENTE" as Nivel,
    descPaciente: "",
    grauSuporte: "", // 1, 2 ou 3 (string para facilitar o Select)
    dataNasc: "",
    pais: "",
    estado: "",
    cidade: "",
    rua: "",
    numCelular: "",
  });

  useEffect(() => {
    async function loadUser() {
      if (user) {
        // Se for paciente, busca o perfil completo para pegar descPaciente e grauSuporte
        if (user.nivelAcesso === "PACIENTE") {
          try {
            const perfil = await getPerfilPaciente(user.idUsuario);
            setForm({
              nome: user.nome || "",
              email: user.email || "",
              nivelAcesso: user.nivelAcesso,
              descPaciente: perfil.descricao || "",
              grauSuporte: perfil.grauSuporte ? String(perfil.grauSuporte) : "",
              dataNasc: user.dataNasc || "",
              pais: user.pais || "",
              estado: user.estado || "",
              cidade: user.cidade || "",
              rua: user.rua || "",
              numCelular: user.numCelular || "",
            });
          } catch (err: any) {
            // Se falhar ao buscar perfil, usa só os dados básicos
            console.error("Erro ao carregar perfil do paciente:", err);
            setForm({
              nome: user.nome || "",
              email: user.email || "",
              nivelAcesso: user.nivelAcesso,
              descPaciente: "",
              grauSuporte: "",
              dataNasc: user.dataNasc || "",
              pais: user.pais || "",
              estado: user.estado || "",
              cidade: user.cidade || "",
              rua: user.rua || "",
              numCelular: user.numCelular || "",
            });
          }
        } else {
          setForm({
            nome: user.nome || "",
            email: user.email || "",
            nivelAcesso: user.nivelAcesso,
            descPaciente: "",
            grauSuporte: "",
            dataNasc: user.dataNasc || "",
            pais: user.pais || "",
            estado: user.estado || "",
            cidade: user.cidade || "",
            rua: user.rua || "",
            numCelular: user.numCelular || "",
          });
        }
      }
    }
    loadUser();
  }, [user]);

  const isPaciente = useMemo(() => form.nivelAcesso === "PACIENTE", [form.nivelAcesso]);
  const setField = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!form.nome || !form.email) {
      toast.error("Preencha nome e email");
      return;
    }
    try {
      setSubmitting(true);
      await updateUsuario(user.idUsuario, {
        nome: form.nome,
        email: form.email,
        nivelAcesso: form.nivelAcesso,
        descPaciente: isPaciente && form.descPaciente ? form.descPaciente : undefined,
        grauSuporte: isPaciente && form.grauSuporte ? parseInt(form.grauSuporte) : undefined,
        dataNasc: form.dataNasc || undefined,
        pais: form.pais || undefined,
        estado: form.estado || undefined,
        cidade: form.cidade || undefined,
        rua: form.rua || undefined,
        numCelular: form.numCelular || undefined,
      });
      toast.success("Usuário atualizado");
      onOpenChange(false);
      onSuccess?.();
    } catch (err: any) {
      toast.error("Falha ao atualizar usuário", { description: err?.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Editar usuário</DialogTitle>
          <DialogDescription>Atualize os dados do usuário selecionado.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nome completo *</Label>
              <Input value={form.nome} onChange={(e) => setField("nome", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Email *</Label>
              <Input type="email" value={form.email} onChange={(e) => setField("email", e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nível de acesso *</Label>
              <Select value={form.nivelAcesso} onValueChange={(v) => setField("nivelAcesso", v)}>
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
              <Label>Telefone</Label>
              <Input value={form.numCelular} onChange={(e) => setField("numCelular", e.target.value)} />
            </div>
          </div>

          {isPaciente && (
            <div className="space-y-2">
              <Label>Descrição do paciente</Label>
              <Textarea value={form.descPaciente} onChange={(e) => setField("descPaciente", e.target.value)} />
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

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2 md:col-span-1">
              <Label>País</Label>
              <Input value={form.pais} onChange={(e) => setField("pais", e.target.value)} />
            </div>
            <div className="space-y-2 md:col-span-1">
              <Label>Estado</Label>
              <Input value={form.estado} onChange={(e) => setField("estado", e.target.value)} />
            </div>
            <div className="space-y-2 md:col-span-1">
              <Label>Cidade</Label>
              <Input value={form.cidade} onChange={(e) => setField("cidade", e.target.value)} />
            </div>
            <div className="space-y-2 md:col-span-1">
              <Label>Data de nascimento</Label>
              <Input type="date" value={form.dataNasc} onChange={(e) => setField("dataNasc", e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Rua</Label>
            <Input value={form.rua} onChange={(e) => setField("rua", e.target.value)} />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Salvando..." : "Salvar alterações"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
