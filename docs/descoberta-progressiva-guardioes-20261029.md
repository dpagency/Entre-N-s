# Descoberta progressiva dos Guardiões — 29/10/2026

Alteração exclusivamente local na branch `ajustes-tela-inicial-20261021`. Sem commit, push, merge ou deploy. A substituição da demonstração depende de autorização posterior.

## Mudanças

- `src/components/lobby/WelcomeScreen.tsx`: removidos os quatro cards de apresentação dos Guardiões, seus modais e os imports/estado sem uso. Mantidos os quatro avatares, seus modais, apelido, seleção persistente, botão e retomada.
- `src/components/ui/RulesModal.tsx`: substituída a lista de nomes, títulos e perfis por orientação geral sobre a descoberta de um Guardião em cada missão. Preservadas as instruções de pontuação e demais regras.
- `scripts/verify-institutional-browser.mjs`: incluídas verificações de ausência de identidades/retratos na abertura e nas Regras, quatro escolhas de avatar, identidade correta em cada encontro e presença dos quatro Guardiões no encerramento.

Motor, distribuição aleatória sem repetição, perguntas, pontos, encontros, encerramento, imagens, áudio e armazenamento não foram alterados nesta etapa. Não foi introduzido novo formato de salvamento ou migração.

## Resultados efetivamente verificados

- `npm test`: 23 testes aprovados. A tentativa restrita falhou na consulta de usuário do Windows pelo tsx; a execução autorizada fora dessa restrição passou.
- `npm run lint`: TypeScript aprovado.
- `npm run build` e `npm run package:institutional`: aprovados. Permanece o aviso conhecido de JavaScript acima de 500 kB.
- `npm run test:institutional:browser`: aprovado. Duas jornadas completas, em `/` e `/entre-nos/`, quatro missões e quatro Guardiões distintos em cada uma. Resultados de aprendizagem de 120 e 40 pontos, conforme respostas do teste.
- 80 verificações de dimensões em 320, 390, 768 e 1440 px, incluindo Regras, texto ampliado, alto contraste e redução de movimento; sem rolagem horizontal. Abertura inspecionada visualmente nas capturas de celular e computador.
- Navegação por teclado e foco nos modais de avatar, foco no feedback, controles de narração, avaliação/PDF, composição/PNG, medalha e escolha final preservados.
- Retomada após recarga durante o encontro e no encerramento preservou resposta, preferências e identificação final. Reinício gerou nova jornada sem créditos herdados. Não foi executada uma migração cruzada entre builds; a compatibilidade é apoiada também pela ausência de mudanças no motor e no esquema de armazenamento.
- Nenhuma tentativa de API antiga, conexão HTTP externa, erro de execução ou recurso quebrado nas jornadas com extensões desabilitadas.
- ZIP extraído por `Expand-Archive` e todos os arquivos comparados ao inventário por tamanho e SHA-256.

Evidências em `artifacts/institutional/verification/resultados.json`, capturas, PDFs e `zip-check.json`. Celular foi verificado por emulação; qualidade audível da voz e dispositivos físicos continuam sujeitos à homologação humana. Vozes do navegador/sistema podem usar serviços remotos.

## Distribuição e retorno

Novo pacote: `artifacts/institutional/Entre-Nos-Institucional.zip`, 8.427.738 bytes, 23 arquivos do website. Inventário atualizado em `artifacts/institutional/inventario.json`.

SHA-256 do novo ZIP: `baead266283c22e4e3ca08d931d89f11ddeabe737551d62016f58e653da85b20`.

Pacote anterior, inventário, hash e evidências preservados em `artifacts/institutional/rollback-antes-descoberta-20261029/`. SHA-256 do ZIP anterior: `8335cd7f67d5c8d331267ba48aee36a4095870cfe98d9bf759fab1f4e76aab1d`.

Publicar futuramente somente `site/`, após aprovação. Os arquivos dos Guardiões permanecem no pacote porque são necessários aos encontros e ao encerramento; descoberta progressiva significa não os apresentar antecipadamente na interface, não impedir inspeção técnica dos assets públicos.
