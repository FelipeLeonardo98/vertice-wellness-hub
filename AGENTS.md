# AGENTS.md — entrada para agentes de IA

Este repositório contém o Vértice Wellness Hub. Responda ao responsável em português brasileiro.

## Comece aqui
1. Leia `SAVEPOINT.md`: objetivo, arquitetura, evidências e próxima etapa.
2. Leia `JORNADAS.md`: comportamento esperado e critérios de validação.
3. Confira `git status` e os arquivos relevantes à tarefa. Preserve alterações existentes.
4. Consulte `README.md` para executar. Não é necessário ler todos os componentes para começar.

## Forma de trabalho — AI-DLC simplificado
- Inception: entenda a necessidade, o resultado esperado e os critérios de aceite.
- Construction: implemente a menor mudança coerente; execute verificações pertinentes.
- Operations: registre resultado, limitações e próximos passos no savepoint.
- Ao encerrar uma entrega, atualize `SAVEPOINT.md` com data, alterações, verificações realmente executadas e pendências. Mantenha um único savepoint, sem diários duplicados por ferramenta.
- Não confunda código implementado, teste com mocks e validação end-to-end. Não marque uma etapa como validada sem evidência.

## Convenções e limites
- Preserve TypeScript, React, os componentes existentes e a interface em pt-BR.
- O runtime atual é Vinext/Vite com Cloudflare Workers/D1 e adaptações de Sites. Não assuma que basta trocar a hospedagem ou executar Next.js puro.
- Preserve a separação entre demonstração e espaço pessoal; o cadastro não possui persistência centralizada de produção.
- Não publique `.env.local`, tokens, chaves, dados reais de alunos, perfis de navegador ou arquivos locais de mídia. Use `.env.example` sem valores secretos.
- IA e ZapSign dependem de serviços externos. Testes locais devem preferir mocks; chamadas reais podem consumir quota, criar documentos e enviar e-mails.
- Preserve a projeção de dados do CRM: nomes, telefones, saúde e observações livres não devem ser enviados ao modelo. A revisão da ficha permanece local e humana.
- Mantenha a cota compartilhada de IA e o bloqueio quando o armazenamento estiver indisponível.
- Não anuncie cobrança real, prescrição de treino, assinatura de produção ou sincronização multiusuário como recursos concluídos.
- Não altere a integração de hospedagem nem faça migrações destrutivas como efeito colateral de uma tarefa documental.

## Verificações existentes
Execute na raiz da aplicação com Node.js >=22.13:
```sh
node scripts/test-guardrails.mjs
node scripts/test-crm.mjs
npm run lint
npm run build
```
Os dois scripts usam mocks e SQLite em memória; não substituem E2E. Registre falhas de ambiente separadamente de falhas do produto.

Este arquivo é independente de fornecedor de IA. Se uma ferramenta não carregar AGENTS.md automaticamente, peça que o leia explicitamente antes de trabalhar.
