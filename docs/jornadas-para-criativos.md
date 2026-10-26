# Vértice — cinco jornadas para criativos e demonstrações

Registro: 3 de outubro de 2026.

Objetivo: demonstrar sequências reais de ações com começo, meio e resultado, para redes sociais, campanhas e apresentação do MVP a profissionais. Este documento é a base editorial; os vídeos serão produzidos individualmente depois.

Base de verificação: versão 7 publicada do MVP e implementação local em `app/page.tsx`. As cinco jornadas abaixo correspondem aos controles e estados disponíveis hoje. Ainda é necessário fazer um ensaio visual antes de cada gravação, especialmente nas aberturas externas do WhatsApp e dos PDFs.

## 1. Professor e academia: da nova parceria ao contrato

**Público:** professores que trabalham em academias, estúdios e vários locais.

**História:** o professor fechou aulas de funcional em mais uma academia e precisa organizar o acordo.

**Finalidade:** registrar a nova frente de trabalho e visualizar o contrato em PDF.

**Sequência de demonstração:**
1. Em Alunos e parceiros, criar uma Organização parceira, categoria Academia: “Academia Movimento”, com os dados fictícios do estabelecimento e do gestor.
2. Em Locais e aulas, adicionar uma atuação usando exatamente o mesmo nome da organização.
3. Informar atividade “Funcional”, data inicial, valor de R$ 100 e cobrança “Por hora”; informar dias e horários se desejado.
4. Salvar sem preparar contrato automático, mostrando que o contrato é opcional.
5. Em Financeiro e contratos → Contratos → Criar contrato, selecionar a academia e o modelo “Parceria com academia ou estúdio”.
6. Informar serviço, valor contratado, forma de cobrança “Por hora”, frequência, dias e horários, vigência e política de cancelamento.
7. No campo aberto “Condições específicas do contrato”, registrar apenas as particularidades adicionais da parceria — por exemplo: “Uso dos materiais fornecidos pela academia e taxa do espaço já inclusa no valor”.
8. Criar o contrato, abrir Ver PDF e destacar a seção “Condições específicas”.

**Criativo sugerido, 25–30 s:** “Mais uma academia na sua rotina?” → cadastro da academia → valor/hora e horários → detalhes do contrato → PDF. Fechamento: “Cada parceria organizada no Vértice.”

**Cuidados de gravação:** atuação e cadastro da organização são registros separados. O contrato possui forma de cobrança, frequência e dias/horários estruturados, além do campo aberto para condições específicas. A forma de cobrança e a agenda são reaproveitadas quando o contrato nasce de uma atuação, mas o sistema não calcula automaticamente horas, taxas ou mensalidades.

## 2. Personal trainer: do novo aluno ao acordo de acompanhamento

**Público:** personal trainers e profissionais com atendimento individual.

**História:** uma nova aluna quer começar, mas o plano será combinado depois do cadastro.

**Finalidade:** organizar o cadastro e gerar o contrato do acompanhamento.

**Sequência de demonstração:**
1. Em Alunos e parceiros, cadastrar “Marina Santos”, Pessoa atendida → Aluno de personal.
2. Preencher contatos, serviço, objetivo e foto opcional; deixar o valor vazio.
3. Abrir o perfil e destacar “A combinar”.
4. Em Financeiro e contratos → Contratos, criar contrato para Marina, modelo “Prestação de serviços”.
5. Informar Personal Training, valor contratado, forma de cobrança, frequência, dias e horários, início, término e cancelamento.
6. Usar “Condições específicas do contrato” para registrar uma particularidade realista da aluna, como adaptação de exercícios ou taxa do local.
7. Abrir o PDF e mostrar a condição específica. Na demo longa, mostrar também o aceite interno demonstrativo e o status Assinado.

**Criativo sugerido, 20–25 s:** “Chegou aluno novo?” → cadastro → “Combine o valor depois” → contrato → PDF. Fechamento: “Do primeiro contato ao acompanhamento organizado.”

**Cuidados de gravação:** não afirmar que criar o contrato atualiza automaticamente o valor do perfil ou gera cobranças. As condições específicas aparecem no PDF, mas não alteram outros campos do perfil. A assinatura é interna ao MVP; o botão Enviar altera o status, sem entrega comprovada de link a um destinatário externo.

## 3. Assessoria de corrida: da entrada do atleta à contratação

**Público:** treinadores e assessorias de corrida.

**História:** um corredor entra na assessoria com o objetivo de completar seus primeiros 10 km.

**Finalidade:** registrar objetivo e contratação do acompanhamento esportivo.

**Sequência de demonstração:**
1. Cadastrar “Lucas Almeida” como Pessoa atendida → Atleta de corrida e selecionar o serviço “Running Coaching”.
2. Registrar o objetivo “Completar os primeiros 10 km”, contatos e eventuais restrições ou alertas pertinentes.
3. Abrir o perfil e destacar objetivo e serviço.
4. Em Financeiro e contratos → Contratos, selecionar Lucas e o modelo “Assessoria esportiva”.
5. Preencher serviço, valor, forma de cobrança, frequência, dias/horários e vigência; usar o campo de condições específicas se houver uma combinação individual; criar e visualizar o PDF.

