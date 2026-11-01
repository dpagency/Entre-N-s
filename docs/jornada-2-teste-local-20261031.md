# Jornada 2 — implementação para teste local

Branch: `desenvolvimento/selecao-jornadas-20261030`. Sem commit, push, merge ou deploy.

## Conteúdo editorial

O roteiro `docs/roteiro-jornada-2-entre-escolhas-e-cuidados.md` foi lido integralmente: abertura, quatro missões, diálogos, 16 alternativas, suas consequências e reflexões e encerramento. SHA-256: `638ae9fab5fe302484b9826dc137200ed032d62ac2639725c2532aff3a491ff6`.

`scripts/journey2-editorial.mjs` extrai o conteúdo para `src/data/journey2Editorial.ts`. Testes comparam os dados com o roteiro, preservando o texto editorial. `src/data/journey2Missions.ts` acrescenta somente a estrutura técnica e a distribuição visual entre os avatares existentes. Os interlocutores utilizam retratos dos três avatares não escolhidos; o jogador continua representando “Você”. Não foram criadas novas imagens ou personalidades permanentes para esses papéis.

As quatro missões têm respectivamente 6, 9, 7 e 8 etapas curtas de contexto e conversa. A navegação é explícita, sem temporizador, com retorno à fala anterior. Cada turno tem até 45 palavras. As quatro alternativas permanecem completas. Após decidir, são apresentadas a consequência específica, sua reflexão e a reflexão final da missão, antes das cartas. As cartas continuam independentes da decisão e não atribuem nota às escolhas dos dilemas.

O leitor progressivo é uma extensão exclusiva da Jornada 2: a Jornada 1 mantém sua apresentação anterior. A duração de leitura humana e o ritmo dos diálogos ainda dependem da avaliação editorial durante os testes locais.

## Disponibilidade e salvamento

`src/localDevelopment.ts`, `vite.config.ts` e `vite.institutional.config.ts` habilitam a Jornada 2 somente ao servir o modo development. Builds normais e institucionais mantêm a jornada bloqueada e eliminam seu roteiro do JavaScript gerado. As compilações de conferência foram direcionadas exclusivamente a `artifacts/development/journey2-20261031/`, sem atualizar a distribuição existente.

O catálogo mantém identificadores estáveis, missão e progresso por jornada/tentativa. A posição do diálogo é salva no estado da partida. Consequências e encerramento guardam suas posições com chaves específicas por tentativa. A retomada de uma jornada indisponível é bloqueada sem apagar seu registro. Abertura e encerramento são próprios da Jornada 2; o Guia Lilás aparece ao final, como link opcional, sem pontuação.

Não houve alteração nas narrativas da Jornada 1, nos bancos de questões, nas regras de aprendizagem v4 ou na migração dos salvamentos anteriores. A pontuação continua vinculada aos desafios, cartas e respostas voluntárias aos Canais, com confirmação única.

## Arquivos envolvidos

- Dados e disponibilidade: `src/data/journey2Editorial.ts`, `journey2Missions.ts`, `missionRegistry.ts`, `journeys.ts`, `src/localDevelopment.ts` e ambas as configurações Vite.
- Interface: `JourneyOpening`, `NarrativeReader`, `MissionDialogue`, `Journey2Decision`, `MissionOutcome`, `JourneyClosing`; integração em `App`, `WelcomeScreen`, `JourneyHome`, `MissionSituation`, `MissionIndividualChoice`, `MissionConsequence`, `ParticipantReveal`, `PilotSummary` e `JourneyAudio`.
- Estado e acesso: `src/types/game.ts`, `src/game/engine.ts`, `src/services/socket.ts` e `journeySelection.ts`.
- Testes e ferramentas: `tests/journey2Editorial.test.ts`, `tests/journey2/local.test.ts`, ajuste da fixture em `tests/journeySelection.test.ts`, `scripts/journey2-editorial.mjs`, `scripts/verify-journey2-browser.mjs` e scripts de execução em `package.json`. Nenhuma dependência adicionada.

## Validação

| Verificação | Resultado |
| --- | --- |
| TypeScript e `git diff --check` | Aprovados |
| Testes automatizados | 56 aprovados, zero falhas; incluem todas as 16 escolhas, pontuação única, compatibilidade e independência dos registros |
| Jornada 2 no navegador | Dois percursos completos, 1440 e 390 px, 42 verificações de layout; sem erros de execução ou chamadas à API |
| Pontuação e retomada | Percursos de 100/100 e 0/100; recarga não duplicou créditos; consulta aos Canais preservou a etapa; Jornada 1 iniciou sem herdar pontos |
| Regressão da Jornada 1 | Dois percursos completos na distribuição de conferência, incluindo execução em subpasta; 248 verificações dimensionais |
| Acessibilidade complementar | Larguras 320, 390, 768 e 1440 px com fonte ampliada e alto contraste; alternativas sem cortes ou excesso horizontal; navegação por teclado verificada |
| Narração | Síntese de voz simulada confirmou leitura apenas da fala visível e cancelamento ao avançar; não substitui conferência auditiva humana |
| Builds normal e institucional | Aprovados; roteiro da Jornada 2 excluído das saídas de publicação. Build normal conserva aviso de chunk maior que 500 kB |

Evidências locais: `artifacts/development/journey2-20261031/browser/resultados.json`, `a11y-resultados.json`, `original-browser/resultados.json` e capturas nas mesmas pastas. As capturas e builds de teste permanecem em artifacts, fora dos arquivos de código a versionar.

O pacote institucional anterior permanece intacto: SHA-256 `d9b69ca73613023301d29b3fe7f48e720f3638446eca7698232a296596b9af35`. A pasta de publicação manual continua correspondendo integralmente ao ZIP: 23 arquivos, 8.328.007 bytes, com tamanhos e SHA-256 idênticos. Nenhum pacote foi substituído.

## Acesso para avaliação

Abrir `http://127.0.0.1:5173/`, selecionar **Entre escolhas e cuidados**, identificada como teste local, e clicar em **Começar**. Após a abertura, escolher o avatar. Retomar e recomeçar utilizam o progresso independente dessa jornada.

Para iniciar novamente o servidor, executar `npm.cmd run dev:local` na raiz do projeto. Ele escuta somente no endereço de loopback. Manter a mesma origem e o mesmo perfil do navegador para conservar os salvamentos locais. Não limpar os dados do navegador para alternar jornadas.

Pendência para aprovação: avaliação humana do ritmo de leitura, distribuição dos papéis e experiência de áudio nas vozes disponíveis no dispositivo. Nenhuma publicação autorizada ou realizada.
