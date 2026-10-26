export type ClientStatus = "Ativo" | "Teste" | "Pausado" | "Inativo" | "Concluído";
export type PaymentStatus = "Pago" | "Pendente" | "Atrasado" | "Cancelado";
export type RiskStatus = "Saudável" | "Atenção" | "Em risco";
export type EntityType = "Pessoa atendida" | "Organização parceira";

export type Client = {
  relationship?: import("./crm").Relationship;
  id: number;
  name: string;
  age: number;
  email: string;
  phone: string;
  service: string;
  professional: string;
  status: ClientStatus;
  monthlyValue?: number;
  lastSession: string;
  payment: PaymentStatus;
  risk: RiskStatus;
  nextAppointment: string;
  goal: string;
  notes: string;
  restrictions: string;
  progress: number;
  entityType?: EntityType;
  category?: string;
  document?: string;
  responsibleName?: string;
  address?: string;
  emergencyContact?: string;
  photoUrl?: string;
  needsSupportContact?: boolean;
  supportName?: string;
  supportRelationship?: string;
  supportPhone?: string;
  supportReceivesBilling?: boolean;
  anamnesisStatus?: "Pendente" | "Assinado";
  parqStatus?: "Pendente" | "Assinado";
  healthDocumentSignedAt?: string;
};

const clientSeed: Omit<Client, "id">[] = [
  ["Ana Souza",32,"ana@exemplo.com","(11) 98812-4102","Personal Training","Rafael Costa","Ativo",480,"12/09/2026","Pago","Em risco","30/09 às 07:00","Ganhar força e manter constância","Prefere treinos pela manhã.","Desconforto leve no ombro direito",62],
  ["Pedro Lima",41,"pedro@exemplo.com","(11) 97731-8830","Running Coaching","Rafael Costa","Ativo",320,"24/09/2026","Atrasado","Atenção","29/09 às 18:00","Completar a primeira meia maratona","Aumentou volume nas últimas duas semanas.","Sem restrições atuais",74],
  ["Marcos Silva",36,"marcos@exemplo.com","(11) 96553-2201","Fisioterapia Esportiva","Dra. Beatriz Nunes","Ativo",600,"25/09/2026","Pago","Atenção","01/10 às 15:00","Retorno seguro à corrida","Reavaliação funcional agendada.","Pós-lesão de panturrilha",48],
  ["Beatriz Alves",28,"beatriz@exemplo.com","(11) 99102-6544","Hybrid Training","Rafael Costa","Ativo",520,"26/09/2026","Pago","Saudável","29/09 às 12:00","Preparação para HYROX","Ótima aderência nas últimas 8 semanas.","Sem restrições",86],
  ["Lucas Rocha",45,"lucas@exemplo.com","(11) 95448-0729","Personal Training","Rafael Costa","Pausado",450,"03/09/2026","Pendente","Atenção","Sem agendamento","Redução de gordura corporal","Pausa por viagem até outubro.","Hipertensão controlada",39],
  ["Carla Mendes",39,"carla@exemplo.com","(11) 98840-3312","Group Class","Camila Freitas","Ativo",180,"27/09/2026","Pago","Saudável","30/09 às 19:00","Condicionamento geral","Participa de duas aulas por semana.","Sem restrições",79],
  ["Felipe Costa",25,"felipe@exemplo.com","(11) 97312-6150","Running Coaching","Rafael Costa","Teste",280,"22/09/2026","Pendente","Atenção","02/10 às 06:30","Correr 10 km abaixo de 50 minutos","Semana de teste em andamento.","Canelite prévia",51],
  ["Helena Duarte",52,"helena@exemplo.com","(11) 98223-0190","Fisioterapia Esportiva","Dra. Beatriz Nunes","Ativo",720,"23/09/2026","Pago","Saudável","29/09 às 10:00","Recuperar mobilidade do quadril","Boa evolução de dor e amplitude.","Artrose leve de quadril",68],
  ["João Vieira",34,"joao@exemplo.com","(11) 97887-4420","Personal Training","Rafael Costa","Ativo",480,"18/09/2026","Atrasado","Em risco","01/10 às 08:00","Força e hipertrofia","Faltou às duas últimas sessões.","Sem restrições",44],
  ["Larissa Prado",30,"larissa@exemplo.com","(11) 96652-3308","Hybrid Training","Rafael Costa","Ativo",520,"27/09/2026","Pago","Saudável","29/09 às 17:00","Performance híbrida","Ciclo atual com foco em capacidade aeróbia.","Sem restrições",91],
  ["Rita Barros",47,"rita@exemplo.com","(11) 95220-1677","Group Class","Camila Freitas","Inativo",180,"11/08/2026","Cancelado","Atenção","Sem agendamento","Melhorar disposição","Interrompeu por mudança de horário.","Lombalgia recorrente",23],
  ["Thiago Nunes",29,"thiago@exemplo.com","(11) 99218-8760","Running Coaching","Rafael Costa","Ativo",320,"26/09/2026","Pago","Saudável","30/09 às 06:00","Maratona de São Paulo","Longão concluído sem intercorrências.","Sem restrições",83],
  ["Camila Torres",38,"camila@exemplo.com","(11) 97663-4901","Personal Training","Rafael Costa","Ativo",450,"25/09/2026","Pago","Saudável","30/09 às 09:00","Mobilidade e força","Renovação prevista para outubro.","Protusão lombar assintomática",72],
  ["Eduardo Melo",43,"eduardo@exemplo.com","(11) 96711-8852","Fisioterapia Esportiva","Dra. Beatriz Nunes","Concluído",600,"08/09/2026","Pago","Saudável","Alta concluída","Retorno ao futebol","Alta com plano preventivo.","Reconstrução de LCA prévia",100],
  ["Fernanda Reis",31,"fernanda@exemplo.com","(11) 98873-1140","Hybrid Training","Rafael Costa","Ativo",520,"21/09/2026","Pendente","Atenção","01/10 às 16:00","Completar primeira prova híbrida","Reduziu frequência por trabalho.","Sem restrições",57],
  ["Gabriel Luz",27,"gabriel@exemplo.com","(11) 97505-2237","Personal Training","Rafael Costa","Ativo",480,"26/09/2026","Pago","Saudável","29/09 às 14:00","Ganho de massa magra","Mantém boa progressão de cargas.","Sem restrições",81],
  ["Isabela Moraes",35,"isabela@exemplo.com","(11) 98621-5532","Running Coaching","Rafael Costa","Ativo",320,"13/09/2026","Atrasado","Em risco","30/09 às 18:30","Voltar a correr com regularidade","Não registra atividade há 15 dias.","Histórico de fascite plantar",36],
  ["Nina Carvalho",33,"nina@exemplo.com","(11) 99277-0871","Group Class","Camila Freitas","Ativo",180,"27/09/2026","Pago","Saudável","29/09 às 19:00","Bem-estar e socialização","Presença consistente.","Sem restrições",88],
  ["Otávio Martins",50,"otavio@exemplo.com","(11) 96411-2250","Fisioterapia Esportiva","Dra. Beatriz Nunes","Ativo",720,"24/09/2026","Pago","Atenção","02/10 às 11:00","Reduzir dor no joelho","Evolução gradual; revisar carga.","Condropatia patelar",55],
  ["Paula Azevedo",26,"paula@exemplo.com","(11) 98910-4406","Personal Training","Rafael Costa","Teste",450,"26/09/2026","Pendente","Saudável","30/09 às 11:00","Criar rotina de treino","Avaliação inicial concluída.","Sem restrições",18],
].map((row) => ({ name: row[0], age: row[1], email: row[2], phone: row[3], service: row[4], professional: row[5], status: row[6], monthlyValue: row[7], lastSession: row[8], payment: row[9], risk: row[10], nextAppointment: row[11], goal: row[12], notes: row[13], restrictions: row[14], progress: row[15] })) as Omit<Client, "id">[];

