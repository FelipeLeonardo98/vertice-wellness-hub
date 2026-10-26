"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { jsPDF } from "jspdf";
import {
  Activity, Archive, BriefcaseBusiness, CalendarDays, ChevronLeft, ChevronRight,
  Download, FileSignature, FileText, LayoutDashboard, Mail, MoreHorizontal,
  Building2, Camera, CheckCircle2, ClipboardCheck, Clock3, HeartPulse, MapPin, MessageCircle, Plus, Search, Settings, ShieldCheck, Sparkles, UserRound, Users, WalletCards,
} from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { SignatureSync, fetchSignature } from "@/components/signature-sync";
import { CrmOpportunities, RelationshipEditor, RelationshipFields, relationshipFromForm } from "@/components/crm-opportunities";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent,
  SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarProvider, SidebarTrigger,
} from "@/components/ui/sidebar";
import { activity, clients, contracts as initialContracts, services, workEngagements, type Client, type Contract, type ContractStatus, type EntityType, type WorkEngagement, type WorkType } from "@/lib/fitness-data";

type View = "dashboard" | "clients" | "profile" | "portfolio" | "finance";
type HealthDocumentType = "anamnesis" | "parq";
type ProfessionalProfile = { name: string; email: string; profession: string; registration: string; registrationState: string; mainOrganization: string; specialties: string };
type WorkspaceMode = "demo" | "personal";
const demoProfessional: ProfessionalProfile = { name: "Rafael Costa", email: "rafael@exemplo.com", profession: "Personal trainer", registration: "CREF 000000-G/SP", registrationState: "SP", mainOrganization: "Profissional autônomo", specialties: "Musculação, funcional e corrida" };
const storageKeys = {
  mode: "vertice-workspace-mode",
  profile: "vertice-personal-profile",
  clients: "vertice-personal-clients",
  contracts: "vertice-personal-contracts",
  work: "vertice-personal-work-engagements",
};
const personCategories = ["Aluno de personal", "Paciente de fisioterapia", "Atleta de corrida", "Cliente híbrido"];
const organizationCategories = ["Academia", "Estúdio", "Assessoria de corrida", "Condomínio", "Empresa"];

const navigation = [
  { view: "dashboard" as View, label: "Visão geral", icon: LayoutDashboard },
  { view: "clients" as View, label: "Alunos e parceiros", icon: Users },
  { label: "Agenda", icon: CalendarDays },
  { view: "portfolio" as View, label: "Locais e aulas", icon: BriefcaseBusiness },
  { view: "finance" as View, label: "Financeiro", icon: WalletCards },
  { view: "finance" as View, label: "Contratos", icon: FileText, contracts: true },
];

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
const optionalAmount = (value?: number) => value === undefined ? "A combinar" : brl.format(value);

function whatsappPhone(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits.length === 10 || digits.length === 11 ? `55${digits}` : digits;
}

function openWhatsAppReminder(client: Client, kind: "appointment" | "payment" | "document" = "appointment") {
  const useSupport = Boolean(client.supportReceivesBilling && client.supportPhone);
  const phone = whatsappPhone(useSupport ? client.supportPhone! : client.phone);
  if (!phone) return toast.error("Cadastre um telefone para preparar o lembrete");
  const recipient = useSupport ? client.supportName || "responsável" : client.name.split(" ")[0];
  const messages = {
    appointment: `Olá, ${recipient}! Passando para lembrar o próximo atendimento de ${client.name}: ${client.nextAppointment}. Se precisar ajustar, me avise por aqui.`,
    payment: `Olá, ${recipient}! Este é um lembrete sobre o pagamento do acompanhamento de ${client.name}. Se já estiver tudo certo, desconsidere esta mensagem.`,
    document: `Olá, ${recipient}! Precisamos preencher e assinar os documentos de saúde de ${client.name} antes de avançarmos com o acompanhamento.`,
  };
  window.open(`https://wa.me/${phone}?text=${encodeURIComponent(messages[kind])}`, "_blank", "noopener,noreferrer");
  toast.success("WhatsApp aberto com a mensagem pronta; revise e toque em enviar");
}

async function readPhoto(file: File | null) {
  if (!file || !file.size) return undefined;
  if (file.size > 5_000_000) throw new Error("Escolha uma foto com até 5 MB");
  const source = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Não foi possível ler a foto"));
    reader.readAsDataURL(file);
  });
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const element = new Image();
    element.onload = () => resolve(element);
    element.onerror = () => reject(new Error("Formato de foto inválido"));
    element.src = source;
  });
  const size = 360;
  const canvas = document.createElement("canvas");
  canvas.width = size; canvas.height = size;
  const context = canvas.getContext("2d");
  if (!context) return source;
  const crop = Math.min(image.width, image.height);
  context.drawImage(image, (image.width - crop) / 2, (image.height - crop) / 2, crop, crop, 0, 0, size, size);
  return canvas.toDataURL("image/jpeg", 0.78);
}

function createContractPdf(contract: Contract, client: Client | undefined) {
  const pdf = new jsPDF();
  const margin = 20;
  const line = (text: string, y: number, options?: { bold?: boolean; size?: number }) => {
    pdf.setFont("helvetica", options?.bold ? "bold" : "normal");
    pdf.setFontSize(options?.size ?? 10);
    const wrapped = pdf.splitTextToSize(text, 170);
    pdf.text(wrapped, margin, y);
    return y + wrapped.length * 5;
  };
  pdf.setFillColor(16, 45, 41); pdf.rect(0, 0, 210, 34, "F");
  pdf.setTextColor(255, 255, 255); pdf.setFont("helvetica", "bold"); pdf.setFontSize(19); pdf.text("VÉRTICE", margin, 17);
  pdf.setFont("helvetica", "normal"); pdf.setFontSize(9); pdf.text("Fitness Professional OS · Contratos", margin, 24);
  pdf.setTextColor(24, 48, 45);
  let y = 49;
  y = line(contract.template.toUpperCase(), y, { bold: true, size: 14 }) + 5;
  y = line(`CONTRATANTE: ${contract.client}${client?.document ? `, documento ${client.document}` : ""}.`, y) + 3;
  if (client?.supportName) y = line(`RESPONSÁVEL/CONTATO DE APOIO: ${client.supportName}, ${client.supportRelationship || "vínculo não informado"}, telefone ${client.supportPhone || "não informado"}.`, y) + 3;
  y = line(`CONTRATADO: ${contract.professionalName ?? "Rafael Costa"}, profissional responsável pelos serviços descritos neste instrumento.`, y) + 8;
  y = line("1. OBJETO", y, { bold: true, size: 11 });
  y = line(`Prestação de serviços de ${contract.service}, conforme plano de atendimento, agenda e orientações técnicas acordadas entre as partes.`, y) + 6;
  y = line("2. VALOR, COBRANÇA E VIGÊNCIA", y, { bold: true, size: 11 });
  y = line(`Valor contratado: ${brl.format(contract.amount)}. Forma de cobrança: ${contract.billingMode || "não informada"}. Vigência de ${contract.startDate} a ${contract.endDate}.`, y) + 3;
  if (contract.frequency || contract.schedule) y = line(`Frequência: ${contract.frequency || "não informada"}. Dias e horários: ${contract.schedule || "não informados"}.`, y) + 3;
  y = line("3. CANCELAMENTO", y, { bold: true, size: 11 });
  y = line(contract.cancellationPolicy, y) + 6;
  y = line("4. CONDIÇÕES ESPECÍFICAS", y, { bold: true, size: 11 });
  y = line(contract.customTerms || "Nenhuma condição específica adicional foi registrada para este contrato.", y) + 6;
  y = line("5. RESPONSABILIDADES", y, { bold: true, size: 11 });
  y = line("O contratante declara que as informações cadastrais e de saúde fornecidas são verdadeiras e se compromete a comunicar qualquer alteração relevante. O contratado prestará o serviço dentro de seu escopo profissional e manterá o registro do acompanhamento.", y) + 10;
  pdf.setDrawColor(220, 229, 227); pdf.line(margin, y, 190, y); y += 9;
  y = line("ASSINATURA ELETRÔNICA", y, { bold: true, size: 11 });
  if (contract.status === "Assinado") {
    y = line(`Assinado por ${contract.signerName ?? contract.client} · Documento: ${contract.signerDocument ?? client?.document ?? "não informado"}`, y);
    y = line(`Data e hora: ${contract.signedAt ?? "registro importado"} · Evidência: ${contract.evidenceId ?? `VTX-${contract.id}-LEGADO`}`, y);
    y = line("Aceite registrado eletronicamente no MVP Vértice.", y);
  } else {
    y = line("Documento ainda não assinado. O aceite será registrado com nome, documento, data, hora e código de evidência.", y);
  }
  y += 10;
  pdf.setFillColor(244, 247, 246); pdf.roundedRect(margin, y, 170, 24, 3, 3, "F");
  pdf.setTextColor(80, 101, 96); pdf.setFontSize(8); pdf.text(pdf.splitTextToSize("MVP: este registro demonstra o fluxo de assinatura eletrônica. Para operação comercial com requisitos jurídicos e trilha de auditoria avançada, integre um provedor especializado.", 158), margin + 6, y + 8);
  pdf.setTextColor(24, 48, 45); pdf.setFontSize(8); pdf.text(`Contrato #${contract.id} · gerado em ${new Date().toLocaleString("pt-BR")}`, margin, 286);
  const fileName = `contrato-${contract.client.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-")}.pdf`;
  return { pdf, fileName };
}

async function generateContractPdf(contract: Contract, client: Client | undefined, mode: "open" | "download" = "download") {
  if (contract.zapSignDocumentToken && contract.zapSignSignerToken) {
    const tab = window.open("about:blank", "_blank");
    if (tab) tab.opener = null;
    try {
      const result = await fetchSignature(contract);
      if (result.signedPdfUrl) {
        if (tab) tab.location.href = result.signedPdfUrl;
        else toast.error("Permita abrir uma nova aba para visualizar o PDF assinado.");
        return;
      }
      tab?.close();
      toast.info("As assinaturas ainda não foram concluídas. Este é o PDF original, sem assinaturas.");
    } catch (error) { tab?.close(); toast.error(error instanceof Error ? error.message : "PDF indisponível"); return; }
  }
  const { pdf, fileName } = createContractPdf(contract, client);
  if (mode === "open") window.open(URL.createObjectURL(pdf.output("blob")), "_blank", "noopener,noreferrer");
  else pdf.save(fileName);
}

function generateHealthPdf(client: Client, type: HealthDocumentType) {
  const pdf = new jsPDF();
  const title = type === "parq" ? "PAR-Q — Prontidão para Atividade Física" : "Ficha de Anamnese";
  pdf.setFillColor(16, 45, 41); pdf.rect(0, 0, 210, 34, "F");
  pdf.setTextColor(255, 255, 255); pdf.setFont("helvetica", "bold"); pdf.setFontSize(19); pdf.text("VÉRTICE", 20, 17);
  pdf.setFont("helvetica", "normal"); pdf.setFontSize(9); pdf.text("Fitness Professional OS · Saúde e segurança", 20, 24);
  pdf.setTextColor(24, 48, 45); pdf.setFont("helvetica", "bold"); pdf.setFontSize(15); pdf.text(title, 20, 50);
  pdf.setFont("helvetica", "normal"); pdf.setFontSize(10);
  const details = [
    `Pessoa atendida: ${client.name}`,
    `Idade: ${client.age || "não informada"}`,
    `Contato: ${client.phone || "não informado"}`,
    client.supportName ? `Responsável/apoio: ${client.supportName} · ${client.supportRelationship || "vínculo não informado"} · ${client.supportPhone || "telefone não informado"}` : "",
    `Serviço: ${client.service}`,
    `Restrições informadas: ${client.restrictions || "nenhuma informada"}`,
  ].filter(Boolean);
  let y = 64;
  for (const detail of details) { const lines = pdf.splitTextToSize(detail, 170); pdf.text(lines, 20, y); y += lines.length * 6; }
  y += 5;
  pdf.setFont("helvetica", "bold"); pdf.text(type === "parq" ? "Declaração de prontidão" : "Declaração de informações de saúde", 20, y); y += 8;
  pdf.setFont("helvetica", "normal");
  const body = type === "parq"
    ? "A pessoa respondeu ao questionário de prontidão para atividade física. Respostas positivas devem ser avaliadas pelo profissional e podem indicar a necessidade de orientação médica antes de aumentar o nível de atividade."
    : "A pessoa declara que as informações de saúde, histórico, medicamentos, lesões, objetivos e contatos fornecidos são verdadeiras e se compromete a comunicar alterações relevantes.";
  const bodyLines = pdf.splitTextToSize(body, 170); pdf.text(bodyLines, 20, y); y += bodyLines.length * 6 + 10;
  pdf.setDrawColor(210, 222, 219); pdf.line(20, y, 190, y); y += 10;
  pdf.setFont("helvetica", "bold"); pdf.text("ASSINATURA ELETRÔNICA — MVP", 20, y); y += 7;
  pdf.setFont("helvetica", "normal"); pdf.text(`Assinado em: ${client.healthDocumentSignedAt || "registro de demonstração"}`, 20, y); y += 6;
  pdf.text(`Signatário: ${client.supportName || client.name}`, 20, y); y += 12;
  pdf.setFontSize(8); pdf.setTextColor(80, 101, 96);
  pdf.text(pdf.splitTextToSize("Este documento apoia a triagem e o registro do atendimento, mas não substitui diagnóstico, avaliação ou atestado médico quando exigidos.", 170), 20, y);
  pdf.save(`${type}-${client.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-")}.pdf`);
}

