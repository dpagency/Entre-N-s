# Canais — transição do feedback para a consulta

Branch: `desenvolvimento/selecao-jornadas-20261030`.

Ajuste restrito à apresentação do painel da Jornada 2 com participação por missão. As alterações locais das rodadas anteriores foram preservadas.

## Comportamento

- Antes da resposta, a pergunta e as alternativas permanecem disponíveis.
- Após a resposta, o resultado e a explicação pedagógica continuam sendo apresentados normalmente.
- O botão **Conhecer os canais** passa para a consulta informativa dentro do mesmo painel, removendo da área de leitura a atividade, as alternativas, o feedback e os controles de conteúdo complementar.
- Selecionar qualquer canal após responder executa a mesma transição e apresenta o canal escolhido.
- Na consulta, é possível alternar entre os cinco canais sem reapresentar a atividade. Fechar e reabrir o painel no mesmo contexto conserva essa visualização.
- A seleção reposiciona a leitura e o foco no título do canal. No computador, a coluna de detalhes retorna ao início; no celular, o conteúdo selecionado é levado à área visível do painel.
- Uma nova missão utiliza seu próprio contexto e apresenta sua pergunta normalmente. Fora das missões, a consulta informativa não gera atividade ou pontuação.

O modo de consulta é apenas estado da interface. Não apaga, modifica ou reenvia respostas. O motor, o banco de perguntas, a pontuação e os salvamentos não foram alterados nesta rodada. Permanecem uma participação por missão, +5 por acerto, erro sem penalidade, acerto opcional e proteção contra duplicação. A interface e as regras anteriores da Jornada 1 seguem seu ramo existente.

## Arquivos

- `src/components/cards/InstitutionalCardModal.tsx`: visualização informativa contextual, transição pela lista de canais, ajuste de foco e rolagem.
- `src/components/cards/MissionChannelActivity.tsx`: botão “Conhecer os canais” após o feedback.
- `scripts/verify-journey2-browser.mjs`: verificação de ambas as formas de transição, navegação entre canais, ocultação da atividade, foco e preservação dos registros.

## Verificação

- TypeScript e `git diff --check`: aprovados.
- 59 testes automatizados aprovados, sem falhas.
- Dois percursos completos da Jornada 2, em 1440 e 390 px, com 72 verificações de layout, sem erros de execução ou chamadas à API.
- Testadas transição pelo botão e diretamente pela lista, acionamento por Enter, foco no título selecionado, navegação pelos cinco canais, fechamento por Escape, reabertura e retorno à narrativa sem perda de progresso.
- Conferidos quatro registros de participação distintos por tentativa e manutenção dos totais de 100/100 e 0/100 nos percursos de acertos e erros.
- Compilação institucional de conferência gerada somente em `artifacts/development/canais-consulta-20261031/institutional-build`.
- Regressão completa da Jornada 1 aprovada na raiz e em subpasta: dois percursos, 248 verificações dimensionais, sem chamadas a API ou recursos bloqueados. Evidência: `artifacts/development/canais-consulta-20261031/original-browser/resultados.json`.

Evidência principal: `artifacts/development/canais-consulta-20261031/browser/resultados.json`.

## Capturas

- [Consulta no computador, 1440 px](../artifacts/development/canais-consulta-20261031/browser/j2-m01-information-1440.png).
- [Consulta no celular, 390 px](../artifacts/development/canais-consulta-20261031/browser/j2-m02-information-390.png).
- As capturas do feedback e das demais etapas estão na mesma pasta `browser`.

Disponível localmente em **http://127.0.0.1:5173/**. A Jornada 2 continua restrita aos testes locais. Não houve atualização do pacote ou da pasta de publicação, commit, push, merge ou deploy.
