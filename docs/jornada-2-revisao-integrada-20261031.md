# Jornada 2 — revisão integrada para testes locais

Branch conferida: `desenvolvimento/selecao-jornadas-20261030`. As alterações locais anteriores foram mantidas. Esta rodada não criou commit, push, merge, deploy ou pacote de publicação.

## Ajustes realizados

| Tema | Resultado |
| --- | --- |
| Personagens narrativos | As quatro missões apresentam somente nomes e falas, sem retratos. Foram removidas as associações de Marina, Caio, Helena, André e colegas aos avatares. Avatares e Guardiões mantêm suas imagens nas funções próprias. |
| Perguntas reutilizáveis | As cinco perguntas de Caminhos recebem uma apresentação independente da narrativa na Jornada 2. Removidas introduções como “na situação discutida na missão”. Segunda Chance, Revés e as cinco perguntas próprias dos Canais já apresentam contextos autônomos e foram verificadas. Nenhuma alternativa, resposta adequada, explicação institucional ou regra das cartas foi alterada. |
| Canais por missão | Nas novas tentativas da Jornada 2, uma pergunta por missão, com resposta obrigatória antes da conclusão e sem exigir acerto. +5 por resposta adequada; erro: 0, sem penalidade. Abertura e consulta: 0. |
| Encerramento | Texto aprovado completo em uma única seção, com o título “💜 Sua jornada pode continuar!”, explicação da relação com o Guia Lilás e link imediato. Removido o leitor em quatro etapas e seu subtítulo “Encerramento”. |
| Ações finais | Mantidas “Avaliar experiência” e “Jogar novamente”. Acrescentada “Voltar às jornadas”, que preserva a tentativa concluída e seu resumo. |

O botão amarelo “Canais de Atendimento” está disponível em todas as fases da nova tentativa: mapa, narrativa, Guardiões, decisão, revelação, consequências/cartas e resumo. O menu superior continua oferecendo consulta. Ao encerrar a missão sem participação, a interface convida a responder; o motor também bloqueia a conclusão caso se tente contornar a interface. Não há interrupção automática dos diálogos.

O painel conserva a interface “Canais e Competências Institucionais”. Seu cabeçalho diferencia a participação necessária na nova Jornada 2 da atividade opcional da Jornada 1. Ao sair sem responder, a mesma questão permanece pendente. Depois de responder, a reabertura mostra o feedback registrado. As participações anteriores podem ser consultadas na seção de revisão. Fora das missões, o painel não oferece novas respostas pontuadas nesse modo.

## Banco de perguntas e pontuação

Há cinco perguntas próprias dos Canais (`cv-1` a `cv-5`), suficientes para as quatro missões. Não foi necessário acrescentar perguntas nem solicitar ampliação editorial. A alocação utiliza uma questão ainda não reservada na tentativa; uma pergunta não pode ser escolhida novamente em outra missão. A quinta questão permanece como reserva no banco atual.

Essas perguntas são distintas das perguntas da Carta dos Caminhos (`ca-*`). Não se pontua duas vezes a mesma questão dos Canais; a Carta dos Caminhos continua sendo oportunidade adicional e independente, conforme solicitado. O registro da resposta é único e a pontuação é derivada desses registros, sem incrementos acumulativos que possam se repetir após recarga.

O máximo da jornada permanece em **100 pontos de aprendizagem**, com todas as oportunidades apresentadas: Guardiões até 60, perguntas das cartas até 20 e participações nos Canais até 20. Os efeitos do sorteio das cartas permanecem separados e inalterados. As decisões dos dilemas não recebem nota.

Para preservar integralmente a Jornada 1, o banco original das cartas não foi reescrito. Um adaptador de apresentação torna os enunciados independentes para a Jornada 2, mantendo identificadores, alternativas, respostas e fundamentos. Não há reavaliação de respostas salvas.

## Compatibilidade e persistência

A regra por missão é identificada pelo registro versionado `missionChannelActivity.version = 1`, criado **somente no início de novas tentativas da Jornada 2**. Esse registro armazena questão e resposta por missão no próprio snapshot, junto do progresso da narrativa. A versão geral v4, os Guardiões e as cartas foram preservados.

Tentativas anteriores da Jornada 2 sem esse registro mantêm a atividade voluntária de cinco perguntas a +4 e os pontos já registrados. Não são convertidas, recontadas ou bloqueadas retroativamente. Para experimentar a nova integração dos Canais, iniciar uma nova tentativa usando “Recomeçar” na seleção de jornadas ou “Jogar novamente” no resumo. As tentativas anteriores permanecem arquivadas pelo mecanismo existente.

A Jornada 1 mantém seus quatro dilemas, narrativas, bancos e atividade voluntária originais. Nenhuma alteração na cidade, no accordion, nas ilustrações, nos avatares selecionáveis ou nas perguntas dos Guardiões.

## Arquivos desta rodada

