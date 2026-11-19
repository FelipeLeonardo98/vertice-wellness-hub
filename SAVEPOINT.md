# SAVEPOINT — Vértice Wellness Hub

Atualizado: 18/11/2026. Marco: **v0.0.1 — PoC pré review**.
Repositório: https://github.com/FelipeLeonardo98/vertice-wellness-hub


## Estado atual para retomada — 05/11/2026
- Site versão 19 publicado com sucesso em 05/11/2026, fonte `a4ce330ea8e84d33ec0b6f3e33dc560547034977`. A tentativa de 31/10 havia parado por limite de uso da ferramenta; essa pendência foi resolvida.
- Página: https://vertice.felipeferrazleonardo.chatgpt.site/conheca . Acesso público confirmado na configuração e por GET sem autenticação (HTTP 200), com os três vídeos referenciados no HTML. Automação antiga de encerramento em 02/11 está desativada; não foi reativada.
- Vídeos publicados: pitch do negócio (20 s), personal (15 s), professor/academias (20 s). Permanecem nove jornadas, FAQ e WhatsApp do responsável. O vídeo de acolhimento não está nessa página.
- Build da fonte publicada passou em 31/10; nesta retomada houve deploy do mesmo artefato salvo e verificação HTTP. Não houve nova validação E2E, reprodução audiovisual ou migração de infraestrutura.
- Próximo trabalho: revisão e testes E2E das nove jornadas, priorizando demo/pessoal, cadastro → contrato → PDF, assinatura sandbox e Nexo. Limitações do produto abaixo continuam vigentes.

## Próxima release do site de vendas — 18/11/2026 (branch `release/site-vendas-v2`, não publicada)
- Nova versão de `/conheca` feita para revisão local. O site publicado (versão 19) continua igual. A branch fica no GitHub; nada foi publicado no Sites.
- **Direção:** a paleta verde + lima dos vídeos virou a cor dominante. Saíram o creme, os títulos em itálico serifado, os rótulos em caixa alta e a numeração decorativa. Tipografia: Archivo variável (`@fontsource-variable/archivo`), condensada nos títulos e normal no texto.
- **Estrutura:**
  - Hero com a semana fictícia de um professor: clicar em um horário mostra o combinado (Aurora, Prisma, Horizonte, Marina, Lucas, Helena, coerentes com os vídeos).
  - Cinco dores na voz do profissional, cada uma com link para o vídeo ou a tela correspondente.
  - Galeria escura com lightbox: quatro vídeos e quatro prints.
  - As nove jornadas com status Disponível / Demonstrativo / Em teste / Experimental, no lugar das notas repetidas.
  - Piloto com o Felipe, FAQ reduzido para 7 perguntas sem duplicatas e sem comparação detalhada com concorrentes, e CTA único “Agendar demonstração” pelo WhatsApp.
- **Arquivos:** `app/conheca/page.tsx`, `sales.css`, `content.ts` (todo o texto), `week-board.tsx` e `gallery.tsx` (componentes cliente).
- **Vídeo de acolhimento:** publicado na galeria a partir de `reel/output/acolhimento-motion`, em `public/marketing/videos/vertice-acolhimento-20s.mp4` e `.png`.
- **Verificações:**
  - `npm run build` passou.
  - `test-guardrails` e `test-crm` passaram.
  - ESLint em `app/conheca` sem erros, com 3 avisos de `<img>`.
  - Capturas em 1366 px e 390 px, sem rolagem horizontal.
  - Lightbox aberto por link (`#ver-acolhimento`, `#tela-nexo`) e fechado com Esc; troca de horário no quadro da semana. Nenhum erro no console.
  - Não houve teste em navegadores reais de celular nem reprodução de áudio.
- **Pendências:**
  - Revisão do responsável.
  - Valores fictícios do quadro (R$ 45/h, R$ 380, R$ 320, R$ 100/h) a confirmar.
  - Publicar quando a release for aprovada.