const tone: Record<string, string> = {
  "Ativo": "bg-emerald-50 text-emerald-700 border-emerald-200", "Pago": "bg-emerald-50 text-emerald-700 border-emerald-200", "Assinado": "bg-emerald-50 text-emerald-700 border-emerald-200", "Saudável": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Atrasado": "bg-red-50 text-red-700 border-red-200", "Em risco": "bg-red-50 text-red-700 border-red-200", "Expirado": "bg-red-50 text-red-700 border-red-200",
  "Pendente": "bg-amber-50 text-amber-700 border-amber-200", "Atenção": "bg-amber-50 text-amber-700 border-amber-200", "Aguardando assinatura": "bg-amber-50 text-amber-700 border-amber-200", "Enviado": "bg-blue-50 text-blue-700 border-blue-200",
  "Teste": "bg-violet-50 text-violet-700 border-violet-200", "Pausado": "bg-slate-100 text-slate-700 border-slate-200", "Inativo": "bg-slate-100 text-slate-600 border-slate-200", "Concluído": "bg-blue-50 text-blue-700 border-blue-200", "Rascunho": "bg-slate-100 text-slate-600 border-slate-200", "Sem contrato": "bg-slate-50 text-slate-600 border-slate-200", "Cancelado": "bg-slate-100 text-slate-500 border-slate-200",
};

function StatusBadge({ children }: { children: string }) {
  return <Badge variant="outline" className={`whitespace-nowrap font-medium ${tone[children] ?? "bg-slate-50"}`}>{children}</Badge>;
}