- `src/data/journey2Missions.ts` e `src/components/mission/MissionDialogue.tsx`: retirada dos vínculos visuais dos personagens narrativos.
- `src/data/independentCardScenarios.ts` (novo) e `src/components/mission/MissionConsequence.tsx`: enunciados autônomos e convite de participação antes da conclusão.
- `src/services/missionChannels.ts` (novo), `src/types/game.ts`, `src/game/engine.ts` e `src/services/learningScore.ts`: registros versionados, validação das respostas, bloqueio de conclusão, pontuação única e resumo dos créditos.
- `src/components/cards/MissionChannelActivity.tsx` (novo) e `InstitutionalCardModal.tsx`: integração no painel existente e manutenção da consulta livre.
- `src/components/summary/JourneyClosing.tsx`, `PilotSummary.tsx`, `src/App.tsx` e `src/components/ui/RulesModal.tsx`: encerramento único, retorno às jornadas e textos das regras e do resumo.
- `tests/journey2Editorial.test.ts`, `tests/journey2/local.test.ts` e `scripts/verify-journey2-browser.mjs`: cobertura das alterações e capturas.

## Testes e resultados

| Verificação | Resultado |
| --- | --- |
| TypeScript | Aprovado: `node.exe node_modules/typescript/bin/tsc --noEmit` |
| Testes automatizados | **59 aprovados, zero falhas**: `node.exe --import tsx --test tests/*.test.ts tests/journey2/*.test.ts` |
| Conteúdo editorial | Comparação integral com o Markdown aprovado; preservadas as 16 alternativas, consequências e reflexões. SHA-256 do roteiro: `638ae9fab5fe302484b9826dc137200ed032d62ac2639725c2532aff3a491ff6` |
| Jornada 2 em navegador | Dois percursos completos em 1440 e 390 px; **64 verificações de layout**, zero erros de execução e zero chamadas à API |
| Personagens | Ausência de imagens conferida em cada uma das 30 etapas de contexto e diálogo; capturas específicas de Caio |
| Canais | Participação nas quatro missões; pergunta pendente preservada; reabertura com feedback e alternativas bloqueadas; quatro questões distintas; retorno ao mesmo trecho, inclusive após recarga |
| Participação no final da missão | Quarta missão exercitou o convite após as cartas; o resumo só foi liberado depois da resposta |
| Acerto e erro | Percurso de acertos: **100/100**. Percurso de erros: **0/100**, concluído com medalha e Guia Lilás; sem penalidade por resposta inadequada |
| Compatibilidade | Testes de snapshot anterior com créditos +4 mantidos e sem bloqueio retroativo; Jornada 1 e novas tentativas não herdam pontos |
| Encerramento | Todos os parágrafos e link presentes sem avançar trechos; URL cadastrada, nova aba, `noopener noreferrer`; retorno às jornadas preservou conclusão |
| Teclado | Decisões e alternativas acionadas por Enter; foco dentro do modal com Tab; Escape fecha o painel e permite retomar a leitura |
| Fonte e contraste | Verificação complementar com fonte Extra e alto contraste em 320, 390, 768 e 1440 px, sem corte de alternativas ou excesso horizontal |
| Áudio | Síntese simulada confirmou leitura somente da fala visível e cancelamento ao avançar. Ao abrir os Canais, a narração anterior é interrompida |
| Regressão da Jornada 1 | Dois percursos completos na compilação institucional isolada, na raiz e em subpasta: **248 verificações dimensionais**, sem chamadas a API ou recursos bloqueados |
| Compilação | Builds normal e institucional aprovados em diretórios isolados. Jornada 2 continua bloqueada para publicação; conferida a ausência de 11 falas específicas do roteiro nas duas saídas. Build normal conserva o aviso de chunk maior que 500 kB |

A verificação móvel utiliza emulação de viewport no navegador. A pronúncia real depende das vozes do dispositivo; os testes de áudio simulam a API de síntese. Leitor de tela e experiência em aparelho físico continuam sujeitos à conferência humana.

Evidências: `artifacts/development/journey2-integrada-20261031/browser/resultados.json`, `original-browser/resultados.json`, `a11y-resultados.json` e `preservacao-publicacao.json`.

## Capturas para conferência

| Apresentação | Computador | Celular |
| --- | --- | --- |
| Caio sem retrato | [1440 px](../artifacts/development/journey2-integrada-20261031/browser/caio-dialogue-1440.png) | [390 px](../artifacts/development/journey2-integrada-20261031/browser/caio-dialogue-390.png) |
| Canais e feedback | [1440 px](../artifacts/development/journey2-integrada-20261031/browser/j2-m02-channels-1440.png) | [390 px](../artifacts/development/journey2-integrada-20261031/browser/j2-m02-channels-390.png) |
| Encerramento e ações | [1440 px](../artifacts/development/journey2-integrada-20261031/browser/closing-1440.png) | [390 px](../artifacts/development/journey2-integrada-20261031/browser/closing-390.png) |

As demais capturas, por missão e etapa, estão na mesma pasta `browser`.

## Acesso e preservação da publicação

Servidor local: **http://127.0.0.1:5173/**. Selecionar “Entre escolhas e cuidados” e iniciar uma **nova tentativa** para experimentar a regra dos Canais por missão. Para iniciar o servidor novamente: `npm.cmd run dev:local`.

O pacote `artifacts/institutional/Entre-Nos-Institucional.zip` permanece com SHA-256 `d9b69ca73613023301d29b3fe7f48e720f3638446eca7698232a296596b9af35`. A pasta de publicação manual continua idêntica a ele, arquivo a arquivo: **23 arquivos, 8.328.007 bytes**, tamanhos e SHA-256 correspondentes. Não foi gerado nem substituído pacote de publicação; os builds e capturas desta rodada estão somente em `artifacts/development`.

Nenhum commit, push, merge ou deploy realizado. A Jornada 2 permanece exclusiva do ambiente local de desenvolvimento.
