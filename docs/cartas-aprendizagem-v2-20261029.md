# Segunda Chance e Revés — implementação e validação

Data: 29/10/2026. Branch `ajustes-tela-inicial-20261021`. Alterações locais, sem commit, push, merge ou deploy.

## Regras encontradas antes da alteração

Havia cinco situações de Segunda Chance com duas alternativas construtivas, sem gabarito, e cinco situações de Revés com três alternativas e feedback que favorecia a segunda. Nenhuma pergunta de carta concedia bônus. O sorteio atribuía Sorte +3, Revés −3 e Segunda Chance +1, separados dos pontos de aprendizagem do piloto.

O piloto tinha até 40 pontos de consulta e 80 de desafios dos Guardiões/canais, totalizando 120. Decisões dos dilemas não recebiam pontos por adequação moral ou concordância. Respostas de cartas eram salvas por índice em chaves `entre-nos-reflection-*`, sem versão do enunciado.

O botão de revisão do piloto alternava descrições dentro dos cards dos participantes, acima do botão, mostrando somente as alternativas escolhidas por eles. Não havia comando desconectado, mas a mudança podia ficar fora da área visível e não incluía necessariamente todas as alternativas.

## Resultado implementado

- Dez perguntas revisadas: cinco de cada carta, com exatamente três alternativas, uma mais adequada e dois equívocos plausíveis. Gabaritos em posições variadas; feedback para cada alternativa, explicação e fundamento pedagógico explícitos. Preservados os temas de escuta, informação nova, comunicação, canais, impactos entre equipes, participação, prazos, informação sensível e conflitos de interesses.
- Dados com `version: 2`, `correctIndex`, `rationale` e `basis`. Os fundamentos são pedagógicos; não constituem validação jurídica das competências de cada órgão. Procedimentos locais e referências normativas podem ser complementados pela revisão institucional.
- Pergunta complementar à missão: nunca altera a escolha original. A seleção fica destacada com texto e `aria-pressed`; a confirmação bloqueia as opções e encaminha o foco ao feedback. Resultado, explicação, alternativa mais adequada e pontos aparecem na própria tela.
- Resposta adequada: +5 pontos de conhecimento. Demais respostas: +0, sem retirada por erro. Sorteio preservado: Sorte +3, Revés −3, Segunda Chance +1. A interface separa os dois efeitos, inclusive após resposta.
- Novo registro único por jornada/missão: `entre-nos-card-knowledge-v2-*`, com versão, tipo, pergunta e resposta. O bônus é derivado desse registro; não há crédito aditivo que possa ser repetido. Confirmar novamente retorna a resposta existente. IDs de jornada separam partidas.
- O registro é criado quando a pergunta é apresentada. O máximo das cartas soma +5 por pergunta atual apresentada, incluindo perguntas respondidas inadequadamente. Sorte, registros antigos e oportunidades não apresentadas não aumentam esse máximo.
- No encerramento: total de aprendizagem com máximo variável, discriminação da jornada (até 120), conhecimento das cartas com seu máximo real, conhecimento dos desafios e pontos de sorte separados. Não se apresenta 140 como meta fixa. A medalha e a identificação final não dependem do acerto.

## Respostas e partidas anteriores

As dez situações antigas foram congeladas como banco legado, sem excluir conteúdos. Se já havia resposta confirmada, são preservados enunciado, alternativas, feedback e índice originais, apenas para consulta, com aviso de ausência de reavaliação e bônus retroativo. Isso inclui as antigas perguntas de duas alternativas, que não se tornam novos desafios interativos.

Uma oportunidade antiga ainda não respondida usa a versão revisada, registrando sua própria versão. Dados inválidos ou versões desconhecidas não concedem pontos. Não há migração dos pontos da jornada nem alteração dos snapshots do motor.

## Revisão e acessibilidade

“Rever detalhes das alternativas” agora abre um painel imediatamente abaixo do botão, com todas as alternativas e aviso de consulta sem mudança de decisão. O botão possui estado visual, `aria-expanded`, `aria-controls` e alvo de ID estável. O painel fechado permanece oculto para navegação e tecnologias assistivas. A interface coletiva legada de `MissionReveal` não foi modificada.

Preservadas as preferências de fonte, alto contraste, redução de movimento e narração. Os novos controles usam tamanho legível, foco visível, estados textuais e semântica de seleção. Nenhuma imagem ou arquivo de áudio foi alterado.

## Testes e evidências

