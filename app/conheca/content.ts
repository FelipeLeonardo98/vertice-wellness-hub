// Conteúdo da página comercial. Pessoas, academias e valores são fictícios.
// Antes de editar promessas, confira AGENTS.md: nada de cobrança real, prescrição
// de treino, assinatura de produção ou sincronização entre dispositivos como prontos.

export const whatsapp =
  "https://wa.me/5513991399408?text=" +
  encodeURIComponent("Olá, Felipe! Vi o site do Vértice e quero agendar uma demonstração. Trabalho como: ");

export type Media = {
  id: string;
  kind: "video" | "print";
  title: string;
  caption: string;
  src: string;
  poster?: string;
  length?: string;
  transcript?: string;
};

export const videos: Media[] = [
  {
    id: "ver-negocio",
    kind: "video",
    title: "Seu trabalho vai além da aula",
    caption: "Academia, alunos e combinados: a visão geral do Vértice.",
    src: "/marketing/videos/vertice-pitch-negocio-20s.mp4",
    poster: "/marketing/videos/vertice-pitch-negocio-20s.png",
    length: "20 s",
    transcript:
      "Um professor atua na Academia Aurora e atende os próprios alunos. Horários e acordos viram cadastros, atuações e contratos, registrados por ele. O Nexo sugere uma conversa sobre a assessoria de corrida a partir de um interesse declarado, para revisão do profissional.",
  },
  {
    id: "ver-personal",
    kind: "video",
    title: "Chegou aluno novo?",
    caption: "Do cadastro com valor a combinar ao contrato em PDF.",
    src: "/marketing/videos/vertice-personal-15s.mp4",
    poster: "/marketing/videos/vertice-personal-15s.png",
    length: "15 s",
    transcript:
      "Uma aluna começa o personal com o valor ainda a combinar. O profissional registra as condições, cria o contrato e confere o PDF.",
  },
  {
    id: "ver-professor",
    kind: "video",
    title: "Professor, sua semana é assim?",
    caption: "Várias academias, personais e coletivas, cada uma com seu combinado.",
    src: "/marketing/videos/vertice-professor-academias-20s.mp4",
    poster: "/marketing/videos/vertice-professor-academias-20s.png",
    length: "20 s",
    transcript:
      "Aurora pela manhã, personais à tarde, coletivas na Prisma e Horizonte à noite. O que ficou combinado com cada academia e com cada aluno? Cada parceria ganha cadastro, condições e contrato em PDF.",
  },
  {
    id: "ver-acolhimento",
    kind: "video",
    title: "O treino muda. O cuidado continua.",
    caption: "Corrida, luta e condicionamento: quem contatar e o que saber de cada aluno.",
    src: "/marketing/videos/vertice-acolhimento-20s.mp4",
    poster: "/marketing/videos/vertice-acolhimento-20s.png",
    length: "20 s",
    transcript:
      "Lucas quer completar os primeiros 10 km, Bia tem 16 anos e treina luta, Helena tem 67 anos e busca mais disposição. Anamnese, PAR-Q e contatos ficam no perfil: emergência, responsável legal e contato de apoio. Os documentos não representam liberação médica.",
  },
];

export const prints: Media[] = [
  { id: "tela-painel", kind: "print", title: "Painel do dia", caption: "Alunos ativos, receita prevista, contratos e o que pede atenção hoje.", src: "/apresentacao/dashboard.png" },
  { id: "tela-alunos", kind: "print", title: "Alunos e parceiros", caption: "Pessoas atendidas e academias no mesmo cadastro, com serviço, valor e documentos.", src: "/apresentacao/clientes.png" },
  { id: "tela-contratos", kind: "print", title: "Contratos", caption: "Condições, vigência e status de cada acordo, com PDF.", src: "/apresentacao/contratos.png" },
  { id: "tela-nexo", kind: "print", title: "Nexo", caption: "Sugestões de conversa a partir de interesses que o aluno declarou.", src: "/apresentacao/nexo.png" },
];

export const pains = [
  {
    quote: "Cada academia paga de um jeito. O que combinei com a Prisma está num áudio de março.",
    who: "Professor em três academias",
    answer: "Cadastre a academia, registre a atuação com valor por hora e horários e gere o contrato de parceria em PDF.",
    media: "ver-professor",
    cta: "Ver o vídeo do professor",
  },
  {
    quote: "Aluno novo começou ontem. O valor? A gente acerta depois.",
    who: "Personal trainer",
    answer: "O cadastro aceita valor a combinar. Quando fechar, o contrato registra preço, frequência, vigência e cancelamento.",
    media: "ver-personal",
    cta: "Ver o vídeo do personal",
  },
  {
    quote: "Tenho uma aluna de 67 anos e uma atleta de 16. Se acontecer algo, quem eu chamo?",
    who: "Treinadora de luta e condicionamento",
    answer: "Contato de apoio, responsável legal, anamnese e PAR-Q ficam no perfil de cada aluno.",
    media: "ver-acolhimento",
    cta: "Ver o vídeo de acolhimento",
  },
  {
    quote: "Fim do mês e eu não sei direito quem já pagou.",
    who: "Personal com 20 alunos",
    answer: "As pendências aparecem no painel. O lembrete abre no WhatsApp com a mensagem pronta, e você revisa antes de enviar.",
    media: "tela-painel",
    cta: "Ver a tela do painel",
  },
  {
    quote: "Metade dos meus alunos corre, e eu nunca ofereci a assessoria.",
    who: "Treinador de corrida",
    answer: "O Nexo cruza interesses declarados com os serviços que você oferece e sugere com quem conversar.",
    media: "tela-nexo",
    cta: "Ver a tela do Nexo",
  },
];

