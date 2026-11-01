# Revisão integrada da experiência — 1º de novembro de 2026

Implementação local na branch `desenvolvimento/selecao-jornadas-20261030`. Foram preservados os trabalhos locais anteriores e o documento editorial `docs/decisoes-entre-nos-experiencia-e-evolucao-2026-11-01.md`, encontrado durante a execução. Nenhum commit, push, merge ou deploy realizado.

## Resultado

Nas **novas tentativas das duas jornadas**, a sequência agora é:

1. História e dilema.
2. Decisão do jogador.
3. Escolhas dos participantes virtuais.
4. Consequência e reflexões na mesma apresentação.
5. Desafio das Cartas do Destino.
6. Desafio dos Guardiões da Integridade.
7. Desafio dos Canais de Atendimento.
8. Próxima missão ou resumo da jornada.

Consequência/reflexões e cartas aparecem em ordem na mesma página, sem criar um avanço intermediário obrigatório. O botão entre participantes e consequência passou a **“E depois da sua escolha?”**.

### Narrativa

- A abertura da Jornada 2 apresenta o título e os três parágrafos completos em uma única seção, com “Começar jornada” disponível imediatamente.
- O agrupamento de falas consecutivas permanece: 15 trechos nas quatro missões da Jornada 2, com a mesma ordem e conteúdo integral. Os rótulos estruturais “Narração”, “Contexto” e “Pergunta ao jogador” deixam de ocupar cabeçalhos; as frases e perguntas continuam visíveis.
- A consequência específica, a reflexão da alternativa e a reflexão final da Jornada 2 são mostradas juntas, com distinção visual. Na Jornada 1, consequência e feedback pedagógico aprovados também ficam juntos.
- Não houve redução da fonte para acomodar textos. O celular utiliza rolagem vertical normal quando necessário.

### Guardiões, cartas e Canais

- Os Guardiões aparecem após as cartas. A pergunta é selecionada pelo mecanismo existente e apresentada automaticamente, sem “Iniciar desafio”, introduções genéricas ou antecipação da orientação antes da decisão.
- Mantidas imagem, nome, função individual e valores. A pergunta utiliza a área ao lado da imagem no computador; os botões Verdadeiro/Falso têm largura proporcional. Tema e indicação “Ganhe 15 pontos” aparecem discretamente. Explicações e referências continuam após a resposta.
- As cartas mantêm as três opções, sorteio independente da decisão, efeitos e perguntas existentes, com o título **“Desafio das Cartas do Destino”**. Foram reduzidas as instruções repetidas. Os enunciados reutilizáveis são apresentados de forma independente da missão também na nova sequência da Jornada 1.
- O **“Desafio dos Canais de Atendimento”** abre sua pergunta depois dos Guardiões. A participação continua necessária, sem exigir acerto. Fechar sem responder não conclui a missão; reabrir conserva a questão pendente. Depois da resposta, “Fechar pergunta” libera as informações e “Voltar ao jogo” conclui a etapa, sem exigir leitura de todos os canais.
- O botão amarelo permanente deixa de aparecer nas fases de missão da nova sequência. O menu continua oferecendo consulta informativa; abrir esse menu antes da etapa dos Canais não reserva pergunta nem concede pontos. Fora das missões, a consulta continua livre e sem pontos.
- As explicações repetidas sobre participação, penalidades e pontuação foram retiradas do painel da nova sequência. As regras e o resumo continuam contendo os detalhes necessários.

### Confetes

Restabelecida uma celebração breve somente após novos acertos pontuados em cartas, Guardiões e Canais. Ela não ocorre nas decisões dos dilemas, não reaparece ao retomar respostas e respeita a redução de animações. Os elementos são decorativos, ocultos de leitores de tela e não capturam cliques ou foco. A animação usa CSS, sem novas dependências.

## Salvamentos e pontuação

**Não foi aplicada migração de partidas em andamento.**

O campo `missionFlowVersion: 2` é criado somente ao iniciar uma nova tentativa. Partidas que não têm esse campo mantêm a sequência anterior, inclusive Guardião antes da decisão e suas regras originais dos Canais. A retomada não acrescenta o campo, não converte fases e não reavalia respostas antigas.