export const clients: Client[] = clientSeed.map((client, index) => ({ ...client, id: index + 1, relationship: index < 3 ? { interests: [["Musculação", "Corrida"], ["Treino híbrido", "Funcional"], ["Lutas", "Futebol"]][index], goals: ["Criar constância"], preferences: ["Individual", "Manhã"] } : undefined }));

export const services = [
  { name: "Personal Recovery", category: "Treinamento", price: undefined, frequency: "Por sessão", capacity: 1 },
  { name: "Personal Training", category: "Treinamento", price: 480, frequency: "Mensal", capacity: 1 },
  { name: "Running Coaching", category: "Corrida", price: 320, frequency: "Mensal", capacity: 30 },
  { name: "Hybrid Training", category: "Performance", price: 520, frequency: "Mensal", capacity: 12 },
  { name: "Funcional", category: "Aula coletiva", price: 220, frequency: "Mensal", capacity: 20 },
  { name: "Musculação", category: "Treinamento", price: 480, frequency: "Mensal", capacity: 1 },
  { name: "Alongamento", category: "Aula coletiva", price: 180, frequency: "Mensal", capacity: 0 },
  { name: "Dança", category: "Aula coletiva", price: 180, frequency: "Mensal", capacity: 0 },
  { name: "Fisioterapia Esportiva", category: "Fisioterapia", price: 600, frequency: "Pacote", capacity: 1 },
  { name: "Atendimento terapêutico", category: "Terapia", price: 450, frequency: "Pacote", capacity: 1 },
  { name: "Group Class", category: "Aula coletiva", price: 180, frequency: "Mensal", capacity: 16 },
];

export type WorkType = "Atendimento individual" | "Aula coletiva" | "Atendimento terapêutico";
export type WorkEngagement = {
  id: number;
  type: WorkType;
  counterparty: string;
  activity?: string;
  professionalRole?: string;
  startDate: string;
  amount: number;
  billingMode?: string;
  schedule?: string;
  participantCount?: number;
  notes?: string;
  contractStatus: "Sem contrato" | "Rascunho" | "Assinado";
};

