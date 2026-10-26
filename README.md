# Vértice Wellness Hub

**v0.0.1 — PoC pré review.** PoC de gestão para profissionais independentes de fitness, movimento e fisioterapia; ideia validada pelo responsável, com testes end-to-end finais pendentes.

## Documentação
- [AGENTS.md](AGENTS.md): entrada para qualquer agente de IA.
- [SAVEPOINT.md](SAVEPOINT.md): contexto, arquitetura, estágio e próximos passos; AI-DLC simplificado.
- [JORNADAS.md](JORNADAS.md): nove jornadas e critérios de revisão.

## Executar
Node.js >=22.13. Na raiz deste repositório:
```sh
npm ci
npm run dev
```
Abra http://127.0.0.1:5173. Build: `npm run build`; execução do build local: `npm start`.

Configurações opcionais do servidor estão em `.env.example`; copie para `.env.local` e preencha somente no seu ambiente. As integrações dependem de segredos e, para IA, do binding D1 e suas migrações. Sem essas dependências, os fluxos externos podem ficar indisponíveis.

## Escopo
Cadastros e perfis, parceiros, locais/aulas, contratos/PDFs, documentos de saúde demonstrativos, pagamentos de exemplo, ZapSign Sandbox, assistente financeiro e Nexo para relacionamento. A demonstração usa dados fictícios; o espaço pessoal usa localStorage. Integrações externas implementadas ainda exigem validação E2E.

## Verificar
```sh
node scripts/test-guardrails.mjs
node scripts/test-crm.mjs
npm run lint
npm run build
```
Os scripts usam mocks e não consomem chamadas reais dos provedores. Veja no savepoint as evidências e limitações do marco.

## Arquitetura
React/TypeScript com Vinext/Vite, Tailwind e componentes Shadcn. Runtime Cloudflare Workers/D1 com adaptações de Sites. A migração para outra hospedagem requer adaptar essas dependências; trocar a ferramenta de IA não exige mudar a aplicação.
