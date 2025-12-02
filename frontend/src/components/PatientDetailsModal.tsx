import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowDownToLine, Trash2, FileText, User as UserIcon, Upload } from "lucide-react";
import { getPerfilPaciente, uploadProntuario, downloadProntuario, deleteProntuario, updateUsuario, type PerfilPacienteDTO, type UsuarioDTO } from "@/services/users";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";

// Categorias fixas do sistema (IDs devem bater com o banco)
const CATEGORIAS = [
  { id: 1, nome: "Exames" },
  { id: 2, nome: "Laudos" },
  { id: 3, nome: "Receituário" },
  { id: 4, nome: "Arquivado" },
];

export interface PatientDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient: UsuarioDTO | null;
}

export default function PatientDetailsModal({ open, onOpenChange, patient }: PatientDetailsModalProps) {
  const [loading, setLoading] = useState(false);
  const [perfil, setPerfil] = useState<PerfilPacienteDTO | null>(null);
  const [infoAdicionais, setInfoAdicionais] = useState<string>("");
  
  // Estados para Upload
  const [uploading, setUploading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("1"); // Default: Exames
  const [docTitle, setDocTitle] = useState("");
  
  const [savingInfo, setSavingInfo] = useState(false);

  // Funções auxiliares para badge do grau de suporte
  const getGrauSuporteColor = (grau: number | null | undefined) => {
    switch (grau) {
      case 1:
        return "bg-green-100 text-green-800 border-green-200";
      case 2:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case 3:
        return "bg-orange-100 text-orange-800 border-orange-200";
      default:
        return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  const getGrauSuporteLabel = (grau: number | null | undefined) => {
    if (!grau) return "Não informado";
    return `Nível ${grau}`;
  };

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
        toast.error("Falha ao carregar perfil", { description: err?.message });
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, [open, patient?.idUsuario]);

  const docs = perfil?.prontuarios ?? [];

  // Agrupa documentos por categoria para exibir no Accordion
  const groupedDocs = useMemo(() => {
    const groups: Record<string, typeof docs> = {};
    CATEGORIAS.forEach(c => groups[c.nome] = []);
    
    docs.forEach(doc => {
      const catName = doc.nomeCategoria || "Sem Categoria";
      if (!groups[catName]) groups[catName] = [];
      groups[catName].push(doc);
    });
    return groups;
  }, [docs]);

  const onPickFile = async () => {
    if (!patient) return;
    if (!docTitle.trim()) {
      toast.error("Digite um título para o documento");
      return;
    }

    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/pdf";
    input.onchange = async () => {
      const f = input.files?.[0];
      if (!f) return;
      try {
        setUploading(true);
        console.log("Iniciando upload:", { 
          pacienteId: patient.idUsuario, 
          arquivo: f.name, 
          tamanho: f.size, 
          categoria: selectedCategory, 
          titulo: docTitle 
        });
        // Envia ID da categoria e Título
        const resultado = await uploadProntuario(patient.idUsuario, f, Number(selectedCategory), docTitle);
        console.log("Upload concluído:", resultado);
        toast.success("Documento salvo");
        setDocTitle(""); // Limpa título
        
        // Recarrega
        const data = await getPerfilPaciente(patient.idUsuario);
        setPerfil(data);
      } catch (err: any) {
        console.error("Erro no upload:", err);
        toast.error("Falha no upload", { description: err?.message });
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
    } catch (err: any) {
      toast.error("Erro ao salvar", { description: err?.message });
    } finally {
      setSavingInfo(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl h-[90vh] flex flex-col p-0 gap-0 bg-white">
        {/* Header Fixo */}
        <div className="p-6 pb-4 border-b">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900 flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary/10 text-primary">
                  <UserIcon className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
              {patient?.nome ?? "Paciente"}
            </DialogTitle>
            <DialogDescription>Prontuário Digital</DialogDescription>
          </DialogHeader>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          {/* Coluna Esquerda: Informações */}
          <div className="w-full md:w-1/3 border-r bg-gray-50 p-4 flex flex-col gap-4 overflow-y-auto">
            <div className="space-y-1">
               <label className="text-xs font-medium text-gray-500 uppercase">Email</label>
               <div className="text-sm truncate" title={patient?.email}>{patient?.email}</div>
            </div>
            <div className="space-y-1">
               <label className="text-xs font-medium text-gray-500 uppercase">Telefone</label>
               <div className="text-sm">{patient?.numCelular || "-"}</div>
            </div>
            
            {/* Novo Bloco */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-500 uppercase">Grau de Suporte</label>
              <Badge className={getGrauSuporteColor(perfil?.grauSuporte)}>
                {getGrauSuporteLabel(perfil?.grauSuporte)}
              </Badge>
            </div>
            <Separator />
            
            <div className="flex-1 flex flex-col gap-2">
              <label className="text-xs font-medium text-gray-500 uppercase">Anotações Clínicas</label>
              <Textarea
                value={infoAdicionais}
                onChange={(e) => setInfoAdicionais(e.target.value)}
                placeholder="Observações sobre o paciente..."
                className="flex-1 min-h-[150px] text-sm resize-none bg-white"
              />
              <Button size="sm" onClick={onSaveInfo} disabled={savingInfo}>
                {savingInfo ? "Salvando..." : "Salvar Notas"}
              </Button>
            </div>
          </div>

          {/* Coluna Direita: Documentos */}
          <div className="flex-1 flex flex-col p-4 bg-white overflow-hidden">
            
            {/* Área de Upload */}
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-4 space-y-3">
              <div className="text-sm font-semibold text-blue-800 flex items-center gap-2">
                <Upload className="w-4 h-4" /> Novo Documento
              </div>
              <div className="flex gap-2">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-[140px] bg-white h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIAS.map(cat => (
                      <SelectItem key={cat.id} value={String(cat.id)}>{cat.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input 
                  className="flex-1 bg-white h-9 text-sm" 
                  placeholder="Título do documento (ex: Raio-X)" 
                  value={docTitle}
                  onChange={e => setDocTitle(e.target.value)}
                />
              </div>
              <Button className="w-full h-8 text-xs" onClick={onPickFile} disabled={uploading}>
                {uploading ? "Enviando..." : "Selecionar Arquivo (PDF) e Salvar"}
              </Button>
            </div>

            {/* Lista de Documentos (Accordion) */}
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Histórico de Arquivos</h3>
            <ScrollArea className="flex-1 pr-2">
              {loading ? (
                <div className="text-center py-10 text-gray-400 text-sm">Carregando documentos...</div>
              ) : (
                <Accordion type="multiple" className="w-full" defaultValue={["Exames", "Laudos"]}>
                  {Object.entries(groupedDocs).map(([categoria, items]) => (
                    <AccordionItem key={categoria} value={categoria} className="border-b-0 mb-2">
                      <AccordionTrigger className="hover:no-underline py-2 px-3 bg-gray-50 rounded-md text-sm font-semibold text-gray-700 data-[state=open]:bg-gray-100">
                        {categoria} <span className="ml-auto text-xs bg-white px-2 py-0.5 rounded-full border text-gray-500">{items.length}</span>
                      </AccordionTrigger>
                      <AccordionContent className="pt-2 pb-4 px-1">
                        {items.length === 0 && <div className="text-xs text-gray-400 italic pl-2">Nenhum documento.</div>}
                        <div className="space-y-2">
                          {items.map((doc) => {
                            const date = doc.dataRegistro ? format(parseISO(doc.dataRegistro), "dd/MM/yy HH:mm") : "-";
                            return (
                              <div key={doc.idRegistro} className="flex items-center gap-2 p-2 rounded-md border hover:bg-gray-50 transition-colors group min-w-0">
                                <div className="h-8 w-8 rounded bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                                  <FileText className="h-4 w-4" />
                                </div>
                                <div className="flex flex-col min-w-0 flex-1 overflow-hidden">
                                  <span className="block w-full text-sm font-medium text-gray-900 truncate" title={doc.tituloDocumento || doc.nomeArquivoOriginal}>
                                    {doc.tituloDocumento || doc.nomeArquivoOriginal}
                                  </span>
                                  <span className="block w-full text-[11px] text-gray-500 truncate" title={`${date} • ${doc.nomeArquivoOriginal}`}>
                                    {date} • {doc.nomeArquivoOriginal}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                  <Button variant="ghost" size="icon" className="h-7 w-7" 
                                    onClick={() => downloadProntuario(doc.idRegistro, doc.nomeArquivoOriginal)}>
                                    <ArrowDownToLine className="h-4 w-4 text-gray-600" />
                                  </Button>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-7 w-7 hover:text-red-600">
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Excluir arquivo?</AlertDialogTitle>
                                        <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                        <AlertDialogAction className="bg-red-600 hover:bg-red-700"
                                          onClick={async () => {
                                            try {
                                              await deleteProntuario(doc.idRegistro);
                                              toast.success("Excluído");
                                              const d = await getPerfilPaciente(patient.idUsuario);
                                              setPerfil(d);
                                            } catch { toast.error("Erro ao excluir"); }
                                          }}>Excluir</AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}