As novas tentativas das duas jornadas adotam quatro participações dos Canais a **+5 por acerto**, conforme a regra solicitada, mantendo até **20 pontos** nessa atividade. Na Jornada 1, isso substitui apenas nas novas tentativas as cinco perguntas voluntárias a +4. Salvamentos anteriores conservam os créditos e a regra de +4. O máximo completo permanece em **100 pontos de aprendizagem**: Guardiões até 60, cartas até 20 e Canais até 20. Os efeitos de sorteio permanecem separados e inalterados. Nenhuma decisão de dilema recebe nota.

O registro versionado `missionChannelActivity` continua separando questão e resposta por missão. Na nova sequência, sua abertura e resposta só são aceitas na fase `MISSION_CHANNELS`.

O campo `cardChallenges` espelha a confirmação existente da pergunta da carta, com validação de identificador, tipo de carta e alternativa. É somente um registro de conclusão para controlar a ordem; não soma uma segunda pontuação. Se a confirmação da carta foi salva localmente antes da interrupção, a interface recompõe esse registro ao retomar, sem repetir o crédito ou a celebração. Partidas antigas não recebem esse espelho automaticamente.

## Arquivos principais desta rodada

| Área | Arquivos |
| --- | --- |
| Ordem e persistência | `src/types/game.ts`, `src/game/engine.ts`, `src/services/missionChannels.ts` |
| Integração das etapas | `src/App.tsx`, `src/components/mission/MissionSituation.tsx`, `MissionDialogue.tsx`, `ParticipantReveal.tsx`, `MissionOutcome.tsx`, `MissionConsequence.tsx` |
| Apresentação dos desafios | `GuardianEncounter.tsx`, `src/components/cards/MissionChannelActivity.tsx`, `InstitutionalCardModal.tsx`, `ChannelActivity.tsx` |
| Abertura e narrativa | `src/components/lobby/JourneyOpening.tsx`, `src/components/mission/NarrativeReader.tsx` |
| Celebração e regras | `src/services/learningCelebration.ts`, `src/components/ui/LearningCelebration.tsx`, `LearningConfetti.tsx`, `RulesModal.tsx`, `src/index.css` |
| Verificação | `tests/journey2/flow.test.ts`, fixtures explícitas nos testes anteriores, `scripts/verify-integrated-flow-browser.mjs`, `browser-devtools.mjs`, `legacy-browser-fixture.mjs` e os dois verificadores de navegador anteriores |

Os verificadores anteriores foram mantidos como regressão da sequência legada, usando fixtures de salvamento somente em perfis isolados de teste. O novo verificador cobre a sequência atual das duas jornadas. Nenhuma dessas fixtures é executada pelo jogo.

## Testes e evidências

| Verificação | Resultado |
| --- | --- |
| TypeScript e `git diff --check` | Aprovados |
| Testes automatizados | **65 aprovados, zero falhas**, incluindo ordem das duas jornadas, resposta inadequada sem bloqueio por erro, créditos únicos, arquivamento, retomada em cada fase e reinício independente |
| Nova sequência no navegador | **Quatro percursos completos**: duas jornadas em 1440 e 390 px; **120 verificações de layout**, sem erros de execução ou chamadas à API |
| Pontuação | Percursos com acertos em 100/100; com erros em 0/100, concluídos normalmente |
| Retomada | Conferida após cartas, Guardiões, Canais e resumo; decisões, respostas, créditos e identidade da tentativa preservados |
| Acessibilidade | Avanços e respostas por teclado, fechamento e reabertura do painel, foco no canal selecionado, fonte Extra nos novos Guardiões em ambos os tamanhos e ausência de cortes ou excesso horizontal |
| Confetes | Animação CSS conferida após acertos; ausência após erros, decisões e recarga; suprimida no percurso com redução de animações |
| Jornada 1 anterior | Dois percursos completos de fixtures da sequência legada, na raiz e em subpasta: **248 verificações dimensionais**, sem chamadas à API ou recursos bloqueados |
| Jornada 2 anterior | Dois percursos completos de fixtures legadas em 1440 e 390 px: **68 verificações de layout**, sem erros ou chamadas à API |
| Compilação | Builds normal e institucional aprovados em diretórios isolados de desenvolvimento; nenhuma atualização de publicação |

Comandos de referência:

