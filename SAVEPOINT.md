# SAVEPOINT — Vértice Wellness Hub

Atualizado: 26/10/2026. Marco: **v0.0.1 — PoC pré review**.
Repositório: https://github.com/FelipeLeonardo98/vertice-wellness-hub

## Ideia central e estágio
Sistema de gestão do negócio para profissionais independentes de fitness, movimento e fisioterapia: reunir pessoas atendidas, parceiros, locais/aulas, contratos, pendências financeiras e relacionamento num só espaço.

A PoC representa a validação da ideia declarada pelo responsável pelo produto. Isso não equivale a certificação técnica ou evidência de validação comercial anexada ao repositório. O próximo marco é concluir revisão e testes end-to-end; esta versão não deve ser tratada como pronta para produção.

## Método mínimo
Adaptação simplificada do [AI-DLC da AWS](https://github.com/awslabs/aidlc-workflows): entender intenção (Inception), construir/verificar (Construction), acompanhar entrega e continuidade (Operations). Não instala o framework nem reproduz seus artefatos e gates completos.

`AGENTS.md` inicia qualquer agente; este arquivo é o único savepoint; `JORNADAS.md` concentra fluxos e critérios. Atualize estes arquivos em vez de criar um histórico paralelo por provedor.

## Etapas
- [x] Inception: proposta, público e jornadas centrais definidos; ideia validada no marco de PoC pelo responsável.
- [x] Construction: interface, cadastro/perfis, parceiros, atuações, contratos/PDFs, documentos demonstrativos e modos demo/pessoal implementados.
- [x] Construction: ZapSign Sandbox, assistente financeiro, Nexo e quota compartilhada implementados; integração externa completa ainda precisa de E2E.
- [x] Construction: scripts de guardrails e CRM existentes passaram nesta revisão, com mocks.
- [x] Operations: documentação de entrada, jornadas e savepoint preparada para o marco v0.0.1.
- [ ] Construction: executar matriz E2E das nove jornadas, corrigir falhas e registrar evidências.
- [ ] Operations: validar operação, segurança e dados persistentes antes de uso produtivo.
- [ ] Operations: escolher destino e executar migração de hospedagem, se solicitada. A documentação já é independente de fornecedor de IA; o runtime ainda tem dependências de plataforma.

## Mapa do projeto
| Caminho | Responsabilidade |
| --- | --- |
| `app/page.tsx` | Tela principal, navegação, formulários, estado local e geração de PDFs |
| `lib/fitness-data.ts` | Tipos e dados demonstrativos |
| `components/crm-opportunities.tsx`, `lib/crm.ts` | Relacionamento, seleção e projeção de dados do Nexo |
| `components/client-review-notes.tsx` | Revisão local de restrições/observações, fora do payload de IA |
| `app/api/assistant/finance/route.ts` | Assistente financeiro e leitura da quota |
| `app/api/assistant/opportunities/route.ts` | Oportunidades com modelo e validação de saída |
| `lib/ai-quota.ts`, `db/`, `drizzle/` | Quota atômica em D1 e esquema/migrações |
| `app/api/zapsign/`, `components/signature-sync.tsx` | Criação e consulta de documentos sandbox; sincronização |
| `components/ui/`, `app/globals.css` | Componentes e estilos |
| `vite.config.ts`, `build/`, `.openai/hosting.json` | Vinext, Workers, bindings e adaptações Sites |
| `scripts/` | Execução, instalação e verificações locais |
| `app/chatgpt-auth.ts`, `lib/connector*` | Integração com ambiente Sites/ChatGPT e conectores |
| `docs/jornadas-para-criativos.md` | Referência editorial das cinco jornadas originais |

## Estado dos dados e dependências
- React 19, TypeScript, Vinext/Vite, Tailwind e componentes Shadcn; Node.js >=22.13.
- Demonstração usa seeds; espaço pessoal persiste cadastros, contratos, atuações e perfil em localStorage. Não há banco central completo dos clientes nem sincronização entre dispositivos.
- Pagamentos são demonstrativos; não há transação ou conciliação bancária.
- Documentos de saúde registram status/data, sem persistir integralmente as respostas individuais.
- D1 guarda a quota de IA: 30 tentativas diárias por aplicativo, compartilhadas por financeiro e Nexo, com virada em America/Sao_Paulo. Falha de armazenamento bloqueia a chamada.
- OpenAI depende de `OPENAI_API_KEY` e opcionalmente `OPENAI_MODEL`; ZapSign usa `ZAPSIGN_SANDBOX_API_TOKEN`. Valores devem ficar apenas no ambiente servidor, nunca no Git.
- Um clone limpo usa o perfil `portable`; `.sites-runtime` é estado local ignorado. O build continua dependente das adaptações Cloudflare/Sites.

## Próxima ação recomendada
1. Ler `JORNADAS.md` e executar as nove jornadas em ambiente controlado; priorizar alternância demo/pessoal, cadastro → contrato → PDF, assinatura de duas partes e revisão Nexo.
2. Registrar evidências, especialmente recarga, erros, responsividade, limites de quota e privacidade.
3. Corrigir achados e repetir somente verificações afetadas; atualizar este savepoint.
4. Antes de produção, decidir autenticação/autorização, persistência por usuário, backup, tratamento dos dados sensíveis e integração de assinatura de produção.

## Migração futura
Separar mudança de agente de IA (ler AGENTS.md e este arquivo) de mudança de infraestrutura. Para hospedagem: inventariar imports `cloudflare:workers`, substituir bindings D1 e sua atomicidade, adaptar worker/build/auth/conectores Sites, configurar segredos no destino e repetir E2E. Para trocar o modelo: revisar contrato das rotas de IA, validação, projeção de dados, quota e tratamento de erros. Não copiar tokens ou estado do navegador para outro provedor.

## Evidência desta entrega
- Base local anterior à documentação: `5e13a76`.
- `node scripts/test-guardrails.mjs`: passou (quota concorrente, virada do dia, bloqueios e assinatura com duas partes).
- `node scripts/test-crm.mjs`: passou (privacidade, datas, limite de seleção, quota e validação de saída).
- `npm run build`: passou; aviso de chunks acima de 500 kB e classificação estática limitada de rotas no Vinext.
- Lint do código (excluindo caches, perfis de navegador e cópias geradas): 2 erros preexistentes e 1 aviso. `app/page.tsx:248`: setState dentro de effect; `components/signature-sync.tsx:16`: alteração de ref durante render; aviso de imagem em `app/page.tsx:689`. Correção pendente para o review. O lint padrão também inclui artefatos locais; ajustar seus ignores no próximo ciclo.
- Versão em package.json e package-lock.json alinhada à tag 0.0.1.
- E2E completo e chamadas reais aos provedores: não executados nesta entrega.


## Página comercial — 26/10/2026
- Rota `/conheca`: apresentação comercial com nove jornadas expansíveis, FAQ, oferta de piloto acompanhado e links para o WhatsApp autorizado de Felipe.
- URL simplificada: `https://vertice.felipeferrazleonardo.chatgpt.site/conheca`; demonstração preservada em `/`.
- Fontes: `app/conheca/page.tsx`, `app/conheca/sales.css`, `public/apresentacao/`.
- Quatro capturas atuais da demo com dados fictícios. Dois vídeos anteriores reaproveitados e identificados como apresentações ilustrativas; não são gravações E2E atuais. Novos vídeos completos de cadastro → PDF, parceria e Nexo permanecem pendentes.
- Navegação, abertura de jornada, imagens e destino dos links conferidos em prévia local. Layout verificado em 1280 px e 390 px, sem rolagem horizontal. Nenhuma mensagem de WhatsApp enviada nos testes.
- Atenção operacional: o Site possui automação de encerramento do acesso público em 02/11/2026. Não foi alterada nesta entrega; decidir sua continuidade antes de investir em divulgação.

## Atualização comercial — 29/10/2026
- Segundo vídeo substituído por `gemini_generated_video_77e0d84c.mp4`, fornecido pelo responsável, publicado como `public/apresentacao/parcerias-gemini.mp4` com capa extraída. Escolhido pela presença de legendas e narrativa visual mais clara que a variante dd24cebc. Ambos possuem textos de interface sintética distorcidos; a página identifica a peça como ilustração gerada por IA, não como gravação do produto.
- FAQ expandida: escopo frente a MFIT e Next Fit, valor do piloto, manutenção das ferramentas existentes, ausência de importação/integração e limites de treinos/cobrança.
- Fontes oficiais consultadas: https://ajuda.mfitpersonal.com.br/?echo_kb_faq=quais-funcoes-o-app-da-mfit-oferece e https://nextfit.com.br/. Comparação de escopo, sem alegação de superioridade ou exclusividade.

- CTA final atualizado em 29/10/2026: 'Seu negócio fitness merece o próximo passo!', convite pré-lançamento e botão 'Quero conhecer o Vértice', mantendo contato via WhatsApp e indicação de piloto.

## Motion da jornada personal — 29/10/2026
- Criada peça promocional local de 15 segundos, vertical 1080×1920, 30 fps, H.264/AAC, com trilha instrumental sintetizada original. Jornada escolhida: novo aluno → cadastro com valor a combinar → contrato → visualização do PDF.
- Entrega: `reel/output/personal-motion/vertice-personal-15s.mp4`; fonte editável: `reel/render_personal_motion.py`; storyboard e quatro quadros na mesma pasta de saída. Mídia e fonte permanecem locais na pasta reel ignorada pelo Git; nenhuma publicação executada.
- Identidade baseada nas cores do aplicativo. Cartões de interface são ilustrativos, identificados continuamente com dados fictícios; não representam captura ou E2E da versão publicada. Não apresenta assinatura, cobrança automática ou envio externo.
- Verificações executadas: inspeção visual do storyboard de quatro cenas; renderização dos 450 quadros; decodificação integral por FFmpeg sem erros, duração exata de 15 segundos e streams de áudio/vídeo confirmados. Reprodução audiovisual em tempo real não verificada. Testes da aplicação não executados, pois não houve alteração funcional.

## Motion professor + academias — 29/10/2026
- Produzida versão de 20 segundos aprovada na conversa: semana do professor com Aurora pela manhã, personais à tarde, coletivas na Prisma seg/qua/sex, Horizonte à noite e sábado com folga ou escala Aurora/Horizonte. Academias e pessoa atendida são fictícias.
- Sequência: identificação com a semana → “O que ficou combinado… com cada academia? …com cada aluno?” → “Ficou alguém de fora?” → parceria/atendimento e contrato em PDF → CTA aprovado: “Tire tudo da sua cabeça. Veja como organizar seus combinados.”
- MP4: `reel/output/professor-academias-motion/vertice-professor-academias-20s.mp4`. Fonte independente: `reel/render_professor_academias.py`; storyboard de oito quadros, trilha original sintetizada e registro de decodificação na pasta da entrega. 1080×1920, 30 fps, H.264/AAC estéreo, 600 quadros, 20 segundos.
- QA: oito quadros inspecionados visualmente, incluindo os dois estados de sábado e ambas as perguntas; arquivo integralmente decodificado com FFmpeg sem erros; presença de áudio/vídeo e ausência de clipping na trilha fonte verificadas. Reprodução audiovisual em tempo real não verificada.
- Cenas e cartões ilustrativos identificados continuamente; agenda gráfica representa a rotina da personagem, não detecção automática de conflitos. Sem afirmações de conciliação bancária ou envio automático. Entrega local, sem publicação e sem mudanças funcionais no aplicativo; testes da aplicação não executados.

## Jornadas em vídeo na página comercial — 29/10/2026
- Duas peças motion autorizadas para publicação, copiadas de reel/output para public/marketing/videos com capas. Substituem os vídeos anteriores em /conheca.
- Cards apresentam problema, três passos, resumos textuais e links para jornadas 02 e 03. As nove jornadas continuam disponíveis. Vídeos sob demanda, sem autoplay, identificados como ilustrativos.
- Página comercial isolada em app/conheca; mídia versionada em public/marketing no mesmo repositório, sem duplicação de binários.
- Verificação: storyboards das duas peças inspecionados; arquivos finais preservados sem reedição. Build e publicação executados pelo fluxo Sites; não equivale a E2E do aplicativo.
