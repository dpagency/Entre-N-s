# Cartas, resumo e Guardiões — ajustes finais

Branch: `desenvolvimento/selecao-jornadas-20261030`. Alterações locais anteriores preservadas. Sem commit, push, merge ou deploy.

## Implementado

### Tela independente das cartas

Após a consequência e as reflexões, o botão **“Vamos ao Desafio das Cartas do Destino!”** leva diretamente à tela **“Desafio das Cartas do Destino”**. Não há tela intermediária nem confirmação adicional.

As três cartas ficam centralizadas e inicialmente mostram o mesmo verso, sem nomes ou tipos antecipados. O sorteio continua acontecendo somente na seleção. Apenas a carta escolhida é revelada; as outras permanecem viradas. Mantidos efeitos, perguntas, feedbacks, referências, pontuação e confirmação única. A sequência seguinte continua sendo Guardiões → Canais → próxima missão.

### Resumo compacto

O total da aprendizagem permanece destacado. O resumo mostra somente os valores de Guardiões da Integridade, Canais de Atendimento e Cartas do Destino, com seus máximos. Os efeitos das cartas aparecem separadamente, fora da aprendizagem.

Os cálculos de `learningPoints` não foram alterados nesta rodada. Para salvamentos históricos com créditos de consulta, uma linha curta **“Consultas”** mantém esses créditos visíveis, sem explicações extensas e sem ocultá-los dentro de outra categoria. As explicações foram mantidas nas Regras, inclusive em **“Como interpretar o resumo”**. A legenda do total usa tamanho de leitura normal, enquanto o número continua destacado, evitando várias linhas grandes no celular.

### Quatro Guardiões

O rodízio já utilizava um embaralhamento dos quatro identificadores. Esse procedimento foi isolado em `shuffledGuardianOrder`, mantendo o mesmo algoritmo e a chamada única no início da tentativa. Não considera decisões, acertos ou suposta qualidade moral das escolhas.

Cada missão concluída utiliza a próxima posição da ordem salva. Os quatro personagens aparecem uma vez por tentativa de quatro missões. A ordem pode variar entre tentativas; por ser sorteio simples, duas tentativas podem eventualmente receber a mesma ordem, sem repetição dentro de uma delas.

A pergunta **“Com qual Guardião você mais se identificou nesta jornada?”** foi preservada. Agora sua exibição e a aceitação de uma nova identificação pelo motor exigem quatro encontros distintos com questões válidas e respostas registradas. O acerto não é exigido. Respostas, identidades e ordens já salvas não são reembaralhadas ou reavaliadas.

## Compatibilidade

A nova etapa é identificada por `cardStageVersion: 1`, criado somente em novas tentativas. A fase `MISSION_CARDS` e a mensagem `OPEN_CARD_CHALLENGE` registram a transição entre reflexão e cartas.

Tentativas anteriores sem esse campo mantêm as cartas na apresentação anterior, inclusive quando já possuem a sequência reorganizada `missionFlowVersion: 2`. Não há migração automática, novo sorteio, apagamento de respostas ou crédito retroativo. A retomada de uma tentativa nova na tela das cartas conserva seu estado antes ou depois da revelação.

O resumo compacto também pode apresentar resultados antigos, mas apenas reorganiza seus rótulos: total, máximos e créditos continuam vindo dos mesmos registros. A identificação final histórica já salva não é apagada, inclusive se um registro incompleto não permitir apresentar novamente a pergunta de identificação.

## Reflexões: diagnóstico e pendência editorial

Foram examinados os dados dos personagens, as introduções genéricas em `src/data/pilot.ts`, as narrativas e reflexões aprovadas das oito missões e a documentação dos Guardiões. Não foi encontrada uma matriz aprovada de reflexões próprias para cada combinação de personagem e dilema.

As perguntas e os feedbacks educativos existentes mantêm suas associações aos Guardiões. Para acrescentar uma reflexão narrativa específica sem repetir a conclusão da missão, seriam necessários textos editoriais próprios.

Foram preparadas **32 propostas**, cobrindo oito missões × quatro Guardiões, em [propostas-reflexoes-guardioes-20261101.md](propostas-reflexoes-guardioes-20261101.md). Cada proposta relaciona os valores do personagem ao dilema e pode acompanhar qualquer alternativa escolhida. **São rascunhos para validação; nenhuma proposta foi incorporada ao aplicativo.** A aprovação desses textos é a pendência para concluir essa parte editorial.

## Arquivos desta rodada

