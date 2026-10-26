# Vértice — jornadas principais

Atualizado em 26/10/2026 para `v0.0.1 — PoC pré review`.
Base editorial: `docs/jornadas-para-criativos.md` (03/10/2026). Este documento acrescenta os fluxos atuais encontrados no código; a validação E2E completa continua pendente. Use dados fictícios.

## 1. Entrar na demonstração e criar o próprio espaço
**Ator/objetivo:** profissional independente que quer conhecer o produto e organizar sua operação.
1. Explorar a demonstração de Rafael Costa e seus cadastros de exemplo.
2. Criar o espaço pessoal, informando identificação e dados profissionais.
3. Cadastrar pessoas, parceiros, atuações e contratos no próprio espaço.
4. Recarregar e alternar entre demonstração e espaço pessoal.
**Resultado esperado:** dados pessoais recuperados do mesmo navegador, sem misturar registros da demonstração.
**E2E pendente:** primeira entrada, recarga, alternância e migração de registros locais antigos. LocalStorage não equivale a conta sincronizada, backup ou isolamento multiusuário de produção.

## 2. Professor e academia: da parceria ao contrato
1. Em Alunos e parceiros, cadastrar Organização parceira → Academia, por exemplo Academia Movimento.
2. Em Locais e aulas, adicionar atuação usando o mesmo nome, atividade Funcional, início, R$ 100 e cobrança por hora; informar agenda.
3. Salvar sem contrato automático para demonstrar sua opcionalidade.
4. Em Financeiro e contratos → Contratos, criar contrato de parceria com academia ou estúdio.
5. Preencher serviço, valor, cobrança, frequência, agenda, vigência, cancelamento e condições específicas; visualizar o PDF.
**Resultado esperado:** organização, atuação e contrato disponíveis, com condições no PDF.
**Limites/aceite:** organização e atuação são registros separados; conferir reaproveitamento de campos quando o contrato nasce da atuação. Não há cálculo automático de horas, taxas ou mensalidades.

## 3. Personal trainer: do aluno ao acordo
1. Cadastrar Marina Santos como Pessoa atendida → Aluno de personal, com contato, serviço e objetivo; deixar o valor vazio.
2. Abrir o perfil e verificar “A combinar”.
3. Criar contrato de Prestação de serviços com valor, cobrança, agenda, vigência e condições específicas.
4. Conferir e baixar o PDF.
**Resultado esperado:** cadastro e documento coerentes com o combinado.
**Limites/aceite:** criar contrato não garante atualização do valor do perfil nem geração de cobrança. Conferir acentos, quebras de página e condições no PDF.

## 4. Assessoria de corrida: do atleta à contratação
1. Cadastrar Lucas Almeida como Atleta de corrida, serviço Running Coaching.
2. Registrar o objetivo “Completar os primeiros 10 km”, contatos e alertas pertinentes.
3. Abrir o perfil e criar contrato de Assessoria esportiva.
4. Preencher condições comerciais, agenda e vigência; conferir PDF.
**Resultado esperado:** objetivo e contratação organizados por atleta.
**Limites/aceite:** não inclui prescrição de treino, GPS, relógios nem evolução automática.

## 5. Cobrança: da pendência ao lembrete
1. Abrir Financeiro e contratos → Pagamentos e localizar um atraso de exemplo.
2. Conferir cliente, valor e vencimento; acionar WhatsApp.
3. Revisar contato e mensagem antes de qualquer envio manual.
**Resultado esperado:** abertura do WhatsApp com mensagem preparada.
**Limites/aceite:** conferir telefone/destinatário em contato controlado. “Lembrar atrasados” trata apenas o primeiro atraso; não há disparo em lote nem conciliação bancária. A mensagem é genérica, sem preenchimento automático de valor e vencimento.

## 6. Acolhimento: cadastro, apoio e documentos de saúde
1. Cadastrar Helena Oliveira, 67 anos, com contato de apoio opcional e preferências de contato.
2. Abrir Saúde e documentos; preencher anamnese fictícia, revisar signatário e registrar aceite interno.
3. Baixar PDF e repetir o fluxo para PAR-Q.
4. Conferir contato de apoio e status no perfil após recarga no espaço pessoal.
**Resultado esperado:** status/data do aceite e PDF a partir do cadastro e das restrições registradas.
**Limites/aceite:** respostas individuais do formulário não são persistidas integralmente. Apoio não implica representação legal; revisar quem assina. Os documentos não comprovam aptidão médica.

## 7. Contrato: envio e acompanhamento no ZapSign Sandbox
**Pré-condições:** segredo de sandbox configurado no servidor, contrato/PDF e e-mails controlados dos dois signatários.
1. Criar e revisar contrato; acionar Enviar para ZapSign.
2. Abrir assinatura do profissional e obter o link do cliente, respeitando a ordem.
3. Concluir as duas assinaturas de teste e acompanhar a sincronização de status.
4. Conferir disponibilidade do PDF assinado.
**Resultado esperado:** “Aguardando assinatura” enquanto falta uma assinatura; “Assinado” quando ambas concluem.
**Limites/aceite:** integração implementada, E2E externo ainda pendente nesta entrega. Sandbox pode enviar e-mails reais de teste; utilizar destinatários controlados. Sem token, envio indisponível. Aceite interno demonstrativo não equivale ao fluxo externo nem a assinatura de produção.

## 8. Assistente financeiro
1. Abrir o assistente, conferir os dados disponíveis e formular uma pergunta financeira.
2. Revisar resposta, cálculo, fórmula, premissas e eventuais avisos.
3. Verificar comportamento sem chave, com limite esgotado e com armazenamento indisponível.
**Resultado esperado:** explicação baseada nos dados fornecidos, com indicação de origem/limitações; falhas claras sem promessas de transações reais.
**Limites/aceite:** integração OpenAI no servidor, com quota de 30 tentativas/dia compartilhada pelo aplicativo, no fuso de São Paulo. Não constitui conciliação bancária; conferir separadamente os caminhos determinístico e com modelo.

## 9. Nexo: relacionamento e oportunidades
1. Registrar interesses declarados, objetivos de relacionamento, preferências e último contato na ficha.
2. Selecionar até três pessoas e os serviços oferecidos; solicitar oportunidades.
3. Revisar sugestão e a ficha local de restrições/observações antes de usar a mensagem.
4. Ajustar a abordagem e realizar contato manual quando apropriado.
**Resultado esperado:** sugestões vinculadas às pessoas selecionadas e revisadas pelo profissional.
**Limites/aceite:** compartilha a quota do assistente financeiro. O payload projetado exclui identificação, saúde e texto livre da ficha. As notas exibidas ao profissional não foram analisadas pelo Nexo. Não prometer adequação clínica, recomendação de exercício ou envio automático.

## Roteiro de revisão da PoC
Para cada jornada: registrar ambiente/commit, pré-condições, passos, resultado esperado/observado e evidência; marcar passou, falhou ou bloqueada. Cobrir desktop e celular, espaço pessoal após recarga, erros de integração, PDFs, links externos e ausência de mistura com a demo. Usar essas evidências para priorizar correções antes da próxima release.