export type Status = "Disponível" | "Demonstrativo" | "Em teste" | "Experimental";

export const statusHelp: Record<Status, string> = {
  Disponível: "Funciona na demonstração e no seu espaço pessoal.",
  Demonstrativo: "Mostra o fluxo com dados de exemplo; parte das informações ainda não é salva.",
  "Em teste": "Integração externa em ambiente de testes, sem validade de produção.",
  Experimental: "Usa IA, com limite diário de uso e revisão sempre sua.",
};

export const journeys: { audience: string; title: string; body: string; status: Status; detail: string }[] = [
  { audience: "Para começar", title: "Seu espaço de trabalho", body: "Explore a demonstração e crie seu perfil, seus alunos e parceiros.", status: "Disponível", detail: "Os dados do seu espaço ficam salvos neste navegador. Ainda não há conta na nuvem nem acesso por outro aparelho." },
  { audience: "Personal trainers", title: "Do aluno novo ao contrato", body: "Cadastro, objetivo, condições do acompanhamento e PDF.", status: "Disponível", detail: "Criar o contrato não atualiza sozinho o valor do perfil nem gera cobrança." },
  { audience: "Professores", title: "Parcerias com academias e estúdios", body: "Academia, atuação, valor por hora, agenda e contrato de parceria.", status: "Disponível", detail: "O sistema não calcula horas trabalhadas nem taxas automaticamente." },
  { audience: "Assessorias de corrida", title: "O objetivo de cada atleta", body: "Meta, alertas e contratação da assessoria em PDF.", status: "Disponível", detail: "Não inclui prescrição de treino, GPS nem integração com relógios." },
  { audience: "Financeiro", title: "Da pendência ao lembrete", body: "Encontre um atraso e abra o WhatsApp com a mensagem pronta.", status: "Demonstrativo", detail: "Pagamentos de exemplo. O envio é manual, um por vez, sem cobrança automática ou conciliação bancária." },
  { audience: "Acolhimento", title: "Anamnese, PAR-Q e contato de apoio", body: "Conheça o aluno antes do primeiro treino.", status: "Demonstrativo", detail: "O sistema guarda status, data e PDF, mas não todas as respostas do formulário. Não substitui liberação médica." },
  { audience: "Contratos", title: "Assinatura digital", body: "Envio para assinatura do profissional e do aluno pelo ZapSign.", status: "Em teste", detail: "Funciona no ambiente sandbox do ZapSign. Ainda não é assinatura com validade de produção." },
  { audience: "Financeiro", title: "Assistente financeiro", body: "Pergunte sobre seus números e veja o cálculo por trás da resposta.", status: "Experimental", detail: "Não executa transações. Até 30 consultas por dia, compartilhadas com o Nexo." },
  { audience: "Relacionamento", title: "Nexo", body: "Sugestões de conversa a partir dos interesses de cada aluno.", status: "Experimental", detail: "A IA não recebe nomes, contatos, dados de saúde nem observações livres. Você revisa antes de qualquer contato." },
];

export const faqs: [string, string][] = [
  ["Preciso largar o aplicativo que uso para montar treinos?", "Não. O Vértice não monta treinos. Ele cuida da parte de negócio: alunos, academias parceiras, contratos e relacionamento. Dá para usar junto com o aplicativo ou a planilha que você já tem."],
  ["O Vértice já está pronto?", "Está em fase piloto. As jornadas desta página estão implementadas, e os testes completos de ponta a ponta estão em andamento. Na demonstração, o Felipe mostra o que já dá para usar e o que ainda não."],
  ["Preciso cadastrar todos os meus alunos para conhecer?", "Não. A demonstração usa dados fictícios. Não há importação automática de outros sistemas, e no piloto os dados do seu espaço ficam salvos no seu navegador."],
  ["As cobranças e assinaturas são reais?", "Ainda não. Os pagamentos são exemplos, o lembrete é enviado por você no WhatsApp e a assinatura digital funciona em ambiente de testes do ZapSign."],
  ["Como a IA usa os dados dos meus alunos?", "O Nexo e o assistente financeiro recebem só o necessário para a sugestão. Nomes, telefones, informações de saúde e observações livres não são enviados. Toda sugestão passa pela sua revisão."],
  ["Quanto custa?", "A conversa e a demonstração não custam nada. Se o piloto fizer sentido para você, escopo, acompanhamento e valor são combinados antes de começar."],
  ["O que acontece quando clico em agendar?", "Abre uma conversa no WhatsApp com o Felipe e uma mensagem sugerida. Nada é enviado sem você apertar enviar."],
];