**Criativo sugerido, 20–25 s:** “Sua assessoria está crescendo?” → novo atleta → objetivo dos 10 km → contratação → PDF. Fechamento: “Mais clareza para acompanhar cada atleta.”

**Cuidados de gravação:** diferenciar esta peça pelo público e objetivo do atleta. Não apresentar prescrição de treinos, GPS, integração com relógios ou evolução automática como recursos desta jornada.

## 4. Cobrança: do pagamento pendente ao lembrete pronto

**Público:** todos os profissionais que administram pagamentos de clientes.

**História:** o profissional precisa localizar pendências e preparar uma cobrança sem começar a mensagem do zero.

**Finalidade:** identificar uma cobrança e abrir o contato correto com uma mensagem pronta no WhatsApp.

**Sequência de demonstração:**
1. Abrir Financeiro e contratos → Pagamentos.
2. Destacar um lançamento de exemplo com status Atrasado, valor e vencimento.
3. Acionar WhatsApp na linha desse lançamento.
4. Mostrar a conversa aberta com a mensagem preenchida.
5. Encerrar na revisão da mensagem; uma demonstração não precisa enviá-la.

**Criativo sugerido, 15–20 s:** “Quem está com pagamento pendente?” → tabela e atraso em destaque → botão WhatsApp → mensagem pronta. Fechamento: “Encontre a pendência. Prepare o lembrete. Revise e envie.”

**Cuidados de gravação:** envio individual e manual. O botão “Lembrar atrasados” abre apenas o primeiro atrasado encontrado; não demonstrar disparo em lote, lista de transmissão ou integração com a API. O alerta do dashboard simula preparação. Os pagamentos são dados de exemplo; não prometer conciliação bancária. A mensagem atual é genérica e não inclui automaticamente valor e vencimento. Usar contato controlado pela equipe para ensaio.

## 5. Acolhimento: do cadastro aos documentos e contato de apoio

**Público:** profissionais que valorizam a organização inicial do atendimento, incluindo atendimento a pessoas 60+ e menores.

**História:** uma aluna de 67 anos começa o acompanhamento e deseja indicar a filha como contato de apoio financeiro.

**Finalidade:** reunir identificação, contato de apoio e documentos de triagem no perfil.

**Sequência de demonstração:**
1. Cadastrar “Helena Oliveira”, 67 anos, com foto opcional.
2. Adicionar contato de apoio, vínculo e telefone; marcar recebimento de cobranças e lembretes se for a escolha da personagem.
3. Abrir o perfil → Saúde e documentos.
4. Abrir a ficha de anamnese, preencher informações fictícias para demonstrar o formulário, registrar o aceite e mostrar a mudança de status para Assinado.
5. Baixar o PDF e destacar os dados cadastrais, restrições e registro de assinatura que aparecem no documento.
6. Repetir o fluxo para o PAR-Q na demo longa; no vídeo curto, destacar os dois cartões e a mudança de status.
7. Mostrar o contato de apoio na visão geral do perfil.

**Criativo sugerido, 25–30 s:** “Um bom acompanhamento começa conhecendo o aluno.” → identificação → contato de apoio → documentos → PDF. Fechamento: “Informações organizadas desde o início.”

**Cuidados de gravação:** contato de apoio é opcional para pessoas 60+; não presumir incapacidade. Os documentos não comprovam aptidão médica. O preenchimento e aceite atuais são internos e demonstrativos. Nesta versão, os campos digitados dentro da anamnese e as respostas individuais do PAR-Q não são persistidos; o sistema registra o status, a data da assinatura e gera o PDF a partir dos dados cadastrais e das restrições salvas no perfil. Conferir o signatário, pois o formulário pode sugerir o contato de apoio; não representar que qualquer contato pode assinar pelo aluno.

## Direção comum da série

- Usar o nome Vértice e identificar a profissão nos primeiros segundos.
- Uma peça por jornada, com uma dor, 3–5 momentos visuais e um resultado verificável.
- Proposta inicial: vertical 9:16, textos curtos, trilha e recortes ampliados da interface, mantendo a linha do reel anterior.
- Evitar digitação longa: cortar entre estados preenchidos e dar tempo para ler o resultado.
- Criar futuramente uma versão curta de campanha e uma demonstração narrada de 60–90 s por jornada.
- Usar personagens fictícios e identificação de ambiente demonstrativo quando aparecerem recursos simulados.
- CTA sugerido: “Experimente a demo do Vértice.” Confirmar disponibilidade do acesso antes de veicular.

## Ordem proposta de produção

1. Personal: apresenta o fluxo básico do produto.
2. Academia: demonstra a gestão de múltiplas frentes de trabalho.
3. Cobrança: comunica uma dor recorrente em uma peça curta.
4. Corrida: adapta a mensagem para uma campanha segmentada.
5. Acolhimento: destaca documentos e atenção ao contexto do aluno.

Antes de produzir cada vídeo: ensaiar o percurso publicado, conferir os dados e o PDF, ajustar eventuais diferenças de interface e então capturar as cenas. Nenhum vídeo foi produzido nesta etapa.
