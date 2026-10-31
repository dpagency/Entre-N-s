# Seleção expansível de jornadas — 30/10/2026

## Estado inicial e preservação

Antes de editar, foram consultados `git status --short` e a branch atual. Havia alterações locais e arquivos não registrados da implementação anterior. Não foi usado reset, stash, checkout de arquivos ou commit.

Branch de desenvolvimento: `desenvolvimento/selecao-jornadas-20261030`, criada a partir de `ajustes-tela-inicial-20261021` com todo o trabalho local mantido.

Foi preservada uma cópia de 108 arquivos de código, configuração, testes, scripts e documentos em `artifacts/development/journey-selection-20261030/baseline`. O manifesto registra caminhos, tamanhos e SHA-256. As cópias têm sufixo `.snapshot`, para não serem interpretadas pelo TypeScript como outra árvore de código.

Não houve commit, push, merge, deploy ou atualização do pacote de publicação.

## Interface e fluxo

`JourneyHome` apresenta a cidade original e um accordion vertical gerado por `JOURNEYS`. Há no máximo uma jornada aberta; novas entradas do catálogo são exibidas sem novos cartões ilustrados ou quantidade fixa de opções.

Cada entrada contém título, situação textual, descrição, progresso salvo quando existente e ações pertinentes:

- Sem tentativa: **Começar**.
- Em andamento: **Continuar** e **Jogar novamente**.
- Concluída: **Ver resumo** e **Jogar novamente**.
- Tentativas anteriores: ações individuais de retomada, com seu progresso.
- Em desenvolvimento: somente informações editoriais; não há botão de início.

Fluxo novo: seleção → avatar e apelido → mapa. A preparação mantém os quatro avatares e suas prévias, mas não cria uma etapa extra de confirmação no lobby. O início é serializado pela fila do serviço local. O fluxo de retomada restaura a tentativa e a etapa originais, sem passar pela seleção de avatar. O acesso **Início** do menu retorna à seleção sem apagar o jogo; a narração da missão é interrompida nessa transição, evitando áudio de conteúdo oculto.

O avatar padrão fica disponível na preparação de novas tentativas. Alterá-lo não reescreve o avatar ou as decisões das partidas arquivadas. O reinício pelo resumo continua disponível.

O accordion usa botões nativos, `aria-expanded`, `aria-controls`, regiões nomeadas e painéis ocultos fora da navegação. Tab, Enter e Espaço mantêm o comportamento nativo; setas, Home e End navegam pelos cabeçalhos. Foco, contraste, ampliação e quebra de texto utilizam os recursos existentes. O botão Início recebeu nome acessível também quando seu texto está oculto no celular.

## Jornada 2 e limites editoriais

`entre-escolhas-e-cuidados` continua em revisão editorial, com `missionIds: []`. Os quatro títulos e temas fornecidos foram registrados separadamente em `plannedMissions` e apresentados como planejamento:

1. Diferentes formas de trabalhar — capacitismo e acessibilidade.
2. Fora do padrão — racismo e padrões de aparência profissional.
3. Por seu próprio bem? — maternidade, discriminação e autonomia.
4. Quando alguém procura você — acolhimento diante de possível assédio moral.

Não foram criados diálogos, alternativas, consequências, personagens ou missões jogáveis. O bloqueio também é aplicado pelo serviço/motor, não apenas pela interface. Regiões, falas e demais detalhes da Jornada 2 dependem do roteiro integral aprovado em arquivo acessível.

O banco compartilhado de verdadeiro ou falso foi preservado. A seleção continua compatível com os Guardiões e não recebe filtro obrigatório pelo tema da missão.

## Cidade e futura arte

Recurso identificado: `public/personagens/cidade-dos-encontros.webp`, já utilizado no mapa.

SHA-256 original: `0a2c10847e10a3d4f3b52bf46be7417469abc0dd3b50f5702388495fdbfe2807`.

`cityArtwork.ts` centraliza o original e uma alternativa opcional, inicialmente nula e não aprovada. `CityImage` é compartilhado pela abertura e pelo mapa; a alternativa só é utilizada após configuração explícita de aprovação, com retorno ao original se falhar seu carregamento.

Nenhuma imagem foi gerada, alterada ou substituída. A futura arte deverá manter estilo, arquitetura, cores e perspectiva, acrescentando uma comunidade diversa caminhando, conversando, sentada e utilizando os espaços públicos. Sua aprovação e inclusão na lista de recursos estáticos são uma etapa separada.

## Guia Lilás

Foi conferida a página oficial da CGU em 30/10/2026:

