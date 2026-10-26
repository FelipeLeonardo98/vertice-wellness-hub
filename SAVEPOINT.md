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