## Retomada por outra IA e dependências
- Leia AGENTS.md, este resumo e JORNADAS.md. Use README.md para instalar/executar. O clone GitHub contém o código da aplicação e página comercial; nenhum chat anterior é necessário para entender o estado atual.
- Trocar o agente de IA não exige trocar a hospedagem nem o provedor de IA do aplicativo. Node >=22.13 e npm são necessários; package-lock.json fixa dependências. Os scripts usam caminhos relativos e um clone sem .sites-runtime seleciona portable automaticamente.
- Dependências específicas: Vinext/Vite, Cloudflare Workers, binding D1 `DB` e migrações em drizzle/, integração Sites em build/, app/chatgpt-auth.ts e lib/connector*. A página comercial não usa uma chamada de IA para ser exibida, mas compartilha o build/runtime da aplicação.
- Segredos externos: OPENAI_API_KEY, OPENAI_MODEL opcional e ZAPSIGN_SANDBOX_API_TOKEN. Apenas nomes/modelo padrão estão em .env.example; valores reais não estão no GitHub. Sem segredos/binding, integrações externas ficam indisponíveis; a cota de IA falha fechada. Não copiar .env.local nem estado do navegador.
- Hospedar em outro provedor requer adaptar Workers/D1, autenticação/conectores e build; não presumir Next.js puro. Para publicar no Site atual, são necessários acesso autorizado ao projeto Sites e credenciais temporárias. Os helpers do plugin instalados na máquina não fazem parte do repositório e não são necessários para editar o código ou usar os comandos npm locais.
- O GitHub tem histórico iniciado por snapshot seguro, diferente do repositório de fonte do Sites. Neste checkout, origin aponta para Sites e github para GitHub. A cópia local output/github-v0.0.1 preserva o histórico GitHub para sincronização; não fazer force-push entre históricos. Em um clone novo do GitHub, origin será naturalmente o GitHub.

## Inventário de marketing e mídia
- **No GitHub:** app/conheca/ (página e estilos); public/marketing/videos/ (três MP4 publicados e respectivas capas); public/marketing/README.md (mapa); public/apresentacao/ (quatro capturas e três vídeos anteriores com capas); docs/jornadas-para-criativos.md (referência editorial).
- **Somente na máquina, ignorados pelo Git:** reel/ (fontes Python, trilhas WAV, storyboards, pacotes editáveis, QA, cópias dos masters e vídeo de acolhimento); marketing/jornadas/ (direção visual, prompts e duas imagens); output/ (capturas e artefatos de trabalho); .video-tools/ (ferramentas locais).
- Caminho local da raiz: C:/Users/ferra/OneDrive/Documentos/ChatGPT/produto-fitness/fitness-professional-os. Um agente com apenas o GitHub terá os vídeos finais publicados, mas não terá os projetos editáveis nem o vídeo de acolhimento. Solicitar esses materiais ao responsável se precisar reeditá-los.
- Os registros históricos abaixo descrevem entregas locais anteriores; este inventário e o estado atual acima prevalecem quanto à publicação.

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

## Motion corrida, luta e acolhimento — 30/10/2026
- Produzido roteiro aprovado de 20 segundos: uma linha se transforma de pista (Lucas, primeiros 10 km) em luva (Bia, 16 anos) e pessoa em movimento (Helena, 67 anos, condicionamento físico). Os símbolos conectam perfis, perguntas, documentos e contatos.
- Perguntas: “Você conhece quem treina com você?”, “O que você precisa saber?”, “Quem contatar se precisar?”. Cartões de Anamnese, PAR-Q e contatos: emergência para Lucas, responsável legal para Bia, apoio indicado pela própria Helena. Sem pagamentos ou contratos nesta peça.
- Fechamento aprovado: “O treino muda. O cuidado continua.” / “Veja como acolher cada aluno.” Identidade e trilha sintetizada original da série, adaptada aos cortes. Sem locução.
- Arquivo local: `reel/output/acolhimento-motion/vertice-acolhimento-20s.mp4`. Fonte: `reel/render_acolhimento_motion.py`, reutilizando helpers e composição musical de `reel/render_professor_academias.py`. Storyboard de oito quadros, capa, instruções e relatório FFmpeg na pasta da entrega.
- Verificações executadas: storyboard inspecionado visualmente; 600 quadros, 1080×1920, 30 fps e 20 segundos confirmados; decodificação integral do MP4 H.264/AAC estéreo sem erros; sinal da trilha fonte presente e sem clipping; capa extraída do MP4 e conferida visualmente. Reprodução audiovisual em tempo real não verificada.
- Cenas ilustrativas e pessoas fictícias identificadas continuamente. Sem selo de aptidão, aprovação médica ou afirmação de persistência integral das respostas dos formulários. Sem alteração funcional, chamadas externas ou publicação nesta entrega; testes da aplicação não executados.