```text
node.exe --import tsx --test tests/*.test.ts tests/journey2/*.test.ts
node.exe node_modules/typescript/bin/tsc --noEmit
node.exe --import tsx scripts/verify-integrated-flow-browser.mjs
```

O último comando pressupõe o servidor local ativo. Os relatórios JSON, capturas e builds de conferência ficam em `artifacts/development/revisao-integrada-20261101/`. A verificação móvel utiliza emulação de viewport; as vozes reais do dispositivo e leitores de tela ainda merecem conferência humana.

### Capturas

| Tela | Computador | Celular |
| --- | --- | --- |
| Abertura única da Jornada 2 | [1440 px](../artifacts/development/revisao-integrada-20261101/browser/opening-entre-escolhas-e-cuidados-1440.png) | [390 px](../artifacts/development/revisao-integrada-20261101/browser/opening-entre-escolhas-e-cuidados-390.png) |
| Consequência, reflexão e acesso às cartas | [1440 px](../artifacts/development/revisao-integrada-20261101/browser/j2-m02-outcome-1440.png) | [390 px](../artifacts/development/revisao-integrada-20261101/browser/j2-m02-outcome-390.png) |
| Guardião com pergunta imediata | [1440 px](../artifacts/development/revisao-integrada-20261101/browser/j2-m01-guardian-1440.png) | [390 px](../artifacts/development/revisao-integrada-20261101/browser/j2-m01-guardian-390.png) |
| Guardião com fonte Extra | [1440 px](../artifacts/development/revisao-integrada-20261101/browser/j2-m01-guardian-extra-1440.png) | [390 px](../artifacts/development/revisao-integrada-20261101/browser/j2-m01-guardian-extra-390.png) |
| Canais após os Guardiões | [1440 px](../artifacts/development/revisao-integrada-20261101/browser/j2-m01-channels-feedback-1440.png) | [390 px](../artifacts/development/revisao-integrada-20261101/browser/j2-m01-channels-feedback-390.png) |

## Preservação e pontos de atenção

- Os arquivos editoriais de narrativas, alternativas, consequências, reflexões, bancos de perguntas, respostas e referências permaneceram intactos, assim como as imagens. Foram ajustadas a apresentação e a sequência de interação; o enquadramento autônomo dos enunciados de Caminhos utiliza o adaptador de apresentação já existente, sem mudar alternativas, respostas ou competências.
- A tela inicial, a cidade aprovada, o accordion, os avatares, a descoberta dos Guardiões, os encerramentos e a avaliação foram preservados.
- É necessário iniciar uma **nova tentativa** para testar a ordem reorganizada. Retomar uma tentativa antiga deve continuar mostrando sua sequência anterior; esse comportamento é intencional.
- As reflexões específicas dos Guardiões, mencionadas no documento editorial consolidado, dependem de conteúdo aprovado. Não foram inventadas falas nem acrescentadas questões ao banco. As 12 perguntas futuras registradas naquele documento não foram incorporadas nesta rodada.
- O build normal conserva o aviso de chunk acima de 500 kB; isso não impediu a compilação. O institucional ficou abaixo desse limite após usar CSS para os confetes.
- O pacote institucional anterior e a pasta de publicação manual continuam idênticos: **23 arquivos, 8.328.007 bytes**, tamanhos e SHA-256 correspondentes. SHA-256 do ZIP: `d9b69ca73613023301d29b3fe7f48e720f3638446eca7698232a296596b9af35`. Inventário de preservação em `preservacao-publicacao.json` na pasta de evidências.

## Proposta futura registrada — não implementada

Aviso institucional opcional na entrada da Cidade dos Encontros, por exemplo para divulgar o Minuto da Ética: um aviso por vez, conteúdo e link configuráveis, possibilidade de dispensar e controle local por identificador/versão para evitar repetição no mesmo navegador. Sem backend, infraestrutura adicional ou interferência na jornada. O conteúdo e a apresentação dependerão de aprovação futura. Nenhum aviso foi incluído na tela inicial nesta rodada.

## Acesso local

Abrir **http://127.0.0.1:5173/** e iniciar uma nova tentativa da jornada desejada. Para reiniciar o servidor: `npm.cmd run dev:local`. A Jornada 2 continua disponível apenas nesse ambiente de desenvolvimento; não foi habilitada para publicação.