[Guia Lilás — Ouvidorias/CGU](https://www.gov.br/ouvidorias/pt-br/prevencao-e-enfretamento-assedio-discriminacao/guia-lilas).

O catálogo da Jornada 2 contém o recurso **Conhecer o Guia Lilás**, com endereço oficial e situação editorial **pendente**. `JourneyResources` só apresenta recursos aprovados, com HTTPS, após todas as missões da respectiva jornada estarem concluídas e na tela de resumo. A Jornada 1 não recebe esse link. A Jornada 2 bloqueada também não o exibe.

O link abre em nova aba com aviso e `noopener noreferrer`. Não registra pontos, não é obrigatório e não inicia carregamento externo automático. Sua ativação depende da validação editorial e da futura disponibilização da jornada.

## Salvamentos

`savedJourneyAttempts` lê o arquivo já existente por jornada/tentativa, prefere a tentativa ativa e mantém acesso às anteriores. Checkpoints redundantes de preparação não aparecem como outra partida; uma preparação antiga ainda sem tentativa iniciada permanece retomável.

`startNewJourney` valida a disponibilidade antes de alterar o estado, arquiva os dados existentes, cria outra sala/tentativa e inicia a jornada com o perfil escolhido. Nenhum registro de aprendizagem é transferido para a nova identidade. A retomada continua usando os IDs originais e as versões antigas das regras.

O armazenamento continua local. Não foram acrescentados dependências, banco de dados, autenticação ou serviços remotos. Permanecem as limitações de cota, limpeza dos dados do navegador e concorrência entre abas. Partidas de dinâmicas anteriores ao piloto v2 continuam preservadas no arquivo, sujeitas à restrição de retomada já existente na edição institucional.

## Arquivos desta etapa

Novos:
- `src/components/lobby/JourneyHome.tsx`
- `src/components/board/CityImage.tsx`
- `src/components/summary/JourneyResources.tsx`
- `src/data/cityArtwork.ts`
- `src/services/journeySelection.ts`
- `tests/journeySelection.test.ts`
- Este relatório.

Ajustados:
- `src/App.tsx`: seleção inicial, foco de entrada e suspensão da narração ao voltar ao início.
- `src/components/lobby/WelcomeScreen.tsx`: preparação do avatar para a jornada selecionada.
- `src/components/board/TownMap.tsx`: imagem compartilhada e resolução das missões da jornada ativa, mantendo a dinâmica antiga quando aplicável.
- `src/components/mission/MissionConsequence.tsx`: quantidade de missões consultada no catálogo.
- `src/components/summary/PilotSummary.tsx`: resolução das missões e recursos específicos de encerramento.
- `src/components/ui/Navbar.tsx`: nome acessível do acesso Início.
- `src/data/journeys.ts`: planejamento editorial da Jornada 2 e metadados do Guia Lilás.
- `src/services/socket.ts`: início serializado de nova tentativa com perfil e jornada explícitos.
- `tests/socketRestart.test.ts`: troca de avatar, novo início e bloqueio sem mutação de estado.
- `scripts/verify-institutional-browser.mjs`: cenários de accordion, navegação, retomada de tentativas e novas ações.

## Validação e resultados

- **50 testes aprovados** na suíte completa. Incluem expansão do catálogo, bloqueio da Jornada 2, recursos sujeitos à aprovação/conclusão, preservação da imagem, retomada de preparação antiga, migração, isolamento de tentativas, regras antigas e ausência de créditos duplicados.
- **TypeScript aprovado** (`tsc --noEmit`).
- **Build institucional aprovado**, exclusivamente em `artifacts/development/journey-selection-20261030/build`.
- Comparação com o manifesto anterior à tarefa: missões, bancos de questões/cartas/Canais, motor e cálculo de pontuação continuam idênticos. Nenhuma narrativa, alternativa, consequência ou reflexão da Jornada 1 foi editada.
- Primeira execução de navegador completou os dois percursos de quatro missões e parou em uma referência desatualizada do teste: tentou clicar Continuar onde a ação correta era Ver resumo. O comando do teste foi corrigido.
- Verificação final do navegador **aprovada**: dois percursos completos e 248 verificações de dimensões; sem erros de execução, falhas de recursos ou chamadas às APIs antigas. Evidências em `artifacts/development/journey-selection-20261030/browser-final`.

A verificação cobre a raiz e a subpasta `/entre-nos/`, larguras de 320, 390, 768 e 1440 pixels, accordion exclusivo, teclado/foco, ampliação/contraste, Jornada 1 completa, Guardiões, cartas, Canais, resumo, medalha, avaliação, reinício, recuperação de partida concluída e nova tentativa com outro avatar. Os controles de áudio são verificados com simulação determinística; pronúncia audível não é certificada.

## Publicação e pendências

O ZIP e a pasta `artifacts/institutional/publicacao-concurso-2026/site` não foram atualizados. Conferência somente de leitura: 23 arquivos, 8.328.007 bytes, correspondentes por tamanho e SHA-256 ao ZIP estável. SHA-256 do ZIP: `d9b69ca73613023301d29b3fe7f48e720f3638446eca7698232a296596b9af35`. A compilação acima é somente uma evidência de desenvolvimento.

Pendências para aprovação posterior:

1. Roteiro integral aprovado e acessível da Jornada 2.
2. Aprovação da arte da cidade com pessoas e inclusão do novo recurso estático, mantendo o original.
3. Validação editorial do endereço/edição do Guia Lilás e liberação de seu recurso.
4. Conferência da interface e autorização separada para preparar qualquer publicação.