## Motion pitch do negócio do professor — 31/10/2026
- Entregue roteiro aprovado de 20 segundos: um mesmo professor conectado à Academia Aurora e aos próprios alunos de personal; horários/acordos; duas perguntas, uma por vez; transformação gráfica em cadastros, atuações e contratos; um cartão Nexo; encerramento “Seu trabalho vai além da aula.” / “Veja como organizar seu negócio.”
- Master local: `reel/output/pitch-negocio-motion/vertice-pitch-negocio-20s.mp4`. Fonte independente: `reel/render_pitch_negocio_motion.py`. A pasta inclui capa, storyboard extraído do master, roteiro, player local, trilha instrumental original sintetizada, instruções, pacote editável e relatórios de QA. Sem locução; 1080×1920, 30 fps, H.264/AAC estéreo, 600 quadros, 20 segundos, faststart; 3,38 MB.
- Direção: linha contínua entre as relações, mesmo professor ilustrado, cartões com deslocamento/rotação/mudança de escala e organização em registros. A transformação é uma metáfora da organização manual, com “Você registra. Cada relação ganha contexto.”, sem sugerir importação de conversas. Cenas/dados fictícios e produto em piloto identificados na peça.
- Nexo conferido contra `lib/crm.ts`, `components/crm-opportunities.tsx` e a rota de oportunidades: interesse declarado em corrida, assessoria de corrida confirmada pelo profissional e sugestão para revisão humana. Cartão ilustrativo, sem chamada real, prescrição, envio automático ou garantia comercial.
- QA visual: oito momentos e doze transições inspecionados antes do master; ajustes de sobreposição, movimento do professor, sombra e conversão BT.709. Storyboard final de oito quadros e capa extraídos do MP4 e inspecionados após a exportação.
- QA técnico: decodificação integral com FFmpeg `-xerror -err_detect explode`, sem erros, 600 quadros e 20,000 s; faststart confirmado por `moov` antes de `mdat`. AAC decodificado sem clipping, pico −2,43 dBFS, true peak −2,4 dBTP, loudness −17,3 LUFS. Evidências em `verificacao.json`, `verificacao-decodificacao.txt`, `verificacao-audio.txt` e `QA.md` na pasta da entrega.
- Limite de verificação: reprodução audiovisual em tempo real e escuta subjetiva não confirmadas. O controle do Chrome foi encerrado pela ferramenta por não conseguir confirmar a URL atual com segurança; a revisão prosseguiu por quadros e análise técnica, sem contornar o bloqueio.
- Entrega local, sem publicação, alteração funcional ou edição da página comercial. Alterações preexistentes de `SAVEPOINT.md` preservadas. `reel` continua ignorado pelo Git; testes da aplicação não executados, pois não houve mudança funcional.

## Pitch na página comercial — 31/10/2026
- Master e capa de reel/output/pitch-negocio-motion copiados para public/marketing/videos, sem reedição. Inclusão autorizada pelo responsável.
- Novo vídeo abre a seção /conheca#videos, com apresentação do negócio, três passos, resumo textual e link para as jornadas. Os dois vídeos anteriores permanecem. CTA do topo agora apresenta a proposta em 20 segundos.
- Storyboard final inspecionado. Mídia ilustrativa e produto piloto identificados; Nexo sujeito à revisão humana. Sem alteração funcional ou chamadas reais aos provedores. Build e publicação seguem pelo fluxo Sites; E2E do aplicativo não faz parte desta alteração editorial.