- `src/types/game.ts`, `src/game/engine.ts` e `src/App.tsx`: etapa independente e compatibilidade de retomada.
- `src/components/mission/MissionConsequence.tsx`: transição, cartas centralizadas, apresentação fechada e revelação após escolha.
- `src/components/summary/LearningScoreSummary.tsx` e `PilotSummary.tsx`: resumo compacto e condição da identificação final.
- `src/services/guardianJourney.ts`: embaralhamento e verificação dos encontros distintos.
- `src/components/ui/RulesModal.tsx`: explicações consultáveis fora do resumo.
- `tests/guardianJourney.test.ts`, `tests/learningSummary.test.ts`, `tests/journey2/flow.test.ts` e ajustes explícitos de fixtures antigas: validação da nova etapa e dos formatos anteriores.
- Verificadores de navegador: cartas viradas/reveladas, valores do resumo, Guardiões distintos e explicações históricas consultadas nas Regras.

Não houve alterações nas narrativas, alternativas, consequências, reflexões aprovadas, imagens, identidades, banco compartilhado de questões ou conteúdos institucionais dos Canais. A tela inicial e os encerramentos foram preservados.

## Validação

| Verificação | Resultado |
| --- | --- |
| Testes automatizados | **73 aprovados, zero falhas** |
| Novo fluxo no navegador | **Quatro percursos completos**: duas jornadas em 1440 e 390 px; **152 verificações de layout**, sem erros ou chamadas à API |
| Cartas | Ausentes na tela de reflexão; três versos sem identificação na tela seguinte; sorteio só após seleção; somente uma carta revelada; centralização e retomada verificadas |
| Pontuação | Percursos com acertos em 100/100 e com erros em 0/100; resumo confere 60/60, 20/20 e 20/20, ou os respectivos zeros, sem misturar efeitos de sorte/revés |
| Guardiões | Quatro IDs distintos em cada percurso; ordem preservada após recarga; possibilidade de ordens diferentes verificada sem testes aleatórios instáveis; identificação final disponível também com respostas inadequadas |
| Histórico | Testes percorrem tanto a nova fase separada quanto o formato integrado anterior, restaurando snapshots em cada etapa sem mudar valores ou ordem |
| Jornada 1 legada | Dois percursos completos na raiz e em subpasta: **248 verificações dimensionais**; conferidos créditos antigos de consulta nas Regras e no resumo, sem bônus retroativo |
| Jornada 2 legada | Dois percursos completos: **68 verificações de layout**, preservando perguntas, respostas e pontuação |
| Acessibilidade | Teclado, foco, fonte ampliada, redução de animações e ausência de cortes/excesso horizontal conferidos pelos percursos existentes e novos |
| Compilação | TypeScript e build institucional de conferência aprovados, somente em `artifacts/development/ajustes-finais-20261101/institutional-build` |

Relatórios JSON e capturas em `artifacts/development/ajustes-finais-20261101/`. Celular foi testado por emulação de viewport; não houve certificação por aparelho físico ou leitor de tela.

## Capturas para validação

| Tela | Computador | Celular |
| --- | --- | --- |
| Reflexão e transição | [1440 px](../artifacts/development/ajustes-finais-20261101/browser/j2-m01-cards-transition-1440.png) | [390 px](../artifacts/development/ajustes-finais-20261101/browser/j2-m01-cards-transition-390.png) |
| Cartas inicialmente viradas | [1440 px](../artifacts/development/ajustes-finais-20261101/browser/j2-m01-cards-closed-1440.png) | [390 px](../artifacts/development/ajustes-finais-20261101/browser/j2-m01-cards-closed-390.png) |
| Revelação após seleção | [1440 px](../artifacts/development/ajustes-finais-20261101/browser/j2-m02-cards-revealed-1440.png) | [390 px](../artifacts/development/ajustes-finais-20261101/browser/j2-m02-cards-revealed-390.png) |
| Resumo compacto completo | [1440 px](../artifacts/development/ajustes-finais-20261101/browser/learning-summary-entre-escolhas-e-cuidados-1440.png) | [390 px](../artifacts/development/ajustes-finais-20261101/browser/learning-summary-entre-escolhas-e-cuidados-390.png) |

## Acesso e preservação

Abrir **http://127.0.0.1:5173/** e iniciar uma **nova tentativa** para testar a tela independente das cartas. Retomar uma tentativa anterior deve conservar sua apresentação anterior das cartas. Para reiniciar o servidor, usar `npm.cmd run dev:local`.

A Jornada 2 permanece exclusiva dos testes locais. Nenhum pacote de publicação ou pasta `site` foi atualizado; a versão estável foi preservada. Sem commit, push, merge ou deploy.
