# Preparação técnica para múltiplas jornadas — 30/10/2026

Implementação local. Sem commit, push, merge, deploy ou atualização dos pacotes de publicação. As alterações preexistentes no diretório de trabalho foram preservadas.

## Escopo implementado

- Catálogo em `src/data/journeys.ts`: `cidade-dos-encontros`, versão 1, com lista explícita `missao-1` a `missao-4`; `entre-escolhas-e-cuidados`, em revisão editorial, sem missões e bloqueada para início.
- Identificação de conteúdo por `journeyDefinitionId` e `journeyContentVersion`, separada do `journeyId` que continua identificando a tentativa.
- `journeyDefinition`, `journeyMissions` e `playableJourney` resolvem o catálogo, verificam referências e impedem início de conteúdo indisponível.
- Metadados opcionais de abertura, encerramento e recursos externos por jornada. Não foram criados textos narrativos, links ou interfaces novas. A apresentação desses recursos fica para a futura integração autorizada.
- Motor e cálculo de aprendizagem consultam as missões da definição ativa. A configuração da Jornada 1 continua oferecendo exatamente as quatro missões atuais.

## Salvamento e migração

`src/services/journeyStorage.ts` mantém um índice versionado e um registro por definição de jornada e tentativa. Cada registro contém o estado de uma sala, suas credenciais e o snapshot correspondente. Registros ativos são atualizados durante a partida; uma nova tentativa recebe outra chave, preservando a anterior.

Antes de interpretar o snapshot legado, a migração preserva uma cópia dos seus bytes exatos e credenciais em `entre-nos-journeys-v1-legacy-backup`. A migração não modifica o snapshot de origem. Salvamentos sem identificação de conteúdo são associados à Jornada 1 no índice; não recebem pontos nem versões de regras retroativas. Tentativas anteriores ao `journeyId` recebem identificação de arquivo derivada da sala e data original, mantendo a identidade antiga usada pela aprendizagem.

O armazenamento antigo da aba é copiado antes de aposentar suas credenciais ativas, evitando que elas sejam importadas novamente após um reinício. Dados inválidos e índices incompatíveis interrompem a migração, preservando os registros para recuperação.

O serviço arquiva o estado antes e depois das mensagens locais, inclusive antes de reiniciar ou descartar a seleção ativa. O snapshot antigo continua sendo utilizado como cache de compatibilidade da sessão ativa. Remover esse cache não remove as tentativas arquivadas nem suas respostas de aprendizagem. `resumeAttempt` prepara a retomada individual, com serialização pela mesma fila do serviço; a função ainda não é exposta na interface do piloto.

As respostas de cartas e Canais continuam nas chaves existentes por tentativa. Os registros legados de aprendizagem permanecem intactos. Não há recontagem, reavaliação ou soma de bônus na migração.

## Banco compartilhado de verdadeiro ou falso

`src/data/trueFalseQuestions.ts` define o banco versão 1, reunindo as cinco questões de ética existentes e as duas questões anteriormente embutidas nas missões. Não depende de missões ou jornadas. `pilot.ts` mantém as mesmas associações temáticas e de Guardiões. As missões legadas referenciam as questões centrais por ID.

IDs, enunciados, respostas, explicações, fontes e ordem do conjunto foram preservados. A comparação do arquivo original de missões com o atual, reinserindo somente os dois objetos extraídos, resulta em igualdade integral. Nenhuma narrativa, alternativa, consequência ou reflexão foi alterada.

Regras v4 preservadas: abertura 0; Guardião +15 por resposta adequada; carta +5 por resposta adequada; Canais +4 por questão adequada, cinco oportunidades. Efeitos das cartas e versões anteriores permanecem separados e inalterados. A simples ampliação futura dos bancos não está autorizada por esta entrega.

## Arquivos de implementação

Novos:
- `src/data/journeys.ts`
- `src/data/trueFalseQuestions.ts`
- `src/services/journeyStorage.ts`
- `tests/journeys.test.ts`

Ajustados:
- `src/data/missions.ts`: somente referência às duas questões extraídas.
- `src/data/pilot.ts`: lista explícita de missões e consumo do banco central.
- `src/types/game.ts`: identificação da definição e versão do conteúdo.
- `src/game/engine.ts`: identificação ativa, validação de disponibilidade e resolução das missões.
- `src/services/learningScore.ts`: oportunidades de cartas e missões da jornada ativa, sem alterar valores.
- `src/services/socket.ts`: migração, arquivo de tentativas e retomada técnica.
- `tests/socketRestart.test.ts`: preservação da aba e retomada da tentativa anterior.
- `scripts/verify-institutional-browser.mjs`: permite escolher compilação e diretório de evidências por variáveis de ambiente; comportamento padrão preservado.

Nenhum componente TSX, estilo, imagem ou controle visual foi alterado nesta entrega.

## Validação

- Suíte completa: **44 testes aprovados**, incluindo nove novos testes de catálogo, migração, isolamento e preservação de créditos. O teste existente do serviço foi ampliado para retomar uma tentativa arquivada.
- `tsc --noEmit`: aprovado.
- Build institucional: aprovado em `artifacts/technical-verification/journeys-20261030/build`, separado da distribuição estável.
- Primeira verificação completa de navegador: aprovada, com duas execuções completas das quatro missões (raiz e subpasta), 224 verificações de dimensões, retomada, reinício, teclado, preferências de acessibilidade, fontes ampliadas e controles de áudio. Sem erros de execução, recursos ausentes ou chamadas às APIs antigas. Síntese de voz teve controles testados por simulação; a pronúncia audível não foi certificada.
- Verificação final de navegador após ajuste da migração da aba: aprovada, novamente com dois percursos completos, 224 verificações de dimensões, sem erros de execução, recursos ausentes ou chamadas às APIs antigas; evidências em `artifacts/technical-verification/journeys-20261030/browser-final`.
- A primeira execução de testes foi bloqueada pela restrição do Windows ao Node/tsx (`uv_os_get_passwd`); a suíte foi executada com a autorização do ambiente e passou.

## Preservação da publicação

O ZIP institucional anterior não foi regenerado. SHA-256:

`d9b69ca73613023301d29b3fe7f48e720f3638446eca7698232a296596b9af35`

A pasta `artifacts/institutional/publicacao-concurso-2026/site` permaneceu intacta. Comparação somente de leitura: seus **23 arquivos**, totalizando **8.328.007 bytes**, correspondem ao ZIP anterior por tamanho e SHA-256.

## Limitações e próxima etapa

- A Jornada 2 não está jogável; não contém missões, personagens, perguntas adicionais ou endereço do Guia Lilás.
- O seletor de jornadas e a apresentação de aberturas, encerramentos e links não foram implementados. Alguns textos e componentes continuam intencionalmente próprios do piloto; deverão ser integrados ao catálogo na etapa de interface.
- O banco versão 1 deve permanecer disponível sem alterações de gabarito. Revisões futuras exigem versionamento editorial e resolução das versões antigas antes de publicação.
- Salvamentos permanecem locais ao navegador e à origem. Apagar os dados do navegador remove também os arquivos de tentativas. O armazenamento pode atingir a cota ou funcionar somente em memória quando bloqueado; o aviso existente continua disponível.
- Não há sincronização nem resolução de edições concorrentes em múltiplas abas. A interface de consulta/recuperação das tentativas arquivadas depende de etapa posterior.
- Ampliar o banco dos Canais exige separar o conjunto de cinco oportunidades do tamanho total do banco; isso não foi alterado nesta etapa.

A inclusão da Jornada 2 e qualquer atualização dos pacotes ou publicação dependem de autorização posterior.