- `npm test`: 27 testes aprovados, incluindo quatro novos testes do banco, gabaritos, pontuação única, confirmação repetida, retomada, registros antigos, entradas inválidas e isolamento entre jornadas.
- `npm run lint`: TypeScript aprovado.
- `npm run build`: build normal aprovado.
- `npm run package:institutional`: build institucional, validação e ZIP aprovados. Permanece o aviso conhecido de JavaScript acima de 500 kB.
- `npm run test:institutional:browser`: duas jornadas completas, na raiz e em `/entre-nos/`, quatro missões e Guardiões distintos, mantendo a descoberta progressiva. 96 verificações de dimensões em 320, 390, 768 e 1440 px, sem rolagem horizontal; incluídos os painéis de revisão e feedback, texto Extra, alto contraste e redução de movimento.
- Na primeira jornada: acertos nas três perguntas de cartas apresentadas, 15/15 nas cartas e 135/135 no total. Na segunda: respostas inadequadas e uma resposta antiga preservada, 0/10 nas perguntas atuais e 40/130 no total. O sorteio foi controlado somente no navegador de teste para cobrir Segunda Chance, Revés e Sorte, sem alteração no código de produção.
- Seleção das respostas por teclado, feedback com foco, opções desabilitadas, tentativa de alterar após confirmação, recarga e retomada na carta confirmadas. A decisão original permaneceu intacta. Também verificadas retomada no encontro e no encerramento, reinício, seleção final, medalha, avaliação/PDF e composição/PNG.
- Nenhuma tentativa de API antiga ou HTTP externo, erro de execução ou recurso quebrado nas jornadas aprovadas com extensões desabilitadas.
- ZIP extraído por ferramenta independente (`Expand-Archive`), com tamanho e SHA-256 dos 23 arquivos comparados ao inventário.

Evidências atuais: `artifacts/institutional/verification/resultados.json`, `zip-check.json`, capturas dos painéis e PDFs. A verificação anterior de variáveis de ambiente é histórica; não foi repetida nesta etapa. Não foram instaladas dependências.

Celulares foram emulados; não houve ensaio em dispositivos físicos ou leitor de tela. Navegação por teclado, foco e atributos foram verificados, sem equivaler a certificação completa de acessibilidade. Controles de narração foram testados com instrumentação e início nativo; pronúncia e qualidade sonora exigem escuta humana. O navegador/sistema pode utilizar voz remota. Pontuação e progresso locais não são registros invioláveis e podem ser alterados por quem controla o navegador. Preferências e progresso dependem da mesma origem web; sem armazenamento persistente, continuam disponíveis somente na página aberta conforme o adaptador existente.

## Arquivos desta etapa

1. `src/data/fortuneScenarios.ts` — banco revisado e preservação do legado.
2. `src/services/cardKnowledge.ts` — registro versionado, confirmação e cálculo das cartas.
3. `src/services/learningScore.ts` — integração do bônus e máximo variável.
4. `src/components/mission/MissionConsequence.tsx` — perguntas, seleção, feedback e resultado imediato.
5. `src/components/mission/ParticipantReveal.tsx` — painel de revisão.
6. `src/components/summary/PilotSummary.tsx` — discriminação dos pontos e oportunidades.
7. `src/components/ui/RulesModal.tsx` — regras atualizadas.
8. `tests/cardKnowledge.test.ts` — testes adicionais.
9. `scripts/verify-institutional-browser.mjs` — testes funcionais e capturas dos painéis.
10. Este relatório.

Motor, missões, Guardiões, avatares, imagens, medalha, avaliação, APIs e configuração de publicação não foram alterados. As alterações locais anteriores foram mantidas.

## Pacote e retorno

Novo ZIP: `artifacts/institutional/Entre-Nos-Institucional.zip`, 8.444.166 bytes, 23 arquivos estáticos. Inventário atualizado em `artifacts/institutional/inventario.json`.

SHA-256: `0bf3c37ad63dc4a5e4499a771a0d25b3e726a77249b0211c6f429f148eeee884`.

Pacote anterior, inventário, hash e evidências preservados em `artifacts/institutional/rollback-antes-cartas-v2-20261029/`. Hash anterior: `baead266283c22e4e3ca08d931d89f11ddeabe737551d62016f58e653da85b20`.

A pasta de publicação manual `artifacts/institutional/publicacao-concurso-2026/site` não foi atualizada nesta etapa. A entrega revisada está no novo ZIP. A publicação depende de autorização posterior e teste do endereço público; nenhum deploy foi realizado.