export default function Home() {
  const [view, setView] = useState<View>("dashboard");
  const [financeTab, setFinanceTab] = useState("payments");
  const [selectedId, setSelectedId] = useState(1);
  const [clientData, setClientData] = useState<Client[]>(clients);
  const [contractData, setContractData] = useState<Contract[]>(initialContracts);
  const [workData, setWorkData] = useState<WorkEngagement[]>(workEngagements);
  const [professionalProfile, setProfessionalProfile] = useState<ProfessionalProfile>(demoProfessional);
  const [workspaceMode, setWorkspaceMode] = useState<WorkspaceMode>("demo");
  const [profileOpen, setProfileOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [contractOpen, setContractOpen] = useState(false);
  const [workOpen, setWorkOpen] = useState(false);
  const [signatureContractId, setSignatureContractId] = useState<number | null>(null);
  const [healthDocument, setHealthDocument] = useState<{ clientId: number; type: HealthDocumentType } | null>(null);
  const [sendingContractId, setSendingContractId] = useState<number | null>(null);
  const [zapSignConfigured, setZapSignConfigured] = useState(false);
  const [didLoad, setDidLoad] = useState(false);

  useEffect(() => {
    const parse = <T,>(value: string | null, fallback: T): T => {
      try { return value ? JSON.parse(value) as T : fallback; } catch { return fallback; }
    };
    const mode = window.localStorage.getItem(storageKeys.mode) as WorkspaceMode | null;
    const personalProfile = parse<ProfessionalProfile | null>(window.localStorage.getItem(storageKeys.profile), null);
    const legacyProfile = parse<ProfessionalProfile | null>(window.localStorage.getItem("vertice-professional-profile"), null);
    const savedProfile = personalProfile?.name ? { ...personalProfile, email: personalProfile.email ?? "" } : legacyProfile?.name && legacyProfile.name !== demoProfessional.name ? { ...legacyProfile, email: legacyProfile.email ?? "" } : null;
    if (mode === "personal" || savedProfile) {
      const legacyClients = parse<Client[]>(window.localStorage.getItem("vertice-clients"), []);
      const legacyContracts = parse<Contract[]>(window.localStorage.getItem("vertice-contracts"), []);
      const legacyWork = parse<WorkEngagement[]>(window.localStorage.getItem("vertice-work-engagements"), []);
      const ownClients = legacyClients.filter((client) => client.professional === savedProfile?.name);
      const ownClientIds = new Set(ownClients.map((client) => client.id));
      setWorkspaceMode("personal");
      setProfessionalProfile(savedProfile ?? { ...demoProfessional, name: "Meu espaço", email: "" });
      setClientData(parse(window.localStorage.getItem(storageKeys.clients), ownClients));
      setContractData(parse(window.localStorage.getItem(storageKeys.contracts), legacyContracts.filter((contract) => contract.professionalName === savedProfile?.name || ownClientIds.has(contract.clientId))));
      setWorkData(parse(window.localStorage.getItem(storageKeys.work), legacyWork.filter((item) => item.id > 1_000_000)));
    } else {
      setWorkspaceMode("demo");
      setClientData(clients); setContractData(initialContracts); setWorkData(workEngagements); setProfessionalProfile(demoProfessional);
      setProfileOpen(true);
    }
    setDidLoad(true);
  }, []);
  useEffect(() => { if (didLoad) window.localStorage.setItem(storageKeys.mode, workspaceMode); }, [workspaceMode, didLoad]);
  useEffect(() => { if (didLoad && workspaceMode === "personal") window.localStorage.setItem(storageKeys.clients, JSON.stringify(clientData)); }, [clientData, workspaceMode, didLoad]);
  useEffect(() => { if (didLoad && workspaceMode === "personal") window.localStorage.setItem(storageKeys.contracts, JSON.stringify(contractData)); }, [contractData, workspaceMode, didLoad]);
  useEffect(() => { if (didLoad && workspaceMode === "personal") window.localStorage.setItem(storageKeys.work, JSON.stringify(workData)); }, [workData, workspaceMode, didLoad]);
  useEffect(() => { if (didLoad && workspaceMode === "personal") window.localStorage.setItem(storageKeys.profile, JSON.stringify(professionalProfile)); }, [professionalProfile, workspaceMode, didLoad]);
  useEffect(() => { void fetch("/api/zapsign/document").then((response) => response.json()).then((result) => setZapSignConfigured(Boolean((result as { configured?: boolean }).configured))).catch(() => setZapSignConfigured(false)); }, []);

  useEffect(() => {
    type Tool = { name: string; title: string; description: string; inputSchema: object; annotations: { readOnlyHint: boolean; untrustedContentHint: boolean }; execute: (input: unknown) => unknown };
    const context = (document as Document & { modelContext?: { registerTool: (tool: Tool, options?: { signal: AbortSignal }) => void | Promise<void> } }).modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    const register = (tool: Tool) => Promise.resolve(context.registerTool(tool, { signal: lifecycle.signal })).catch(() => undefined);
    void register({
      name: "create_client", title: "Cadastrar cliente", description: "Cria um cliente no Vértice e o exibe na lista.",
      inputSchema: { type: "object", properties: { name: { type: "string" }, service: { type: "string" }, monthlyValue: { type: "number" } }, required: ["name", "service"], additionalProperties: false },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      execute: (input) => {
        const value = input as { name?: string; service?: string; monthlyValue?: number };
        if (!value.name || !value.service) throw new Error("Dados do cliente inválidos");
        const id = Date.now();
        setClientData((current) => [...current, { id, name: value.name!, age: 30, email: "", phone: "", service: value.service!, professional: professionalProfile.name, status: "Ativo", monthlyValue: Number.isFinite(value.monthlyValue) ? value.monthlyValue : undefined, lastSession: "—", payment: "Pendente", risk: "Saudável", nextAppointment: "A definir", goal: "A definir", notes: "", restrictions: "Sem restrições informadas", progress: 0, entityType: "Pessoa atendida", category: "Aluno de personal", anamnesisStatus: "Pendente", parqStatus: "Pendente" }]);
        setView("clients");
        return { id, status: "created", name: value.name };
      },
    });
    void register({
      name: "open_client", title: "Abrir cliente", description: "Abre o perfil de um cliente pelo identificador.",
      inputSchema: { type: "object", properties: { id: { type: "number" } }, required: ["id"], additionalProperties: false },
      annotations: { readOnlyHint: true, untrustedContentHint: false },
      execute: (input) => { const id = (input as { id?: number }).id; if (!clientData.some((c) => c.id === id)) throw new Error("Cliente não encontrado"); setSelectedId(id!); setView("profile"); return { id, status: "opened" }; },
    });
    void register({
      name: "send_payment_reminders", title: "Enviar lembretes", description: "Simula o envio de lembretes para todos os pagamentos atrasados.",
      inputSchema: { type: "object", properties: {}, additionalProperties: false }, annotations: { readOnlyHint: false, untrustedContentHint: false },
      execute: () => { toast.success("3 lembretes preparados para envio"); return { remindersPrepared: 3, totalAmount: 900 }; },
    });
    void register({
      name: "navigate_workspace", title: "Navegar no Vértice", description: "Abre uma área principal do Vértice.",
      inputSchema: { type: "object", properties: { destination: { type: "string", enum: ["dashboard", "clients", "portfolio", "finance", "contracts"] } }, required: ["destination"], additionalProperties: false },
      annotations: { readOnlyHint: true, untrustedContentHint: false },
      execute: (input) => { const destination = (input as { destination?: string }).destination; if (!destination || !["dashboard", "clients", "portfolio", "finance", "contracts"].includes(destination)) throw new Error("Destino inválido"); setView(destination === "dashboard" ? "dashboard" : destination === "clients" ? "clients" : destination === "portfolio" ? "portfolio" : "finance"); if (destination === "contracts") setFinanceTab("contracts"); if (destination === "finance") setFinanceTab("payments"); return { destination, status: "opened" }; },
    });
    return () => lifecycle.abort();
  }, [clientData, professionalProfile.name]);

  const selectedClient = clientData.find((client) => client.id === selectedId) ?? clientData[0];
  const signatureContract = contractData.find((item) => item.id === signatureContractId);
  const signatureClient = clientData.find((item) => item.id === signatureContract?.clientId || item.name === signatureContract?.client);
  const openClient = (id: number) => { setSelectedId(id); setView("profile"); };
  const go = (next: View, contracts = false) => { setView(next); if (contracts) setFinanceTab("contracts"); };

  const addClient = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const entityType = String(form.get("entityType")) as EntityType;
    const category = String(form.get("category"));
    const rawValue = String(form.get("value") || "").trim();
    let photoUrl: string | undefined;
    try { photoUrl = await readPhoto(form.get("photo") instanceof File ? form.get("photo") as File : null); }
    catch (error) { return toast.error(error instanceof Error ? error.message : "Não foi possível processar a foto"); }
    const newClient: Client = { relationship: entityType === "Pessoa atendida" ? relationshipFromForm(form) : undefined, id: Date.now(), name: String(form.get("name")), age: Number(form.get("age")) || 0, email: String(form.get("email")), phone: String(form.get("phone")), service: String(form.get("service")), professional: professionalProfile.name, status: "Ativo", monthlyValue: rawValue ? Number(rawValue) : undefined, lastSession: "—", payment: "Pendente", risk: "Saudável", nextAppointment: "A definir", goal: String(form.get("goal")) || "A definir", notes: "Cadastro criado no MVP.", restrictions: String(form.get("restrictions")) || "Sem restrições informadas", progress: 0, entityType, category, document: String(form.get("document")), responsibleName: String(form.get("responsibleName")), address: String(form.get("address")), emergencyContact: String(form.get("emergencyContact")), photoUrl, needsSupportContact: form.get("needsSupportContact") === "on", supportName: String(form.get("supportName") || "") || undefined, supportRelationship: String(form.get("supportRelationship") || "") || undefined, supportPhone: String(form.get("supportPhone") || "") || undefined, supportReceivesBilling: form.get("supportReceivesBilling") === "on", anamnesisStatus: entityType === "Pessoa atendida" ? "Pendente" : undefined, parqStatus: entityType === "Pessoa atendida" ? "Pendente" : undefined };
    setClientData((current) => [...current, newClient]);
    setCreateOpen(false); setView("clients"); toast.success(`${newClient.name} foi adicionado(a)`);
  };

  const signHealthDocument = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!healthDocument) return;
    const form = new FormData(event.currentTarget);
    if (form.get("accepted") !== "on") return toast.error("Confirme a declaração para assinar");
    const field = healthDocument.type === "parq" ? "parqStatus" : "anamnesisStatus";
    setClientData((current) => current.map((client) => client.id === healthDocument.clientId ? { ...client, [field]: "Assinado", healthDocumentSignedAt: new Date().toLocaleString("pt-BR") } : client));
    setHealthDocument(null); toast.success("Documento assinado e disponível em PDF");
  };

  const updateContract = (id: number, status: ContractStatus, message: string) => {
    setContractData((current) => current.map((contract) => contract.id === id ? { ...contract, status } : contract));
    toast.success(message);
  };

  const sendContractToZapSign = async (id: number) => {
    const contract = contractData.find((item) => item.id === id);
    const client = clientData.find((item) => item.id === contract?.clientId || item.name === contract?.client);
    if (!contract || !client) return toast.error("Não foi possível localizar os dados do contrato");
    if (!client.email) return toast.error("Cadastre o e-mail da parte contratante antes de enviar");
    if (!professionalProfile.email) return toast.error("Adicione seu e-mail no perfil profissional antes de enviar");
    setSendingContractId(id);
    try {
      const { pdf } = createContractPdf(contract, client);
      const base64Pdf = pdf.output("datauristring").split(",")[1];
      const response = await fetch("/api/zapsign/document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contract, client: { name: client.name, email: client.email }, professional: { name: professionalProfile.name, email: professionalProfile.email }, base64Pdf }),
      });
      const result = await response.json() as { error?: string; documentToken?: string; clientSignerToken?: string; professionalSignerToken?: string; clientSignUrl?: string; professionalSignUrl?: string };
      if (!response.ok) throw new Error(result.error || "A ZapSign não aceitou o documento");
      setContractData((current) => current.map((item) => item.id === id ? { ...item, status: "Aguardando assinatura", signatureProvider: "ZapSign Sandbox", zapSignDocumentToken: result.documentToken, zapSignSignerToken: result.clientSignerToken, zapSignProfessionalSignerToken: result.professionalSignerToken, signUrl: result.clientSignUrl, professionalSignUrl: result.professionalSignUrl } : item));
      toast.success("Contrato enviado aos dois signatários pela ZapSign Sandbox");
      if (result.professionalSignUrl) window.open(result.professionalSignUrl, "_blank", "noopener,noreferrer");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível enviar para a ZapSign");
    } finally { setSendingContractId(null); }
  };

  const createContract = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const clientId = Number(form.get("clientId"));
    const client = clientData.find((item) => item.id === clientId);
    if (!client) return toast.error("Selecione um cadastro válido");
    const contract: Contract = { id: Date.now(), client: client.name, clientId, template: String(form.get("template")), service: String(form.get("service")) || client.service, amount: Number(form.get("amount")) || client.monthlyValue || 0, billingMode: String(form.get("billingMode")) || undefined, frequency: String(form.get("frequency") || "").trim() || undefined, schedule: String(form.get("schedule") || "").trim() || undefined, startDate: String(form.get("startDate")), endDate: String(form.get("endDate")), cancellationPolicy: String(form.get("cancellationPolicy")), customTerms: String(form.get("customTerms") || "").trim() || undefined, status: "Rascunho", professionalName: professionalProfile.name };
    setContractData((current) => [contract, ...current]);
    setContractOpen(false); setFinanceTab("contracts"); toast.success("Contrato criado e pronto para gerar PDF");
  };

  const signContract = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (signatureContractId === null) return;
    const form = new FormData(event.currentTarget);
    if (form.get("accepted") !== "on") return toast.error("Confirme o aceite para assinar");
    const evidenceId = `VTX-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
    setContractData((current) => current.map((contract) => contract.id === signatureContractId ? { ...contract, status: "Assinado", signerName: String(form.get("signerName")), signerDocument: String(form.get("signerDocument")), signedAt: new Date().toLocaleString("pt-BR"), evidenceId } : contract));
    setSignatureContractId(null); toast.success("Assinatura registrada com código de evidência");
  };

  const addWorkEngagement = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const type = String(form.get("type")) as WorkType;
    const hasContract = form.get("hasContract") === "on";
    const participantValue = Number(form.get("participantCount"));
    const engagement: WorkEngagement = {
      id: Date.now(), type, counterparty: String(form.get("counterparty")), activity: String(form.get("activity")) || undefined,
      professionalRole: String(form.get("professionalRole")) || undefined, startDate: String(form.get("startDate")), amount: Number(form.get("amount")),
      billingMode: String(form.get("billingMode")) || undefined, schedule: String(form.get("schedule")) || undefined,
      participantCount: participantValue > 0 ? participantValue : undefined, notes: String(form.get("notes")) || undefined,
      contractStatus: hasContract ? "Rascunho" : "Sem contrato",
    };
    setWorkData((current) => [engagement, ...current]);
    if (hasContract) {
      const client = clientData.find((entry) => entry.name === engagement.counterparty);
      const contract: Contract = { id: Date.now() + 1, client: engagement.counterparty, clientId: client?.id ?? 0, template: type === "Atendimento terapêutico" ? "Prestação de serviços — Fisio" : type === "Aula coletiva" ? "Prestação de aulas coletivas" : "Prestação de serviços", service: engagement.activity || type, amount: engagement.amount, billingMode: engagement.billingMode, schedule: engagement.schedule, startDate: engagement.startDate, endDate: "Prazo indeterminado", cancellationPolicy: "Cancelamento conforme acordo entre as partes.", status: "Rascunho", professionalName: professionalProfile.name };
      setContractData((current) => [contract, ...current]);
    }
    setWorkOpen(false); setView("portfolio"); toast.success("Atuação adicionada à carteira profissional");
  };

  const saveProfessionalProfile = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const profile: ProfessionalProfile = { name: String(form.get("name")), email: String(form.get("email")), profession: String(form.get("profession")), registration: String(form.get("registration")), registrationState: String(form.get("registrationState")), mainOrganization: String(form.get("mainOrganization")) || "Profissional autônomo", specialties: String(form.get("specialties")) || "" };
    const creatingPersonalWorkspace = workspaceMode === "demo";
    setProfessionalProfile(profile); setWorkspaceMode("personal");
    if (creatingPersonalWorkspace) { setClientData([]); setContractData([]); setWorkData([]); setSelectedId(0); setView("dashboard"); }
    setProfileOpen(false); toast.success(creatingPersonalWorkspace ? `Espaço limpo de ${profile.name} criado` : "Perfil profissional atualizado");
  };

  const useDemoWorkspace = () => { setWorkspaceMode("demo"); setProfessionalProfile(demoProfessional); setClientData(clients); setContractData(initialContracts); setWorkData(workEngagements); setSelectedId(1); setView("dashboard"); setProfileOpen(false); toast.info("Demonstração de Rafael Costa ativada"); };
  const usePersonalWorkspace = () => {
    const saved = window.localStorage.getItem(storageKeys.profile);
    if (!saved) return setProfileOpen(true);
    try {
      setProfessionalProfile(JSON.parse(saved));
      setClientData(JSON.parse(window.localStorage.getItem(storageKeys.clients) || "[]"));
      setContractData(JSON.parse(window.localStorage.getItem(storageKeys.contracts) || "[]"));
      setWorkData(JSON.parse(window.localStorage.getItem(storageKeys.work) || "[]"));
      setWorkspaceMode("personal"); setView("dashboard"); toast.success("Seu espaço foi restaurado");
    } catch { setProfileOpen(true); }
  };

  return (
    <SidebarProvider>
      <AppSidebar view={view} navigate={go} profile={professionalProfile} onEditProfile={() => setProfileOpen(true)} />
      <SidebarInset>
        <AppHeader view={view} profile={professionalProfile} onSearch={() => setView("clients")} onCreate={() => setCreateOpen(true)} />
        <main className="min-h-[calc(100vh-4rem)] bg-[#f4f7f6] px-4 py-6 md:px-8 md:py-8">
          <div className="mx-auto max-w-[1440px]">
            <div className="mb-5 flex flex-col gap-3 rounded-xl border border-[#c9ded9] bg-[#edf7f5] px-4 py-3 text-sm text-[#315e58] sm:flex-row sm:items-center sm:justify-between"><span>{workspaceMode === "demo" ? <><b>Demonstração de Rafael Costa.</b> Estes dados são exemplos e não se misturam com o seu cadastro.</> : <><b>Espaço de {professionalProfile.name}.</b> Aqui aparecem apenas os cadastros feitos neste navegador.</>}</span><Button size="sm" variant="outline" onClick={workspaceMode === "demo" ? usePersonalWorkspace : useDemoWorkspace}>{workspaceMode === "demo" ? "Criar ou abrir meu espaço" : "Ver demonstração"}</Button></div>
            {view === "finance" && financeTab === "contracts" && <SignatureSync key={workspaceMode + professionalProfile.name} contracts={contractData} onUpdate={(token, status, signedAt) => setContractData(current => current.map(item => item.zapSignDocumentToken === token ? { ...item, status, signedAt } : item))} />}
            {view === "dashboard" && <Dashboard navigate={go} openClient={openClient} clients={clientData} contracts={contractData} />}
            {view === "clients" && <CrmOpportunities key={workspaceMode + professionalProfile.name} clients={clientData} onOpen={openClient} />}
            {view === "clients" && <ClientsView clients={clientData} openClient={openClient} onCreate={() => setCreateOpen(true)} onArchive={(id) => { setClientData((current) => current.map((client) => client.id === id ? { ...client, status: "Inativo" } : client)); toast.success("Cliente arquivado"); }} />}
            {view === "profile" && selectedClient && <RelationshipEditor key={workspaceMode + selectedClient.id} client={selectedClient} onSave={relationship => setClientData(current => current.map(c => c.id === selectedClient.id ? { ...c, relationship } : c))} />}
            {view === "profile" && selectedClient && <ProfileView client={selectedClient} back={() => setView("clients")} onOpenHealthDocument={(type) => setHealthDocument({ clientId: selectedClient.id, type })} />}
            {view === "portfolio" && <PortfolioView items={workData} onCreate={() => setWorkOpen(true)} onCreateContract={(item) => { const client = clientData.find((entry) => entry.name === item.counterparty); const contract: Contract = { id: Date.now(), client: item.counterparty, clientId: client?.id ?? 0, template: item.type === "Atendimento terapêutico" ? "Prestação de serviços — Fisio" : "Prestação de serviços", service: item.activity || item.type, amount: item.amount, billingMode: item.billingMode, schedule: item.schedule, startDate: item.startDate, endDate: "Prazo indeterminado", cancellationPolicy: "Cancelamento conforme acordo entre as partes.", status: "Rascunho", professionalName: professionalProfile.name }; setContractData((current) => [contract, ...current]); setWorkData((current) => current.map((entry) => entry.id === item.id ? { ...entry, contractStatus: "Rascunho" } : entry)); setFinanceTab("contracts"); setView("finance"); toast.success("Contrato opcional criado como rascunho"); }} />}
            {view === "finance" && <FinanceView tab={financeTab} setTab={setFinanceTab} contracts={contractData} clients={clientData} updateContract={updateContract} onSign={setSignatureContractId} onSend={sendContractToZapSign} sendingContractId={sendingContractId} zapSignConfigured={zapSignConfigured} onCreateContract={() => setContractOpen(true)} />}
          </div>
        </main>
      </SidebarInset>
      <CreateClientDialog open={createOpen} setOpen={setCreateOpen} onSubmit={addClient} />
      <CreateContractDialog open={contractOpen} setOpen={setContractOpen} clients={clientData} onSubmit={createContract} />
      <CreateWorkDialog open={workOpen} setOpen={setWorkOpen} clients={clientData} onSubmit={addWorkEngagement} />
      <SignatureDialog open={signatureContractId !== null} setOpen={(open) => !open && setSignatureContractId(null)} contract={signatureContract} client={signatureClient} onSubmit={signContract} />
      <HealthDocumentDialog open={healthDocument !== null} setOpen={(open) => !open && setHealthDocument(null)} client={clientData.find((item) => item.id === healthDocument?.clientId)} type={healthDocument?.type ?? "anamnesis"} onSubmit={signHealthDocument} />
      <ProfessionalProfileDialog open={profileOpen} setOpen={setProfileOpen} profile={professionalProfile} onSubmit={saveProfessionalProfile} onUseDemo={useDemoWorkspace} />
      <Toaster richColors position="bottom-right" />
    </SidebarProvider>
  );
}

function AppSidebar({ view, navigate, profile, onEditProfile }: { view: View; navigate: (view: View, contracts?: boolean) => void; profile: ProfessionalProfile; onEditProfile: () => void }) {
  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarHeader className="px-4 py-5"><div className="flex items-center gap-3 overflow-hidden"><div className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#e8c170] text-[#163d37] shadow-sm"><Sparkles className="size-4" /></div><div className="min-w-0 leading-tight"><p className="truncate font-semibold">Vértice</p><p className="truncate text-xs text-sidebar-foreground/55">Professional OS</p></div></div></SidebarHeader>
      <SidebarContent><SidebarGroup><SidebarGroupContent><SidebarMenu>
        {navigation.map((item) => <SidebarMenuItem key={item.label}><SidebarMenuButton isActive={item.view === view && !(item.contracts && view === "finance")} tooltip={item.label} onClick={() => item.view ? navigate(item.view, item.contracts) : toast.info(`${item.label} entra na próxima etapa do protótipo`)}><item.icon /><span>{item.label}</span></SidebarMenuButton></SidebarMenuItem>)}
      </SidebarMenu></SidebarGroupContent></SidebarGroup></SidebarContent>
      <SidebarFooter className="p-3"><SidebarMenu><SidebarMenuItem><SidebarMenuButton tooltip="Configurações" onClick={() => toast.info("Configurações entram na próxima etapa")}><Settings /><span>Configurações</span></SidebarMenuButton></SidebarMenuItem></SidebarMenu><button type="button" onClick={onEditProfile} className="mt-2 flex w-full items-center gap-3 rounded-xl border border-sidebar-border bg-white/5 p-2 text-left transition-colors hover:bg-white/10 group-data-[collapsible=icon]:hidden"><div className="grid size-9 shrink-0 place-items-center rounded-full bg-[#c9ede5] text-sm font-bold text-[#0b554d]">{profile.name.split(" ").map((part) => part[0]).slice(0,2).join("")}</div><div className="min-w-0"><p className="truncate text-sm font-semibold">{profile.name}</p><p className="truncate text-xs text-sidebar-foreground/55">{profile.profession} · {profile.registration}</p></div></button></SidebarFooter>
    </Sidebar>
  );
}

function AppHeader({ view, profile, onSearch, onCreate }: { view: View; profile: ProfessionalProfile; onSearch: () => void; onCreate: () => void }) {
  const firstName = profile.name.split(" ")[0] || "profissional";
  const titles = { dashboard: `Bom dia, ${firstName}`, clients: "Alunos e parceiros", profile: "Perfil do cadastro", portfolio: "Locais e aulas", finance: "Financeiro e contratos" };
  return <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/90 px-4 backdrop-blur md:px-8"><div className="flex items-center gap-3"><SidebarTrigger /><div><p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">Segunda, 28 de setembro</p><h1 className="text-lg font-semibold tracking-tight">{titles[view]}</h1></div></div><div className="flex items-center gap-2"><Button variant="outline" size="sm" className="hidden sm:flex" onClick={onSearch}><Search />Buscar</Button><Button size="sm" onClick={onCreate}><Plus />Novo cadastro</Button></div></header>;
}

function Dashboard({ navigate, openClient, clients: allClients, contracts }: { navigate: (view: View, contracts?: boolean) => void; openClient: (id: number) => void; clients: Client[]; contracts: Contract[] }) {
  const activeClients = allClients.filter((client) => client.status === "Ativo");
  const recurring = activeClients.reduce((total, client) => total + (client.monthlyValue ?? 0), 0);
  const overdue = allClients.filter((client) => client.payment === "Atrasado");
  const overdueTotal = overdue.reduce((total, client) => total + (client.monthlyValue ?? 0), 0);
  const expiring = contracts.filter((contract) => contract.status === "Expirado").length;
  const metrics = [
    ["Clientes ativos", String(activeClients.length), `${allClients.length} cadastros no espaço`], ["Receita recorrente", brl.format(recurring), "valores mensais informados"], ["Contratos", String(contracts.length), `${contracts.filter((contract) => contract.status === "Assinado").length} assinados`], ["Valor em atraso", brl.format(overdueTotal), `${overdue.length} pagamentos`], ["Contratos vencidos", String(expiring), "pedem renovação"],
  ];
  const recs = [
    ["warning", `${allClients.filter((client) => client.risk !== "Saudável").length} cadastros pedem atenção`, "Revise frequência, saúde e próximos contatos.", "Ver cadastros", () => navigate("clients")],
    ["danger", `${overdue.length} pagamentos estão atrasados`, `${brl.format(overdueTotal)} aguardam regularização.`, "Ver financeiro", () => navigate("finance")],
    ["calm", `${expiring} contratos estão vencidos`, "Antecipe as conversas de renovação.", "Preparar renovações", () => navigate("finance", true)],
  ] as const;
  if (!allClients.length) return <section className="surface-card mx-auto max-w-2xl p-8 text-center md:p-12"><span className="mx-auto grid size-14 place-items-center rounded-2xl bg-[#e6f1ef] text-[#146d62]"><Users /></span><h2 className="mt-5 text-2xl font-semibold">Seu espaço está pronto</h2><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">Cadastre seu primeiro aluno, paciente, academia ou parceiro. Os exemplos de Rafael continuam separados na demonstração.</p><Button className="mt-6" onClick={() => navigate("clients")}><Plus />Começar meus cadastros</Button></section>;
  return <>
    <section className="mb-7 flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><p className="mb-2 inline-flex items-center gap-2 text-sm font-medium text-[#146d62]"><Sparkles className="size-4" />Copiloto do negócio</p><h2 className="text-2xl font-semibold tracking-[-0.03em] text-[#102a27] md:text-3xl">O que precisa da sua atenção hoje</h2></div><p className="max-w-md text-sm leading-6 text-muted-foreground">Seus dados foram analisados às 08:30. Priorize os alertas que afetam retenção e receita.</p></section>
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5" aria-label="Indicadores principais">{metrics.map(([label, value, note], index) => <article key={label} className="metric-card"><p className="text-sm text-muted-foreground">{label}</p><p className={`mt-3 text-2xl font-semibold tracking-[-0.04em] ${index === 3 ? "text-[#a3412e]" : "text-[#102a27]"}`}>{value}</p><p className="mt-2 text-xs text-muted-foreground">{note}</p></article>)}</section>
    <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(340px,.75fr)]">
      <section className="surface-card overflow-hidden"><div className="flex items-center justify-between border-b px-5 py-4 md:px-6"><div><h3 className="font-semibold">Próximas melhores ações</h3><p className="mt-0.5 text-sm text-muted-foreground">Ordenadas por impacto no negócio</p></div><Badge variant="secondary">3 prioridades</Badge></div><div className="divide-y">{recs.map(([color, title, description, action, onClick]) => <article key={title} className="group flex flex-col gap-4 p-5 transition-colors hover:bg-[#f7faf9] sm:flex-row sm:items-center md:px-6"><div className={`signal-dot signal-${color}`} /><div className="min-w-0 flex-1"><h4 className="font-medium text-[#17312e]">{title}</h4><p className="mt-1 text-sm text-muted-foreground">{description}</p></div><Button variant="ghost" size="sm" className="w-fit text-[#146d62]" onClick={onClick}>{action}<ChevronRight /></Button></article>)}</div></section>
      <section className="surface-card overflow-hidden"><div className="border-b px-5 py-4 md:px-6"><h3 className="font-semibold">Clientes para acompanhar</h3><p className="mt-0.5 text-sm text-muted-foreground">Sinais que pedem contato</p></div><div className="divide-y">{allClients.slice(0,3).map((client) => <button key={client.id} onClick={() => openClient(client.id)} className="flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-[#f7faf9] md:px-6"><Avatar name={client.name} /><span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium">{client.name}</span><span className="block truncate text-xs text-muted-foreground">{client.service} · {client.risk === "Em risco" ? "Baixa frequência" : client.payment === "Atrasado" ? "Pagamento atrasado" : "Reavaliação próxima"}</span></span><StatusBadge>{client.risk}</StatusBadge></button>)}</div></section>
    </div>
  </>;
}

function PortfolioView({ items, onCreate, onCreateContract }: { items: WorkEngagement[]; onCreate: () => void; onCreateContract: (item: WorkEngagement) => void }) {
  const locations = new Set(items.filter((item) => item.type !== "Atendimento individual").map((item) => item.counterparty)).size;
  const collective = items.filter((item) => item.type === "Aula coletiva").length;
  const withoutContract = items.filter((item) => item.contractStatus === "Sem contrato").length;
  return <>
    <PageHeading eyebrow="Carteira profissional" title="Locais, aulas e atendimentos" description="Organize cada frente de trabalho separadamente, mesmo quando você atua em várias academias e modalidades." action={<Button onClick={onCreate}><Plus />Adicionar atuação</Button>} />
    <section className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <article className="metric-card"><p className="text-sm text-muted-foreground">Locais parceiros</p><p className="mt-3 text-2xl font-semibold">{locations}</p><p className="mt-2 text-xs text-muted-foreground">academias, estúdios ou clínicas</p></article>
      <article className="metric-card"><p className="text-sm text-muted-foreground">Frentes de trabalho</p><p className="mt-3 text-2xl font-semibold">{items.length}</p><p className="mt-2 text-xs text-muted-foreground">cada modalidade tem sua própria regra</p></article>
      <article className="metric-card"><p className="text-sm text-muted-foreground">Aulas coletivas</p><p className="mt-3 text-2xl font-semibold">{collective}</p><p className="mt-2 text-xs text-muted-foreground">quantidade de alunos é opcional</p></article>
      <article className="metric-card"><p className="text-sm text-muted-foreground">Sem contrato</p><p className="mt-3 text-2xl font-semibold">{withoutContract}</p><p className="mt-2 text-xs text-muted-foreground">o registro funciona normalmente</p></article>
    </section>
    <div className="mb-5 flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900"><ShieldCheck className="mt-0.5 size-5 shrink-0" /><p><b>Contrato é opcional.</b> Você pode cadastrar e acompanhar a atuação sem documento. Se precisar, o contrato pode ser criado depois. Atividades terapêuticas devem respeitar a habilitação e o registro do profissional.</p></div>
    <section className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => <article key={item.id} className="surface-card flex flex-col p-5">
        <div className="flex items-start justify-between gap-3"><div className="flex items-center gap-3"><span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#e5f1ef] text-[#146d62]">{item.type === "Atendimento individual" ? <UserRound className="size-5" /> : item.type === "Atendimento terapêutico" ? <Activity className="size-5" /> : <Building2 className="size-5" />}</span><div><h3 className="font-semibold">{item.counterparty}</h3><p className="mt-0.5 text-sm text-muted-foreground">{item.activity || item.type}</p></div></div><StatusBadge>{item.contractStatus}</StatusBadge></div>
        <div className="mt-5 grid grid-cols-2 gap-3 text-sm"><div className="rounded-xl bg-[#f4f7f6] p-3"><p className="text-xs text-muted-foreground">Valor</p><p className="mt-1 font-semibold">{brl.format(item.amount)}</p><p className="text-xs text-muted-foreground">{item.billingMode || "Forma livre"}</p></div><div className="rounded-xl bg-[#f4f7f6] p-3"><p className="text-xs text-muted-foreground">Início</p><p className="mt-1 font-semibold">{item.startDate}</p><p className="text-xs text-muted-foreground">{item.professionalRole || "Profissional"}</p></div></div>
        <div className="mt-4 space-y-2 text-sm text-muted-foreground">{item.schedule && <p className="flex items-center gap-2"><Clock3 className="size-4" />{item.schedule}</p>}{item.participantCount && <p className="flex items-center gap-2"><Users className="size-4" />{item.participantCount} alunos informados</p>}<p className="flex items-center gap-2"><MapPin className="size-4" />{item.type}</p></div>
        {item.notes && <p className="mt-4 rounded-lg border px-3 py-2 text-sm text-muted-foreground">{item.notes}</p>}
        <div className="mt-auto flex justify-end pt-5">{item.contractStatus === "Sem contrato" ? <Button size="sm" variant="outline" onClick={() => onCreateContract(item)}><FileSignature />Criar contrato opcional</Button> : <Button size="sm" variant="ghost" onClick={() => toast.info(`Contrato de ${item.counterparty}: ${item.contractStatus}`)}><FileText />Ver contrato</Button>}</div>
      </article>)}
    </section>
  </>;
}

function ClientsView({ clients: allClients, openClient, onCreate, onArchive }: { clients: Client[]; openClient: (id: number) => void; onCreate: () => void; onArchive: (id: number) => void }) {
  const [search, setSearch] = useState(""); const [service, setService] = useState("all"); const [status, setStatus] = useState("all"); const [risk, setRisk] = useState("all");
  const filtered = useMemo(() => allClients.filter((client) => client.name.toLowerCase().includes(search.toLowerCase()) && (service === "all" || client.service === service) && (status === "all" || client.status === status) && (risk === "all" || client.risk === risk)), [allClients, search, service, status, risk]);
  return <><PageHeading eyebrow="Relacionamento" title="Alunos e organizações" description={`${allClients.length} cadastros entre pessoas atendidas e parceiros do negócio.`} action={<Button onClick={onCreate}><Plus />Novo cadastro</Button>} />
    <section className="surface-card overflow-hidden"><div className="flex flex-col gap-3 border-b p-4 xl:flex-row"><div className="relative flex-1"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input aria-label="Buscar cliente" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" placeholder="Buscar por nome" /></div><Filter value={service} setValue={setService} label="Serviço" options={services.map((item) => item.name)} /><Filter value={status} setValue={setStatus} label="Status" options={["Ativo","Teste","Pausado","Inativo","Concluído"]} /><Filter value={risk} setValue={setRisk} label="Risco" options={["Saudável","Atenção","Em risco"]} /></div>
      <div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Cadastro</TableHead><TableHead>Tipo e categoria</TableHead><TableHead>Serviço</TableHead><TableHead>Status</TableHead><TableHead>Valor</TableHead><TableHead>Documentos de saúde</TableHead><TableHead>Pagamento</TableHead><TableHead className="w-10" /></TableRow></TableHeader><TableBody>{filtered.map((client) => <TableRow key={client.id}><TableCell><button className="flex items-center gap-3 text-left hover:text-primary" onClick={() => openClient(client.id)}><Avatar name={client.name} photoUrl={client.photoUrl} /><span><span className="block font-medium">{client.name}</span><span className="block text-xs text-muted-foreground">{client.email || "Sem e-mail"}</span></span></button></TableCell><TableCell><span className="block text-sm">{client.entityType ?? "Pessoa atendida"}</span><span className="block text-xs text-muted-foreground">{client.category ?? "Aluno"}</span></TableCell><TableCell>{client.service}</TableCell><TableCell><StatusBadge>{client.status}</StatusBadge></TableCell><TableCell>{optionalAmount(client.monthlyValue)}</TableCell><TableCell><span className="block text-xs">Anamnese: {client.anamnesisStatus ?? "Pendente"}</span><span className="block text-xs text-muted-foreground">PAR-Q: {client.parqStatus ?? "Pendente"}</span></TableCell><TableCell><StatusBadge>{client.payment}</StatusBadge></TableCell><TableCell><DropdownMenu><DropdownMenuTrigger asChild><Button size="icon" variant="ghost" aria-label={`Ações para ${client.name}`}><MoreHorizontal /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onClick={() => openClient(client.id)}><UserRound />Abrir perfil</DropdownMenuItem><DropdownMenuItem onClick={() => openWhatsAppReminder(client)}><MessageCircle />Lembrar no WhatsApp</DropdownMenuItem><DropdownMenuItem onClick={() => onArchive(client.id)}><Archive />Arquivar</DropdownMenuItem></DropdownMenuContent></DropdownMenu></TableCell></TableRow>)}</TableBody></Table></div>
      <div className="flex items-center justify-between border-t px-5 py-4 text-sm text-muted-foreground"><span>{filtered.length} resultados</span><span>Página 1 de 1</span></div>
    </section></>;
}

function ProfileView({ client, back, onOpenHealthDocument }: { client: Client; back: () => void; onOpenHealthDocument: (type: HealthDocumentType) => void }) {
  return <><Button variant="ghost" className="mb-4 -ml-2" onClick={back}><ChevronLeft />Voltar aos clientes</Button>
    <section className="surface-card mb-6 flex flex-col gap-5 p-5 md:flex-row md:items-center md:p-6"><Avatar name={client.name} photoUrl={client.photoUrl} large /><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h2 className="text-2xl font-semibold tracking-tight">{client.name}</h2><StatusBadge>{client.status}</StatusBadge><Badge variant="secondary">{client.category ?? "Aluno"}</Badge>{(client.age < 18 || client.age >= 60) && <Badge variant="outline">{client.age < 18 ? "Menor de 18" : "60+"}</Badge>}</div><p className="mt-1 text-sm text-muted-foreground">{client.entityType ?? "Pessoa atendida"} · {client.service} · {client.professional}</p><div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm"><span><b className="font-medium">Valor:</b> {optionalAmount(client.monthlyValue)}</span><span><b className="font-medium">Documento:</b> {client.document || "não informado"}</span><span><b className="font-medium">Próximo atendimento:</b> {client.nextAppointment}</span></div></div><Button variant="outline" onClick={() => openWhatsAppReminder(client)}><MessageCircle />Lembrar no WhatsApp</Button></section>
    <Tabs defaultValue="overview"><TabsList className="mb-5 h-auto flex-wrap justify-start"><TabsTrigger value="overview">Visão geral</TabsTrigger><TabsTrigger value="health">Saúde e documentos</TabsTrigger><TabsTrigger value="activity">Sessões e atividade</TabsTrigger><TabsTrigger value="evolution">Evolução</TabsTrigger><TabsTrigger value="finance">Financeiro</TabsTrigger><TabsTrigger value="contracts">Contratos</TabsTrigger><TabsTrigger value="collaborators">Colaboradores</TabsTrigger></TabsList>
      <TabsContent value="overview"><div className="grid gap-6 lg:grid-cols-4"><InfoCard title={client.entityType === "Organização parceira" ? "Modelo da parceria" : "Objetivo principal"}><p>{client.goal}</p></InfoCard><InfoCard title={client.entityType === "Organização parceira" ? "Responsável e endereço" : "Restrições e alertas"}><p>{client.entityType === "Organização parceira" ? `${client.responsibleName || "Responsável não informado"} · ${client.address || "Endereço não informado"}` : client.restrictions}</p></InfoCard><InfoCard title="Contato"><p>{client.email || "Sem e-mail"}<br />{client.phone || "Sem telefone"}</p></InfoCard><InfoCard title={client.age < 18 ? "Responsável legal" : "Contato de apoio"}><p>{client.supportName || "Não informado"}{client.supportRelationship && <><br />{client.supportRelationship}</>}{client.supportPhone && <><br />{client.supportPhone}</>}</p>{client.supportReceivesBilling && <p className="mt-2 text-xs text-muted-foreground">Recebe cobranças e lembretes</p>}</InfoCard></div></TabsContent>
      <TabsContent value="health"><div className="mb-4 flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900"><HeartPulse className="mt-0.5 size-5 shrink-0" /><div><p className="font-medium">Triagem antes do acompanhamento</p><p className="mt-1">A anamnese reúne o histórico de saúde. O PAR-Q identifica quando pode ser recomendável buscar avaliação médica; ele não substitui atestado ou diagnóstico.</p></div></div><div className="grid gap-6 md:grid-cols-2"><HealthDocumentCard title="Ficha de anamnese" description="Histórico, lesões, medicamentos, objetivos e cuidados importantes." status={client.anamnesisStatus ?? "Pendente"} onOpen={() => onOpenHealthDocument("anamnesis")} onDownload={() => generateHealthPdf(client, "anamnesis")} /><HealthDocumentCard title="PAR-Q" description="Questionário de prontidão para atividade física com respostas de sim ou não." status={client.parqStatus ?? "Pendente"} onOpen={() => onOpenHealthDocument("parq")} onDownload={() => generateHealthPdf(client, "parq")} /></div></TabsContent>
      <TabsContent value="activity"><section className="surface-card p-6"><h3 className="font-semibold">Linha do tempo</h3><div className="mt-6 space-y-6">{activity.map((item) => <div key={item.date + item.type} className="flex gap-4"><div className="flex flex-col items-center"><span className="mt-1 size-3 rounded-full bg-primary ring-4 ring-[#dff3ef]" /><span className="mt-2 h-full w-px bg-border" /></div><div className="pb-4"><p className="text-sm font-medium">{item.type}</p><p className="mt-1 text-sm text-muted-foreground">{item.detail}</p><p className="mt-2 text-xs text-muted-foreground">{item.date}</p></div></div>)}</div></section></TabsContent>
      <TabsContent value="evolution"><div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]"><InfoCard title="Progresso da jornada"><div className="mb-3 flex items-end justify-between"><span className="text-3xl font-semibold">{client.progress}%</span><span className="text-sm text-muted-foreground">meta atual</span></div><Progress value={client.progress} /></InfoCard><InfoCard title="Indicadores acompanhados"><div className="grid grid-cols-2 gap-4"><Metric label="Frequência" value="78%" /><Metric label="Sessões no mês" value="7" /><Metric label="Evolução funcional" value="+12%" /><Metric label="Dor reportada" value="2/10" /></div></InfoCard></div></TabsContent>
      <TabsContent value="finance"><div className="grid gap-6 lg:grid-cols-3"><InfoCard title="Plano atual"><p className="text-xl font-semibold">{client.service}</p><p className="mt-2 text-muted-foreground">{optionalAmount(client.monthlyValue)}{client.monthlyValue !== undefined ? " / mês" : ""}</p></InfoCard><InfoCard title="Situação"><StatusBadge>{client.payment}</StatusBadge><p className="mt-4 text-sm text-muted-foreground">{client.monthlyValue === undefined ? "Valor será definido no contrato." : "Próximo vencimento: 05/10/2026"}</p></InfoCard><InfoCard title="Saldo em aberto"><p className="text-2xl font-semibold">{client.payment === "Atrasado" && client.monthlyValue !== undefined ? brl.format(client.monthlyValue) : "R$ 0"}</p></InfoCard></div></TabsContent>
      <TabsContent value="contracts"><InfoCard title="Contrato vigente"><div className="flex flex-wrap items-center justify-between gap-4"><div><StatusBadge>Assinado</StatusBadge><p className="mt-3 text-sm text-muted-foreground">Validade até 05/10/2026</p></div><div className="flex gap-2"><Button variant="outline" onClick={() => toast.info("Visualização simulada do contrato PDF")}><FileText />Ver PDF</Button><Button onClick={() => toast.success("Renovação preparada")}><FileSignature />Renovar</Button></div></div></InfoCard></TabsContent>
      <TabsContent value="collaborators"><div className="grid gap-4 md:grid-cols-2"><Collaborator name={client.professional} role={client.service.includes("Fisio") ? "Fisioterapeuta responsável" : "Profissional responsável"} initials={client.professional.split(" ").map((x) => x[0]).slice(0,2).join("")} /><Collaborator name="Dra. Beatriz Nunes" role="Fisioterapeuta colaboradora" initials="BN" /></div></TabsContent>
    </Tabs></>;
}

function FinanceView({ tab, setTab, contracts, clients: allClients, updateContract, onSign, onSend, sendingContractId, zapSignConfigured, onCreateContract }: { tab: string; setTab: (tab: string) => void; contracts: Contract[]; clients: Client[]; updateContract: (id: number, status: ContractStatus, message: string) => void; onSign: (id: number) => void; onSend: (id: number) => void; sendingContractId: number | null; zapSignConfigured: boolean; onCreateContract: () => void }) {
  const paymentRows = allClients.filter((client) => client.monthlyValue !== undefined).map((client, index) => ({ id: client.id, client: client.name, service: client.service, amount: client.monthlyValue ?? 0, dueDate: `${String((index % 22) + 2).padStart(2, "0")}/10/2026`, status: client.payment, method: "A combinar" }));
  const forecast = paymentRows.reduce((total, payment) => total + payment.amount, 0);
  const received = paymentRows.filter((payment) => payment.status === "Pago").reduce((total, payment) => total + payment.amount, 0);
  const open = forecast - received;
  const summary = [["Receita prevista",brl.format(forecast)],["Recebido",brl.format(received)],["Em aberto",brl.format(open)],["Recorrente",brl.format(forecast)],["Ticket médio",brl.format(paymentRows.length ? forecast / paymentRows.length : 0)]];
  return <><PageHeading eyebrow="Administração" title="Financeiro e contratos" description="Acompanhe receitas, cobranças e documentos em um só lugar." action={<Button variant="outline" onClick={() => toast.success("Relatório financeiro preparado")}><Download />Exportar relatório</Button>} /><section className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">{summary.map(([label,value]) => <article className="metric-card" key={label}><p className="text-sm text-muted-foreground">{label}</p><p className="mt-3 text-2xl font-semibold tracking-tight">{value}</p></article>)}</section>
    <Tabs value={tab} onValueChange={setTab}><TabsList className="mb-5 h-auto flex-wrap"><TabsTrigger value="payments">Pagamentos</TabsTrigger><TabsTrigger value="contracts">Contratos</TabsTrigger><TabsTrigger value="assistant"><Sparkles />Pergunte ao Vértice</TabsTrigger></TabsList>
      <TabsContent value="payments"><section className="surface-card overflow-hidden"><div className="flex items-center justify-between border-b p-5"><div><h3 className="font-semibold">Cobranças atuais</h3><p className="text-sm text-muted-foreground">{paymentRows.length} lançamentos com valor informado</p></div><Button onClick={() => { const overdue = paymentRows.find((item) => item.status === "Atrasado"); const client = allClients.find((item) => item.name === overdue?.client); if (client) openWhatsAppReminder(client, "payment"); else toast.info("Nenhum pagamento atrasado neste espaço"); }}><MessageCircle />Lembrar atrasados</Button></div><div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Cliente</TableHead><TableHead>Serviço</TableHead><TableHead>Valor</TableHead><TableHead>Vencimento</TableHead><TableHead>Status</TableHead><TableHead>Método</TableHead><TableHead>Lembrete</TableHead></TableRow></TableHeader><TableBody>{paymentRows.map((payment) => <TableRow key={payment.id}><TableCell className="font-medium">{payment.client}</TableCell><TableCell>{payment.service}</TableCell><TableCell>{brl.format(payment.amount)}</TableCell><TableCell>{payment.dueDate}</TableCell><TableCell><StatusBadge>{payment.status}</StatusBadge></TableCell><TableCell>{payment.method}</TableCell><TableCell><Button size="sm" variant="ghost" onClick={() => { const client = allClients.find((item) => item.name === payment.client); if (client) openWhatsAppReminder(client, "payment"); }}><MessageCircle />WhatsApp</Button></TableCell></TableRow>)}</TableBody></Table></div></section></TabsContent>
      <TabsContent value="contracts"><div className={`mb-4 flex items-start gap-3 rounded-xl border p-4 text-sm ${zapSignConfigured ? "border-violet-200 bg-violet-50 text-violet-950" : "border-amber-200 bg-amber-50 text-amber-950"}`}><ShieldCheck className="mt-0.5 size-5 shrink-0" /><div><p className="font-medium">{zapSignConfigured ? "ZapSign Sandbox ativa" : "Fluxo ZapSign Sandbox preparado"}</p><p className={`mt-1 ${zapSignConfigured ? "text-violet-800" : "text-amber-800"}`}>{zapSignConfigured ? "O PDF é enviado aos dois signatários com links individuais e ordem de assinatura. Como este é o ambiente de testes, as assinaturas não possuem validade jurídica." : "Falta somente conectar o token da conta de testes. Até lá, os contratos continuam disponíveis em PDF e no aceite interno do MVP."}</p></div></div><section className="surface-card overflow-hidden"><div className="flex items-center justify-between border-b p-5"><div><h3 className="font-semibold">Contratos e assinaturas</h3><p className="text-sm text-muted-foreground">PDF, envio por e-mail e links de assinatura de teste</p></div><Button onClick={onCreateContract}><Plus />Criar contrato</Button></div><div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Parte contratante</TableHead><TableHead>Modelo</TableHead><TableHead>Vigência</TableHead><TableHead>Valor</TableHead><TableHead>Assinatura</TableHead><TableHead className="text-right">Ações</TableHead></TableRow></TableHeader><TableBody>{contracts.map((contract) => { const client = allClients.find((item) => item.id === contract.clientId || item.name === contract.client); return <TableRow key={contract.id}><TableCell><span className="block font-medium">{contract.client}</span><span className="text-xs text-muted-foreground">{client?.category ?? "Pessoa atendida"}</span></TableCell><TableCell>{contract.template}</TableCell><TableCell><span className="block">{contract.startDate}</span><span className="text-xs text-muted-foreground">até {contract.endDate}</span></TableCell><TableCell><span className="block">{brl.format(contract.amount ?? client?.monthlyValue ?? 0)}</span><span className="text-xs text-muted-foreground">{contract.billingMode ?? "Forma não informada"}</span></TableCell><TableCell><StatusBadge>{contract.status}</StatusBadge>{contract.signatureProvider && <span className="mt-1 block text-[10px] text-muted-foreground">{contract.signatureProvider}</span>}</TableCell><TableCell><div className="flex justify-end gap-1"><Button size="sm" variant="ghost" onClick={() => generateContractPdf(contract, client, "open")}><FileText />Ver PDF</Button>{contract.status === "Rascunho" || contract.status === "Enviado" ? <Button size="sm" variant="ghost" disabled={!zapSignConfigured || sendingContractId === contract.id} onClick={() => onSend(contract.id)}><Mail />{sendingContractId === contract.id ? "Enviando..." : zapSignConfigured ? "Enviar para ZapSign" : "ZapSign pendente"}</Button> : contract.status === "Aguardando assinatura" && contract.professionalSignUrl ? <Button size="sm" variant="ghost" onClick={() => window.open(contract.professionalSignUrl, "_blank", "noopener,noreferrer")}><FileSignature />Abrir assinatura</Button> : contract.status === "Aguardando assinatura" ? <Button size="sm" variant="ghost" onClick={() => onSign(contract.id)}><FileSignature />Assinar teste interno</Button> : null}<DropdownMenu><DropdownMenuTrigger asChild><Button size="icon" variant="ghost"><MoreHorizontal /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onClick={() => generateContractPdf(contract, client)}><Download />Baixar PDF</DropdownMenuItem>{contract.signUrl && <DropdownMenuItem onClick={() => { void navigator.clipboard.writeText(contract.signUrl!); toast.success("Link do cliente copiado"); }}><Mail />Copiar link do cliente</DropdownMenuItem>}<DropdownMenuItem onClick={() => updateContract(contract.id, "Rascunho", "Renovação criada como rascunho")}><FileSignature />Renovar contrato</DropdownMenuItem></DropdownMenuContent></DropdownMenu></div></TableCell></TableRow>; })}</TableBody></Table></div></section></TabsContent>
      <TabsContent value="assistant"><FinanceAssistant contracts={contracts} clients={allClients} /></TabsContent>
    </Tabs></>;
}

function FinanceAssistant({ contracts, clients: allClients }: { contracts: Contract[]; clients: Client[] }) {
  const [quota, setQuota] = useState<{used: number; remaining: number; limit: number} | null>(null);
  useEffect(() => {
    const refresh = () => { void fetch("/api/assistant/finance", { cache: "no-store" }).then(r => r.json()).then(d => setQuota((d as { quota?: {used: number; remaining: number; limit: number} }).quota ?? null)).catch(() => {}); };
    refresh();
    const timer = window.setInterval(refresh, 60_000);
    return () => window.clearInterval(timer);
  }, []);
  const suggestions = [
    "Se eu mantiver os contratos ativos, quanto tenho no mês?",
    "Quantos contratos novos de R$ 500 preciso para chegar a R$ 2.500 por mês?",
    "Quanto está atrasado agora?",
  ];
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ answer: string; calculation?: { label: string; value: string; formula: string }; assumptions?: string[]; source?: "openai" | "deterministic"; warning?: string } | null>(null);
  const activeWithValue = allClients.filter((client) => client.status === "Ativo" && client.monthlyValue !== undefined);
  const recurring = activeWithValue.reduce((total, client) => total + (client.monthlyValue ?? 0), 0);
  const activeContracts = contracts.filter((contract) => ["Assinado", "Aguardando assinatura", "Enviado"].includes(contract.status));

  const ask = async (event?: FormEvent<HTMLFormElement>, suggestedQuestion?: string) => {
    event?.preventDefault();
    const nextQuestion = (suggestedQuestion ?? question).trim();
    if (!nextQuestion || loading) return;
    setQuestion(nextQuestion); setLoading(true); setResult(null);
    try {
      const response = await fetch("/api/assistant/finance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: nextQuestion,
          contracts: contracts.map(({ status, amount, service, billingMode }) => ({ status, amount, service, billingMode })),
          clients: allClients.map(({ status, monthlyValue, service, payment }) => ({ status, monthlyValue, service, payment })),
        }),
      });
      const body = await response.json() as { answer?: string; calculation?: { label: string; value: string; formula: string }; assumptions?: string[]; source?: "openai" | "deterministic"; warning?: string; error?: string };
      const nextQuota = (body as typeof body & {quota?: {used: number; remaining: number; limit: number}}).quota;
      if (nextQuota) setQuota(nextQuota);
      if (!response.ok || !body.answer) throw new Error(body.error || "Não consegui analisar os valores agora.");
      setResult({ answer: body.answer, calculation: body.calculation, assumptions: body.assumptions, source: body.source, warning: body.warning });
    } catch (error) { toast.error(error instanceof Error ? error.message : "Não consegui responder agora."); }
    finally { setLoading(false); }
  };

  return <div className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(300px,.65fr)]">
    <section className="surface-card overflow-hidden">
      <div className="flex items-start justify-between gap-4 border-b bg-[linear-gradient(135deg,#102d29,#185f56)] p-5 text-white md:p-6"><div className="flex gap-3"><span className="grid size-11 shrink-0 place-items-center rounded-xl bg-white/12"><Sparkles className="size-5 text-[#f3d58c]" /></span><div><h3 className="text-lg font-semibold">Nexo · assistente de gestão</h3><p className="mt-1 max-w-xl text-sm leading-6 text-white/70">Pergunte sobre receita, contratos, metas e lacunas. O cálculo é feito pelo Vértice antes de a IA explicar.</p></div></div><Badge className="border-white/20 bg-white/10 text-white">Protótipo</Badge></div>
      <div className="space-y-5 p-5 md:p-6">
        <p className="rounded-xl border p-3 text-sm" role="status">{quota ? `${quota.remaining} de ${quota.limit} perguntas de IA disponíveis hoje no aplicativo.` : "Até 30 perguntas de IA por dia no aplicativo."} Cota compartilhada entre todos os participantes do teste, renovada à meia-noite (Brasília).</p>
        <div className="rounded-2xl bg-[#eef5f3] p-4 text-sm leading-6 text-[#315e58]"><b>Olá, sou o Nexo! Analiso somente os dados financeiros deste espaço.</b><span className="mt-1 block">Não envio nomes, contatos, documentos pessoais ou informações de saúde para a IA.</span></div>
        {result && <div className="rounded-2xl border border-[#c9ded9] bg-white p-5 shadow-sm"><div className="mb-3 flex items-center gap-2"><span className="grid size-8 place-items-center rounded-lg bg-[#dff3ef] text-[#0e665c]"><Sparkles className="size-4" /></span><span className="text-sm font-medium">Resposta do Nexo</span><Badge variant="outline" className="ml-auto">{result.source === "openai" ? "IA + cálculo conferido" : "Cálculo conferido"}</Badge></div><p className="leading-7 text-[#18302d]">{result.answer}</p>{result.calculation && <div className="mt-4 rounded-xl border bg-[#f8faf9] p-4"><p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">{result.calculation.label}</p><p className="mt-2 text-2xl font-semibold">{result.calculation.value}</p><p className="mt-1 text-xs text-muted-foreground">{result.calculation.formula}</p></div>}{result.warning && <p className="mt-3 text-xs text-amber-700">{result.warning}</p>}<details className="mt-4 text-sm text-muted-foreground"><summary className="cursor-pointer font-medium text-[#315e58]">Ver premissas do cálculo</summary><ul className="mt-2 list-disc space-y-1 pl-5">{result.assumptions?.map((assumption) => <li key={assumption}>{assumption}</li>)}</ul></details></div>}
        <div><p className="mb-2 text-sm font-medium">Experimente perguntar</p><div className="flex flex-wrap gap-2">{suggestions.map((suggestion) => <button type="button" key={suggestion} onClick={() => void ask(undefined, suggestion)} className="rounded-full border bg-white px-3 py-2 text-left text-sm text-[#315e58] transition-colors hover:border-[#75aaa2] hover:bg-[#edf7f5]">{suggestion}</button>)}</div></div>
        <form onSubmit={(event) => void ask(event)} className="rounded-2xl border bg-white p-3 shadow-sm"><Label htmlFor="finance-question" className="sr-only">Pergunta para o assistente financeiro</Label><Textarea id="finance-question" value={question} onChange={(event) => setQuestion(event.target.value)} rows={3} maxLength={1500} placeholder="Ex.: quantos contratos de R$ 450 preciso para chegar a R$ 5.000 por mês?" className="resize-none border-0 shadow-none focus-visible:ring-0" /><div className="mt-2 flex items-center justify-between gap-3 border-t px-1 pt-3"><p className="text-xs text-muted-foreground">Use valores e metas concretas para uma resposta mais precisa.</p><Button type="submit" disabled={loading || !question.trim()}>{loading ? "Analisando..." : "Perguntar"}</Button></div></form>
      </div>
    </section>
    <aside className="space-y-4"><section className="surface-card p-5"><p className="text-sm font-medium text-[#146d62]">Base desta análise</p><div className="mt-4 space-y-4"><Metric label="Receita mensal informada" value={brl.format(recurring)} /><Metric label="Clientes ativos com valor" value={String(activeWithValue.length)} /><Metric label="Contratos no fluxo ativo" value={String(activeContracts.length)} /><Metric label="Ticket médio informado" value={brl.format(activeWithValue.length ? recurring / activeWithValue.length : 0)} /></div></section><section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-950"><p className="font-medium">Limite importante do protótipo</p><p className="mt-2 leading-6 text-amber-800">Cobranças por aula, hora ou sessão só entram como projeção mensal quando a quantidade do mês estiver definida. Assim, a resposta não cria receita fictícia.</p></section></aside>
  </div>;
}

function ProfessionalProfileDialog({ open, setOpen, profile, onSubmit, onUseDemo }: { open: boolean; setOpen: (open: boolean) => void; profile: ProfessionalProfile; onSubmit: (event: FormEvent<HTMLFormElement>) => void; onUseDemo: () => void }) {
  return <Dialog open={open} onOpenChange={setOpen}><DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl"><DialogHeader><DialogTitle>Crie seu espaço profissional</DialogTitle><DialogDescription>Ao salvar, você começa com uma área limpa. A demonstração de Rafael Costa fica disponível separadamente.</DialogDescription></DialogHeader><form onSubmit={onSubmit} className="space-y-5"><div className="rounded-xl border border-[#c9ded9] bg-[#edf7f5] p-4 text-sm text-[#315e58]"><p className="font-medium">Seus dados não se misturam com os exemplos</p><p className="mt-1">Alunos, academias e contratos de Rafael somem do seu espaço e podem ser vistos novamente pelo botão “Ver demonstração”.</p></div><div className="grid gap-4 sm:grid-cols-2"><Field label="Nome profissional"><Input name="name" required defaultValue={profile.name === demoProfessional.name ? "" : profile.name} placeholder="Ex.: Bruno Andrade" /></Field><Field label="E-mail profissional"><Input name="email" type="email" required defaultValue={profile.name === demoProfessional.name ? "" : profile.email} placeholder="Usado na assinatura dos contratos" /></Field><div className="space-y-2"><Label>Área de atuação</Label><Select name="profession" defaultValue={profile.profession === demoProfessional.profession ? "Profissional de Educação Física" : profile.profession}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["Profissional de Educação Física","Personal trainer","Professor de artes marciais","Treinador de corrida","Fisioterapeuta","Terapeuta / profissional de cuidado","Estudante em fase de registro"].map((profession) => <SelectItem key={profession} value={profession}>{profession}</SelectItem>)}</SelectContent></Select></div><Field label="Registro profissional"><Input name="registration" required defaultValue={profile.registration === demoProfessional.registration ? "" : profile.registration} placeholder="Ex.: CREF 123456-G/SP" /></Field><div className="space-y-2"><Label>Estado do registro</Label><Select name="registrationState" defaultValue={profile.registrationState || "SP"}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"].map((state) => <SelectItem key={state} value={state}>{state}</SelectItem>)}</SelectContent></Select></div><Field label="Academia principal (opcional)"><Input name="mainOrganization" defaultValue={profile.mainOrganization === demoProfessional.mainOrganization ? "" : profile.mainOrganization} placeholder="Ou deixe como profissional autônomo" /></Field><Field label="Modalidades (opcional)"><Input name="specialties" defaultValue={profile.specialties === demoProfessional.specialties ? "" : profile.specialties} placeholder="Musculação, funcional, corrida..." /></Field></div><DialogFooter className="gap-2 sm:justify-between"><Button type="button" variant="ghost" onClick={onUseDemo}>Explorar como Rafael Costa</Button><Button type="submit"><CheckCircle2 />Criar meu espaço</Button></DialogFooter></form></DialogContent></Dialog>;
}

function CreateWorkDialog({ open, setOpen, clients: allClients, onSubmit }: { open: boolean; setOpen: (open: boolean) => void; clients: Client[]; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  const [type, setType] = useState<WorkType>("Aula coletiva");
  const identificationLabel = type === "Atendimento individual" ? "Aluno" : type === "Atendimento terapêutico" ? "Paciente, clínica ou contratante" : "Academia ou contratante";
  return <Dialog open={open} onOpenChange={setOpen}><DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl"><DialogHeader><DialogTitle>Adicionar atuação</DialogTitle><DialogDescription>Registre cada academia, aula ou atendimento como uma frente separada. Apenas identificação, início e valor são obrigatórios.</DialogDescription></DialogHeader><form onSubmit={onSubmit} className="space-y-5"><div className="grid gap-4 sm:grid-cols-2"><div className="space-y-2 sm:col-span-2"><Label>Tipo de atuação</Label><Select name="type" value={type} onValueChange={(value) => setType(value as WorkType)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Atendimento individual">Atendimento individual</SelectItem><SelectItem value="Aula coletiva">Aula coletiva</SelectItem><SelectItem value="Atendimento terapêutico">Atendimento terapêutico</SelectItem></SelectContent></Select></div><Field label={identificationLabel}><Input name="counterparty" required list="portfolio-counterparties" placeholder={type === "Aula coletiva" ? "Ex.: Academia Atlas" : "Selecione ou digite um nome"} /><datalist id="portfolio-counterparties">{allClients.map((client) => <option value={client.name} key={client.id} />)}</datalist></Field><div className="space-y-2"><Label>Modalidade <span className="font-normal text-muted-foreground">(opcional)</span></Label><Select name="activity"><SelectTrigger><SelectValue placeholder="Ex.: funcional, musculação..." /></SelectTrigger><SelectContent>{["Personal Training","Personal Recovery","Musculação","Funcional","Corrida","Treino híbrido","Alongamento","Dança","Pilates","Fisioterapia esportiva","Atendimento terapêutico"].map((activity) => <SelectItem value={activity} key={activity}>{activity}</SelectItem>)}</SelectContent></Select></div><Field label="Data de início"><Input name="startDate" type="date" required /></Field><Field label="Valor"><Input name="amount" type="number" min="0" step="0.01" required placeholder="120" /></Field><div className="space-y-2"><Label>Forma de cobrança <span className="font-normal text-muted-foreground">(opcional)</span></Label><Select name="billingMode"><SelectTrigger><SelectValue placeholder="Selecione se quiser" /></SelectTrigger><SelectContent>{["Por aula","Por hora","Por sessão","Por atendimento","Por aluno","Mensal","Pacote"].map((mode) => <SelectItem value={mode} key={mode}>{mode}</SelectItem>)}</SelectContent></Select></div><div className="space-y-2"><Label>Função profissional <span className="font-normal text-muted-foreground">(opcional)</span></Label><Select name="professionalRole"><SelectTrigger><SelectValue placeholder="Sua função neste trabalho" /></SelectTrigger><SelectContent>{["Personal trainer","Personal Recovery","Professor de funcional","Professor de musculação","Treinador de corrida","Fisioterapeuta","Terapeuta / profissional de cuidado"].map((role) => <SelectItem value={role} key={role}>{role}</SelectItem>)}</SelectContent></Select></div><Field label="Dias e horários (opcional)"><Input name="schedule" placeholder="Ex.: terças e quintas · 19h" /></Field>{type === "Aula coletiva" && <Field label="Quantidade de alunos (opcional)"><Input name="participantCount" type="number" min="1" placeholder="Pode deixar em branco" /></Field>}<div className="space-y-2 sm:col-span-2"><Label>Observações <span className="font-normal text-muted-foreground">(opcional)</span></Label><Input name="notes" placeholder="Taxa do local, particularidades da turma ou combinação comercial" /></div></div><label className="flex cursor-pointer items-start gap-3 rounded-xl border p-4 text-sm"><input name="hasContract" type="checkbox" className="mt-1 size-4 accent-[#0e665c]" /><span><b className="font-medium">Quero preparar um contrato.</b><span className="mt-1 block text-muted-foreground">Opcional. Se não marcar, a atuação será salva normalmente como “Sem contrato”.</span></span></label><DialogFooter><Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button><Button type="submit"><BriefcaseBusiness />Adicionar à carteira</Button></DialogFooter></form></DialogContent></Dialog>;
}

function CreateClientDialog({ open, setOpen, onSubmit }: { open: boolean; setOpen: (open: boolean) => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  const [entityType, setEntityType] = useState<EntityType>("Pessoa atendida");
  const [age, setAge] = useState<number | undefined>();
  const [needsSupport, setNeedsSupport] = useState(false);
  const categories = entityType === "Pessoa atendida" ? personCategories : organizationCategories;
  const ageGuidance = age !== undefined && (age < 18 || age >= 60);

  return <Dialog open={open} onOpenChange={setOpen}><DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl"><DialogHeader><DialogTitle>Novo cadastro</DialogTitle><DialogDescription>Cadastre agora e combine o valor depois, se preferir. Foto e contato de apoio ajudam a identificar e acompanhar cada pessoa.</DialogDescription></DialogHeader><form onSubmit={onSubmit} className="space-y-5"><div className="grid gap-4 sm:grid-cols-2">
    <div className="space-y-2"><Label>Tipo de cadastro</Label><Select name="entityType" value={entityType} onValueChange={(value) => { setEntityType(value as EntityType); if (value !== "Pessoa atendida") setNeedsSupport(false); }}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Pessoa atendida"><span className="flex items-center gap-2"><UserRound className="size-4" />Pessoa atendida</span></SelectItem><SelectItem value="Organização parceira"><span className="flex items-center gap-2"><Building2 className="size-4" />Organização parceira</span></SelectItem></SelectContent></Select></div>
    <div className="space-y-2"><Label>Categoria</Label><Select name="category" key={entityType} required><SelectTrigger><SelectValue placeholder="Selecione a categoria" /></SelectTrigger><SelectContent>{categories.map((category) => <SelectItem key={category} value={category}>{category}</SelectItem>)}</SelectContent></Select></div>
    <Field label={entityType === "Pessoa atendida" ? "Nome completo" : "Nome da organização"}><Input name="name" required placeholder={entityType === "Pessoa atendida" ? "Ex.: Marina Santos" : "Ex.: Arena Movimento"} /></Field>
    <Field label={entityType === "Pessoa atendida" ? "CPF (opcional)" : "CNPJ (opcional)"}><Input name="document" placeholder={entityType === "Pessoa atendida" ? "000.000.000-00" : "00.000.000/0001-00"} /></Field>
    {entityType === "Pessoa atendida" ? <>
      <Field label="Idade"><Input name="age" type="number" min="0" max="120" onChange={(event) => { const nextAge = event.target.value ? Number(event.target.value) : undefined; setAge(nextAge); if (nextAge !== undefined && (nextAge < 18 || nextAge >= 60)) setNeedsSupport(true); }} /></Field>
      <Field label="Contato de emergência"><Input name="emergencyContact" placeholder="Nome e telefone" /></Field>
      <div className="space-y-2 sm:col-span-2"><Label className="flex items-center gap-2"><Camera className="size-4" />Foto do aluno <span className="font-normal text-muted-foreground">(opcional)</span></Label><Input name="photo" type="file" accept="image/jpeg,image/png,image/webp" /><p className="text-xs text-muted-foreground">Ajuda a reconhecer rapidamente o aluno. A imagem é reduzida e salva apenas neste navegador.</p></div>
      <label className="flex cursor-pointer items-start gap-3 rounded-xl border p-4 text-sm sm:col-span-2"><input name="needsSupportContact" type="checkbox" checked={needsSupport} onChange={(event) => setNeedsSupport(event.target.checked)} className="mt-1 size-4 accent-[#0e665c]" /><span><b className="font-medium">Adicionar responsável ou contato de apoio</b><span className="mt-1 block text-muted-foreground">{ageGuidance ? age! < 18 ? "Recomendado para menor de 18 anos: informe o responsável legal." : "Opcional para pessoa 60+: informe alguém de confiança ou responsável financeiro, se ela desejar." : "Use para responsável legal, contato de apoio ou responsável financeiro."}</span></span></label>
      {needsSupport && <><Field label={age !== undefined && age < 18 ? "Nome do responsável legal" : "Nome do contato de apoio"}><Input name="supportName" required placeholder="Nome completo" /></Field><Field label="Parentesco ou vínculo"><Input name="supportRelationship" required placeholder="Ex.: mãe, filho, cuidador" /></Field><Field label="Telefone do responsável"><Input name="supportPhone" required placeholder="(11) 99999-9999" /></Field><label className="flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm"><input name="supportReceivesBilling" type="checkbox" className="size-4 accent-[#0e665c]" /><span>Enviar cobranças e lembretes para este contato</span></label></>}
    </> : <><Field label="Responsável pela parceria"><Input name="responsibleName" required placeholder="Nome do gestor ou responsável" /></Field><Field label="Endereço"><Input name="address" placeholder="Rua, número, cidade" /></Field></>}
    <Field label="E-mail"><Input name="email" type="email" required placeholder="contato@exemplo.com" /></Field>
    <Field label="Telefone"><Input name="phone" required placeholder="(11) 99999-9999" /></Field>
    <div className="space-y-2 sm:col-span-2"><Label htmlFor="service">Serviço principal</Label><Select name="service" required><SelectTrigger id="service"><SelectValue placeholder="Selecione um serviço" /></SelectTrigger><SelectContent>{services.map((service) => <SelectItem key={service.name} value={service.name}>{service.name}</SelectItem>)}</SelectContent></Select></div>
    <Field label={entityType === "Pessoa atendida" ? "Objetivo" : "Modelo da parceria"}><Input name="goal" placeholder={entityType === "Pessoa atendida" ? "Ex.: ganhar força" : "Ex.: prestação recorrente no espaço"} /></Field>
    <Field label="Valor mensal (opcional)"><Input name="value" type="number" min="0" placeholder="Pode ser definido no contrato" /></Field>
    {entityType === "Pessoa atendida" && <div className="space-y-2 sm:col-span-2"><Label>Restrições e alertas</Label><Input name="restrictions" placeholder="Lesões, condições ou cuidados importantes" /></div>}
    {entityType === "Pessoa atendida" && <div className="sm:col-span-2"><RelationshipFields /></div>}
  </div><DialogFooter><Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button><Button type="submit">Cadastrar</Button></DialogFooter></form></DialogContent></Dialog>;
}

function CreateContractDialog({ open, setOpen, clients: allClients, onSubmit }: { open: boolean; setOpen: (open: boolean) => void; clients: Client[]; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  return <Dialog open={open} onOpenChange={setOpen}><DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl"><DialogHeader><DialogTitle>Criar contrato em PDF</DialogTitle><DialogDescription>Defina a parte contratante, o serviço e a vigência. O documento poderá ser visualizado, baixado e enviado para assinatura.</DialogDescription></DialogHeader><form onSubmit={onSubmit} className="space-y-5"><div className="grid gap-4 sm:grid-cols-2"><div className="space-y-2 sm:col-span-2"><Label>Parte contratante</Label><Select name="clientId" required><SelectTrigger><SelectValue placeholder="Selecione aluno, paciente ou organização" /></SelectTrigger><SelectContent>{allClients.map((client) => <SelectItem value={String(client.id)} key={client.id}>{client.name} · {client.category ?? "Aluno"}</SelectItem>)}</SelectContent></Select></div><div className="space-y-2 sm:col-span-2"><Label>Modelo</Label><Select name="template" defaultValue="Prestação de serviços"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Prestação de serviços">Prestação de serviços</SelectItem><SelectItem value="Prestação de serviços — Fisio">Prestação de serviços — Fisioterapia</SelectItem><SelectItem value="Parceria com academia ou estúdio">Parceria com academia ou estúdio</SelectItem><SelectItem value="Assessoria esportiva">Assessoria esportiva</SelectItem></SelectContent></Select></div><Field label="Serviço"><Input name="service" required placeholder="Ex.: Personal Training" /></Field><Field label="Valor contratado"><Input name="amount" type="number" min="0" required placeholder="480" /></Field><div className="space-y-2"><Label>Forma de cobrança</Label><Select name="billingMode" required><SelectTrigger><SelectValue placeholder="Selecione a forma combinada" /></SelectTrigger><SelectContent>{["Por aula","Por hora","Por sessão","Por atendimento","Por aluno","Mensal","Pacote"].map((mode) => <SelectItem value={mode} key={mode}>{mode}</SelectItem>)}</SelectContent></Select></div><Field label="Frequência combinada (opcional)"><Input name="frequency" placeholder="Ex.: 3x por semana" /></Field><div className="sm:col-span-2"><Field label="Dias e horários (opcional)"><Input name="schedule" placeholder="Ex.: segundas, quartas e quintas · manhã" /></Field></div><Field label="Data de início"><Input name="startDate" type="date" required /></Field><Field label="Data de término"><Input name="endDate" type="date" required /></Field><div className="space-y-2 sm:col-span-2"><Label>Política de cancelamento</Label><Input name="cancellationPolicy" defaultValue="Cancelamento com aviso prévio de 30 dias." required /></div><div className="space-y-2 sm:col-span-2"><Label>Condições específicas do contrato <span className="font-normal text-muted-foreground">(opcional)</span></Label><Textarea name="customTerms" rows={6} placeholder="Descreva particularidades deste aluno ou academia: adaptações do atendimento, frequência, local, materiais fornecidos, taxas adicionais, responsabilidades ou qualquer condição combinada." /><p className="text-xs text-muted-foreground">O texto será incluído integralmente no PDF antes da seção de responsabilidades.</p></div></div><DialogFooter><Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button><Button type="submit"><FileText />Criar contrato</Button></DialogFooter></form></DialogContent></Dialog>;
}

function HealthDocumentDialog({ open, setOpen, client, type, onSubmit }: { open: boolean; setOpen: (open: boolean) => void; client?: Client; type: HealthDocumentType; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  const questions = [
    "Algum médico já recomendou atividade física apenas com supervisão?",
    "Sente dor no peito durante atividade física?",
    "Sentiu dor no peito recentemente em repouso?",
    "Teve tontura, perda de equilíbrio ou de consciência?",
    "Possui problema ósseo ou articular que possa piorar com exercício?",
    "Usa medicamento para pressão ou condição cardíaca?",
    "Conhece outra razão para não praticar atividade física?",
  ];
  return <Dialog open={open} onOpenChange={setOpen}><DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl"><DialogHeader><DialogTitle>{type === "parq" ? "PAR-Q — prontidão para atividade física" : "Ficha de anamnese"}</DialogTitle><DialogDescription>Preenchimento interno demonstrativo para {client?.name}. A assinatura ficará registrada neste navegador.</DialogDescription></DialogHeader><form onSubmit={onSubmit} className="space-y-5">{type === "anamnesis" ? <div className="grid gap-4 sm:grid-cols-2"><Field label="Condições de saúde"><Input name="conditions" placeholder="Ex.: hipertensão controlada" /></Field><Field label="Medicamentos em uso"><Input name="medications" placeholder="Nome e dosagem, se houver" /></Field><Field label="Lesões ou cirurgias anteriores"><Input name="injuries" placeholder="Ex.: cirurgia no joelho em 2022" /></Field><Field label="Contato de emergência"><Input name="emergency" defaultValue={client?.emergencyContact} placeholder="Nome e telefone" /></Field><div className="sm:col-span-2"><Field label="Observações importantes"><Input name="notes" defaultValue={client?.restrictions} placeholder="Cuidados e orientações relevantes" /></Field></div></div> : <div className="space-y-3"><p className="text-sm text-muted-foreground">Marque apenas as perguntas cuja resposta seja “sim”. Uma resposta positiva deve ser revisada antes de aumentar o nível de atividade.</p>{questions.map((question, index) => <label key={question} className="flex cursor-pointer items-start gap-3 rounded-xl border p-3 text-sm"><input name={`parq-${index}`} type="checkbox" className="mt-1 size-4 accent-[#0e665c]" /><span><b className="mr-1">{index + 1}.</b>{question}</span></label>)}</div>}<Field label="Nome de quem assina"><Input name="signerName" required defaultValue={client?.supportName || client?.name} /></Field><label className="flex cursor-pointer items-start gap-3 rounded-xl border p-4 text-sm"><input name="accepted" type="checkbox" required className="mt-1 size-4 accent-[#0e665c]" /><span><b className="font-medium">Declaro que li e respondi com informações verdadeiras.</b><span className="mt-1 block text-muted-foreground">Entendo que este formulário não substitui avaliação ou atestado médico quando necessários.</span></span></label><DialogFooter><Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button><Button type="submit"><FileSignature />Assinar documento</Button></DialogFooter></form></DialogContent></Dialog>;
}

function SignatureDialog({ open, setOpen, contract, client, onSubmit }: { open: boolean; setOpen: (open: boolean) => void; contract?: Contract; client?: Client; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  const signer = client?.age !== undefined && client.age < 18 && client.supportName ? client.supportName : contract?.client;
  return <Dialog open={open} onOpenChange={setOpen}><DialogContent className="sm:max-w-lg"><DialogHeader><DialogTitle>Assinar eletronicamente</DialogTitle><DialogDescription>Revise os dados e registre o aceite de {contract?.client}. O Vértice gravará data, hora e código de evidência.</DialogDescription></DialogHeader><form onSubmit={onSubmit} className="space-y-5"><div className="rounded-xl border bg-[#f4f7f6] p-4 text-sm"><p className="font-medium">{contract?.template}</p><p className="mt-1 text-muted-foreground">{contract?.service} · {brl.format(contract?.amount ?? 0)} · {contract?.startDate} a {contract?.endDate}</p>{client?.supportName && <p className="mt-2 text-xs text-muted-foreground">Responsável/apoio: {client.supportName} · {client.supportRelationship}</p>}</div><Field label="Nome de quem assina"><Input name="signerName" required defaultValue={signer} /></Field><Field label="CPF ou documento"><Input name="signerDocument" required placeholder="Documento do signatário" /></Field><label className="flex cursor-pointer items-start gap-3 rounded-xl border p-4 text-sm"><input name="accepted" type="checkbox" required className="mt-1 size-4 accent-[#0e665c]" /><span><b className="font-medium">Li e concordo com o contrato.</b><span className="mt-1 block text-muted-foreground">Confirmo que tenho poderes para assinar e aceito o registro eletrônico desta manifestação.</span></span></label><div className="flex items-start gap-2 rounded-lg bg-blue-50 p-3 text-xs text-blue-800"><CheckCircle2 className="mt-0.5 size-4 shrink-0" />A assinatura interna é funcional para validação do MVP. A versão comercial deverá integrar um provedor homologado.</div><DialogFooter><Button type="button" variant="outline" onClick={() => setOpen(false)}>Voltar</Button><Button type="submit"><FileSignature />Confirmar assinatura</Button></DialogFooter></form></DialogContent></Dialog>;
}

function PageHeading({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action: React.ReactNode }) { return <section className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="mb-2 text-sm font-medium text-[#146d62]">{eyebrow}</p><h2 className="text-2xl font-semibold tracking-[-0.03em] md:text-3xl">{title}</h2><p className="mt-2 text-sm text-muted-foreground">{description}</p></div>{action}</section>; }
function Avatar({ name, photoUrl, large = false }: { name: string; photoUrl?: string; large?: boolean }) { const initials = name.split(" ").map((part) => part[0]).slice(0,2).join(""); const classes = `grid shrink-0 place-items-center overflow-hidden rounded-full bg-[#dcebe8] font-bold text-[#315e58] ${large ? "size-16 text-lg" : "size-10 text-xs"}`; return <span className={classes}>{photoUrl ? <img src={photoUrl} alt={`Foto de ${name}`} className="size-full object-cover" /> : initials}</span>; }
function Filter({ value, setValue, label, options }: { value: string; setValue: (value: string) => void; label: string; options: string[] }) { return <Select value={value} onValueChange={setValue}><SelectTrigger className="w-full xl:w-48"><SelectValue placeholder={label} /></SelectTrigger><SelectContent><SelectItem value="all">{label}: todos</SelectItem>{options.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}</SelectContent></Select>; }
function InfoCard({ title, children }: { title: string; children: React.ReactNode }) { return <section className="surface-card p-5 md:p-6"><h3 className="mb-5 font-semibold">{title}</h3><div className="text-sm leading-6">{children}</div></section>; }
function HealthDocumentCard({ title, description, status, onOpen, onDownload }: { title: string; description: string; status: "Pendente" | "Assinado"; onOpen: () => void; onDownload: () => void }) { return <section className="surface-card p-5 md:p-6"><div className="flex items-start justify-between gap-4"><span className="grid size-11 place-items-center rounded-xl bg-[#e6f1ef] text-[#146d62]"><ClipboardCheck className="size-5" /></span><StatusBadge>{status}</StatusBadge></div><h3 className="mt-5 font-semibold">{title}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p><div className="mt-5 flex flex-wrap gap-2"><Button size="sm" onClick={onOpen}><FileSignature />{status === "Assinado" ? "Assinar novamente" : "Preencher e assinar"}</Button>{status === "Assinado" && <Button size="sm" variant="outline" onClick={onDownload}><Download />Baixar PDF</Button>}</div></section>; }
function Metric({ label, value }: { label: string; value: string }) { return <div className="rounded-xl bg-[#f2f7f6] p-4"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 text-xl font-semibold">{value}</p></div>; }
function Collaborator({ name, role, initials }: { name: string; role: string; initials: string }) { return <section className="surface-card flex items-center gap-4 p-5"><span className="grid size-12 place-items-center rounded-full bg-[#dcebe8] text-sm font-bold text-[#315e58]">{initials}</span><div><p className="font-medium">{name}</p><p className="mt-1 text-sm text-muted-foreground">{role}</p></div></section>; }
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <div className="space-y-2"><Label>{label}</Label>{children}</div>; }
