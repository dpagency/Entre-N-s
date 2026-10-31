# Guardiões da Integridade — ajuste de apresentação

Data: 29/10/2026. Alterações locais, sem commit, push, merge ou deploy.

## Alterações

- O botão da situação passou de “Encontrar o Guardião” para “Desafio dos Guardiões da Integridade”.
- A etapa educativa usa esse mesmo título como cabeçalho principal acessível; o nome do personagem permanece como subtítulo, com seu retrato, título e características originais.
- Após a apresentação original de cada personagem, aparece o convite exato: “Tenho um desafio para você! Que tal aprofundar seus conhecimentos sobre ética e integridade?”. O convite também integra os trechos disponíveis para narração.
- O botão de acesso à pergunta passou a “Iniciar desafio”. Mensagens, pergunta, ações do motor e pontuação continuam iguais: abrir registra +5 de consulta e acertar vale +15.
- Abertura, regras, títulos de página e compartilhamento usam a denominação coletiva “Guardiões da Integridade”. As regras explicitam quatro encontros progressivos sem repetição e identificação somente ao final.
- Na lembrança final, “Meu Guardião” e “seu Guardião” foram substituídos por “Identificação ao final”. Rótulos possessivos remanescentes nas telas legadas também foram neutralizados, sem alterar suas ações.

As apresentações originais, personalidades, perguntas, banco de narrativas e imagens não foram editados. Os títulos individuais dos personagens permanecem, inclusive quando descrevem seu papel na convivência. A expressão genérica presente no texto pedagógico original de uma missão foi preservada como parte da narrativa, sem alterar o banco.

Não há nova atividade, regra ou versão de pontuação. Descoberta sem repetição, decisões, identificação final, Caminhos, Segunda Chance, Revés, acesso aos Canais e perspectivas somente resumidas permanecem na dinâmica atual.

## Testes

- TypeScript e verificação de sintaxe do script de navegador aprovados.
- 29 testes de regressão aprovados.
- Builds normal e institucional aprovados. O build normal mantém o aviso de JavaScript acima de 500 kB; o institucional tem aproximadamente 442 kB.
- O teste completo de navegador confere o título e o convite exatos nas quatro missões, a semântica do cabeçalho na árvore de acessibilidade, o início do desafio por Enter e o convite no texto enviado à narração.
- As duas jornadas completas conferem os quatro Guardiões distintos em cada jornada, sem apresentação antecipada de suas identidades. Mantidas as verificações de identificação final, medalha, avaliação/PDF, composição/PNG, pontuação, retomada, cartas e Canais.
- O mesmo teste continua verificando os resumos das perspectivas nas seis missões do catálogo, sem fala integral na interface ou na narração dessa etapa.
- Computador e celular verificados em 320, 390, 768 e 1440 px, incluindo fonte Extra, alto contraste, redução de movimento, teclado e recarga. Capturas completas do título e convite em 390 e 1440 px inspecionadas visualmente.

Evidências e resultados finais em `artifacts/institutional/verification/resultados.json`, capturas `*-convite-guardioes-*` e `zip-check.json`.

Resultado final: duas jornadas completas aprovadas, quatro convites verificados em cada jornada e 180 verificações de layout aprovadas. Pontuações mantidas em 100/100 e 20/95, conforme os acertos e o registro histórico usados pelo teste. Nenhuma tentativa de API antiga, conexão HTTP externa, erro de execução ou recurso quebrado. `git diff --check` aprovado.

Celulares foram emulados; a acessibilidade foi verificada por teclado e árvore do navegador, sem certificação por leitor de tela. Narração validada pelos controles e texto enviado à síntese, sem certificar pronúncia. A revisão React manteve hooks, ordem de interação, semântica de cabeçalhos e controles existentes.

## Preservação e entrega

Versão anterior, inventário, hash e evidências preservados em `artifacts/institutional/rollback-antes-guardioes-integridade-20261029/`. SHA-256 anterior: `86a5b54c8936194a4a462c0abd1440b7c0805cd84fdde66c746d22913ff483fc`.

Pacote: `artifacts/institutional/Entre-Nos-Institucional.zip`. Inventário: `artifacts/institutional/inventario.json`. Pasta manual: `artifacts/institutional/publicacao-concurso-2026/site`.

A conferência final compara ZIP, inventário e pasta manual por quantidade, tamanho e SHA-256, com `index.html` na raiz. O resultado fica em `artifacts/institutional/verification/zip-check.json`.

Pasta manual atualizada: 23 arquivos, 8.314.880 bytes, todos idênticos ao inventário e às entradas do ZIP. ZIP de 8.328.795 bytes; SHA-256 `0e37ec3c5106d1376d57f7474a7a84306a4c09c01380d388b4926062e1e200c9`. Extração independente conferida em `artifacts/institutional/conferencia-guardioes-integridade-20261029/`. Imagens originais idênticas à versão anterior.

A publicação em `entre-nos-piloto-concurso-2026` será manual após conferência. Nenhum projeto hospedado foi acessado ou alterado nesta etapa.