export const workEngagements: WorkEngagement[] = [
  { id: 1, type: "Aula coletiva", counterparty: "Academia Atlas", activity: "Funcional", professionalRole: "Personal trainer", startDate: "01/08/2026", amount: 90, billingMode: "Por aula", schedule: "Terças e quintas · 19h", participantCount: 18, contractStatus: "Sem contrato" },
  { id: 2, type: "Aula coletiva", counterparty: "Studio Base", activity: "Musculação", professionalRole: "Personal trainer", startDate: "15/07/2026", amount: 120, billingMode: "Por hora", schedule: "Segundas, quartas e sextas · 18h", contractStatus: "Assinado" },
  { id: 3, type: "Aula coletiva", counterparty: "Arena Sul", activity: "Corrida em grupo", professionalRole: "Treinador de corrida", startDate: "05/09/2026", amount: 450, billingMode: "Mensal", schedule: "Sábados · 07h", contractStatus: "Sem contrato" },
  { id: 4, type: "Atendimento individual", counterparty: "Ana Souza", activity: "Personal Training", professionalRole: "Personal trainer", startDate: "12/04/2026", amount: 120, billingMode: "Por sessão", schedule: "Segundas e quartas · 07h", contractStatus: "Rascunho" },
  { id: 5, type: "Atendimento terapêutico", counterparty: "Clínica Movimento", activity: "Fisioterapia esportiva", professionalRole: "Fisioterapeuta", startDate: "03/06/2026", amount: 160, billingMode: "Por atendimento", schedule: "Terças · 15h", contractStatus: "Sem contrato" },
];

const paymentMethods = ["Pix", "Cartão", "Boleto", "Pix", "Externo"];
export const payments = Array.from({ length: 25 }, (_, index) => {
  const client = clients[index % clients.length];
  const status: PaymentStatus = index === 1 || index === 8 || index === 16 ? "Atrasado" : index % 7 === 0 ? "Pendente" : "Pago";
  return { id: index + 1, client: client.name, service: client.service, amount: client.monthlyValue ?? 0, dueDate: `${String((index % 22) + 2).padStart(2, "0")}/09/2026`, status, method: paymentMethods[index % paymentMethods.length] };
});

export type ContractStatus = "Rascunho" | "Enviado" | "Aguardando assinatura" | "Assinado" | "Expirado";
export type Contract = {
  id: number;
  client: string;
  clientId: number;
  template: string;
  service: string;
  amount: number;
  startDate: string;
  endDate: string;
  cancellationPolicy: string;
  billingMode?: string;
  frequency?: string;
  schedule?: string;
  customTerms?: string;
  status: ContractStatus;
  signerName?: string;
  signerDocument?: string;
  signedAt?: string;
  evidenceId?: string;
  professionalName?: string;
  signatureProvider?: "ZapSign Sandbox" | "Vértice MVP";
  zapSignDocumentToken?: string;
  zapSignSignerToken?: string;
  zapSignProfessionalSignerToken?: string;
  signUrl?: string;
  professionalSignUrl?: string;
};
export const contracts: Contract[] = clients.slice(0, 10).map((client, index) => ({
  id: index + 1,
  client: client.name,
  clientId: client.id,
  template: index === 2 || index === 7 ? "Prestação de serviços — Fisio" : "Prestação de serviços",
  service: client.service,
  amount: client.monthlyValue ?? 0,
  startDate: `${String(index + 1).padStart(2, "0")}/04/2026`,
  endDate: `${String(index + 1).padStart(2, "0")}/10/2026`,
  cancellationPolicy: "Cancelamento com aviso prévio de 30 dias.",
  billingMode: index % 3 === 0 ? "Por sessão" : index % 3 === 1 ? "Mensal" : "Por atendimento",
  frequency: index % 2 === 0 ? "2x por semana" : "3x por semana",
  schedule: index % 2 === 0 ? "Segundas e quartas · 07h" : "Terças, quintas e sábados · 18h",
  customTerms: index === 0 ? "O atendimento será adaptado às limitações do ombro direito e às preferências de horário registradas na avaliação inicial." : undefined,
  status: (["Assinado", "Assinado", "Aguardando assinatura", "Assinado", "Expirado", "Enviado", "Assinado", "Rascunho", "Assinado", "Aguardando assinatura"] as ContractStatus[])[index],
}));

export const activity = [
  { date: "26 set", type: "Sessão concluída", detail: "Treino de força · 55 min", accent: "success" },
  { date: "22 set", type: "Avaliação registrada", detail: "Evolução funcional atualizada", accent: "info" },
  { date: "19 set", type: "Ausência", detail: "Sessão cancelada com antecedência", accent: "warning" },
  { date: "15 set", type: "Marco alcançado", detail: "8 semanas de acompanhamento", accent: "success" },
];
