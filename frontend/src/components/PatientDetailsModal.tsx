import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ArrowDownToLine, Trash2, FileText, User as UserIcon, Calendar as CalendarIcon } from "lucide-react";
import { getPerfilPaciente, uploadProntuario, downloadProntuario, deleteProntuario, updateUsuario, type PerfilPacienteDTO, type UsuarioDTO } from "@/services/users";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";

export interface PatientDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient: UsuarioDTO | null;
}

export default function PatientDetailsModal({ open, onOpenChange, patient }: PatientDetailsModalProps) {
  const [loading, setLoading] = useState(false);
  const [perfil, setPerfil] = useState<PerfilPacienteDTO | null>(null);
  const [infoAdicionais, setInfoAdicionais] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [savingInfo, setSavingInfo] = useState(false);
  const [searchDate, setSearchDate] = useState<string>("");

  useEffect(() => {
    let active = true;
    async function load() {
      if (!open || !patient) return;
      try {
        setLoading(true);
        const data = await getPerfilPaciente(patient.idUsuario);
        if (!active) return;
        setPerfil(data);
        setInfoAdicionais(data.descricao ?? "");
      } catch (err: any) {
        toast.error("Falha ao carregar perfil do paciente", { description: err?.message });
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, [open, patient?.idUsuario]);

  const ageText = useMemo(() => {
    const dateStr = patient?.dataNasc || perfil?.usuario.dataNasc;
    if (!dateStr) return "-";
    try {
      const birth = parseISO(dateStr);
      const now = new Date();
      let age = now.getFullYear() - birth.getFullYear();
      const m = now.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
      return `${age} anos`;
    } catch { return "-"; }
  }, [patient?.dataNasc, perfil?.usuario.dataNasc]);

  const phoneText = useMemo(() => patient?.numCelular || perfil?.usuario.numCelular || "-", [patient?.numCelular, perfil?.usuario.numCelular]);

  const docs = perfil?.prontuarios ?? [];
  const filteredDocs = useMemo(() => {
    if (!searchDate) return docs;
    // searchDate vem como YYYY-MM-DD
    return docs.filter((d) => (d.dataAtualizacao || "").startsWith(searchDate));
  }, [docs, searchDate]);

  const getStandardName = (indexZeroBased: number, docDisplay?: string) => {
    if (docDisplay) return docDisplay;
    const name = (perfil?.usuario?.nome || patient?.nome || "paciente").trim().replace(/[^a-zA-Z0-9]+/g, "_");
    return `${name}_prt${indexZeroBased + 1}.pdf`;
  };

  const onPickFile = async () => {
    if (!patient) return;
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/pdf";
    input.onchange = async () => {
      const f = input.files?.[0];
      if (!f) return;
      try {
        setUploading(true);
        await uploadProntuario(patient.idUsuario, f);
        toast.success("Prontuário enviado com sucesso");
        // Recarrega perfil para refletir novo documento
        const data = await getPerfilPaciente(patient.idUsuario);
        setPerfil(data);
      } catch (err: any) {
        toast.error("Falha no upload do prontuário", { description: err?.message });
      } finally {
        setUploading(false);
      }
    };
    input.click();
  };

  const onSaveInfo = async () => {
    if (!patient) return;
    try {
      setSavingInfo(true);
      await updateUsuario(patient.idUsuario, { descPaciente: infoAdicionais });
      toast.success("Informações salvas");
      const data = await getPerfilPaciente(patient.idUsuario);
      setPerfil(data);
    } catch (err: any) {
      toast.error("Falha ao salvar informações", { description: err?.message });
    } finally {
      setSavingInfo(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl rounded-xl shadow-xl bg-white supports-[backdrop-filter]:bg-white/90">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900">{patient?.nome ?? "Paciente"}</DialogTitle>
          <DialogDescription className="text-sm text-gray-500">Paciente NV 2</DialogDescription>
        </DialogHeader>

        {/* Cabeçalho com avatar e infos */}
        <div className="flex gap-4 items-start">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="bg-gray-100 text-gray-500">
              <UserIcon className="h-8 w-8" />
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <div className="text-xs text-gray-500">Idade</div>
              <div className="font-semibold" style={{ color: "#0077FF" }}>{ageText}</div>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-gray-500">Telefone</div>
              <div className="font-semibold" style={{ color: "#0077FF" }}>{phoneText}</div>
            </div>
            <div className="md:col-span-2 space-y-1">
              <div className="text-sm text-gray-600">Informações adicionais</div>
              <Textarea
                value={infoAdicionais}
                onChange={(e) => setInfoAdicionais(e.target.value)}
                placeholder="Adicionar observações..."
                className="min-h-[80px] border-gray-200"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Separator className="my-2 flex-1" />
          <div className="ml-4">
            <Button onClick={onSaveInfo} disabled={savingInfo} className="bg-primary-500 hover:bg-primary-600 text-white">
              {savingInfo ? "Salvando..." : "Salvar informações"}
            </Button>
          </div>
        </div>

        {/* Lista de documentos */}
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm font-medium text-gray-700">Documentos</div>
            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-[200px] justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {searchDate
                      ? new Date(searchDate).toLocaleDateString()
                      : "Filtrar por data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="single"
                    selected={searchDate ? new Date(searchDate) : undefined}
                    onSelect={(d) => setSearchDate(d ? d.toISOString().slice(0,10) : "")}
                    captionLayout="dropdown"
                    fromYear={1950}
                    toYear={2100}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {searchDate && (
                <Button variant="ghost" size="sm" onClick={() => setSearchDate("")}>Limpar</Button>
              )}
              <Button variant="secondary" onClick={onPickFile} disabled={uploading}>
                {uploading ? "Enviando..." : "Enviar prontuário (PDF)"}
              </Button>
            </div>
          </div>
          <div className="rounded-lg border border-gray-200 bg-[#F9F9F9]">
            <ScrollArea className="h-64 p-2">
              <div className="space-y-2">
                {loading && (
                  <div className="text-center text-gray-500 text-sm py-6">Carregando...</div>
                )}
                {!loading && filteredDocs.length === 0 && (
                  <div className="text-center text-gray-500 text-sm py-6">Nenhum documento encontrado</div>
                )}
                {!loading && filteredDocs.map((doc, idx) => {
                  const d1 = doc.dataAtualizacao ? (() => { try { return format(parseISO(doc.dataAtualizacao as any), "dd/MM/yyyy HH:mm"); } catch { return "-"; } })() : "-";
                  const d2 = "-"; // Sem createdAt no DTO atual
                  const key = `${(doc as any).idProntuario ?? doc.nomeArquivo}-${doc.dataAtualizacao ?? ""}`;
                  const displayName = getStandardName(idx, (doc as any).displayName);
                  return (
                    <div key={key} className="flex items-center justify-between gap-3 bg-white rounded-md shadow-sm border border-gray-100 p-3 hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-md bg-[#F5F5F5] flex items-center justify-center">
                          <FileText className="h-5 w-5 text-gray-500" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-800 break-all">{displayName}</span>
                          <span className="text-xs text-gray-500">Criado: {d2} • Atualizado: {d1}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={async () => {
                            try {
                              await downloadProntuario((doc as any).idProntuario, displayName);
                            } catch (err: any) {
                              toast.error("Falha no download do prontuário", { description: err?.message });
                            }
                          }}
                          title="Baixar"
                        >
                          <ArrowDownToLine className="h-5 w-5 text-gray-600 hover:opacity-80" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" title="Excluir">
                              <Trash2 className="h-5 w-5 text-red-500 hover:opacity-80" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Excluir prontuário?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta ação não pode ser desfeita. O arquivo será removido definitivamente.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={async () => {
                                  try {
                                    await deleteProntuario((doc as any).idProntuario);
                                    toast.success("Prontuário excluído");
                                    const data = await getPerfilPaciente(patient!.idUsuario);
                                    setPerfil(data);
                                  } catch (err: any) {
                                    toast.error("Falha ao excluir prontuário", { description: err?.message });
                                  }
                                }}
                              >
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
