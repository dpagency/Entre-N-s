# Versão aprovada da tela inicial — 31/10/2026

Branch: `desenvolvimento/selecao-jornadas-20261030`.

## Escopo do registro

Tela inicial aprovada: ilustração integral ampliada até a largura do accordion, com altura proporcional e rolagem vertical; primeira jornada denominada **A régua da excelência**, preservando **Cidade dos Encontros** como universo do jogo e o identificador original dos salvamentos. O accordion apresenta título, descrição, status e ações em faixa horizontal no desktop, com reorganização no celular e detalhes expansíveis opcionais.

O registro inclui as dependências locais ainda não commitadas: catálogo, identificação de jornada e tentativa, arquivamento/migração local, bancos compartilhados, regras v4, cartas e recursos do piloto já aprovados. Isso evita um commit parcial que não consiga reproduzir a interface e seus recursos existentes.

A Jornada 2 mantém apenas os títulos e temas de planejamento fornecidos anteriormente, com status de revisão editorial e lista de missões jogáveis vazia. Não foi implementado roteiro, diálogo, alternativa, consequência ou personagem novo. Seu conteúdo depende de autorização posterior após validação do roteiro integral.

## Materiais que não integram o commit

- `artifacts/`: capturas, backups, snapshots, compilações de teste, relatórios de execução e pacotes de publicação.
- `Imagens/`: referências e cópias de trabalho; a ilustração aprovada utilizada pelo jogo é versionada em `public/personagens/cidade-dos-encontros-nova.png`.
- Compilações `dist/`, `dist-institucional/`, dependências, logs, cobertura e arquivos de ambiente privados.

Esses materiais permanecem no disco; não foram apagados. A fonte local Nunito e sua licença integram o código porque são necessárias à distribuição estática independente de fontes externas.

## Salvamentos e publicação

Os identificadores e as versões das regras anteriores foram preservados. A migração conserva a cópia original antes de interpretar os dados; respostas antigas não recebem nova avaliação ou bônus retroativo. Tentativas arquivadas continuam separadas e retomáveis. Nenhum salvamento real do jogador foi acessado para os testes, que usam dados de teste e um perfil de navegador isolado.

O armazenamento continua local ao navegador, sujeito a limpeza/cota e sem resolução de edição concorrente entre abas. Este registro não adiciona armazenamento remoto nem dependências.

ZIP estável preservado, SHA-256: `d9b69ca73613023301d29b3fe7f48e720f3638446eca7698232a296596b9af35`.

A pasta `artifacts/institutional/publicacao-concurso-2026/site` permanece intacta: 23 arquivos, 8.328.007 bytes, conferidos por tamanho e SHA-256 em relação ao ZIP estável. Nenhum pacote de publicação foi regenerado.

## Verificações

- Suíte existente: **50 testes aprovados**.
- TypeScript: aprovado (`tsc --noEmit`).
- Build institucional: aprovado em `artifacts/development/approved-home-20261031/build`.
- Navegador: **aprovado**, com dois percursos completos de quatro missões, raiz e subpasta, 248 verificações de dimensões, legado, pontuação, reinício, celular e teclado; sem erros de execução, recursos ausentes ou chamadas às APIs antigas. Evidências locais em `artifacts/development/approved-home-20261031/browser`.
- Conferência do stage: nenhum material gerado ou referência bruta incluído. A licença original da fonte foi mantida byte a byte, inclusive sua formatação de terceiros.
- Revisão textual: correção de um acento na mensagem de jornada indisponível e remoção de espaço ao final de uma linha de teste, sem alteração das regras.

## Arquivos incluídos (83)

Lista integral dos arquivos novos ou modificados deste registro:

```text
.gitignore
distribution/institutional-assets.json
docs/acesso-canais-20261029.md
docs/arquitetura-multiplas-jornadas-20261030.md
docs/carta-caminhos-20261029.md
docs/cartas-aprendizagem-v2-20261029.md
docs/cenario-cidade-aprovado-20261030.md
docs/convite-amarelo-canais-20261029.md
docs/convite-global-canais-20261029.md
docs/descoberta-progressiva-guardioes-20261029.md
docs/distribuicao-institucional-20261028.md
docs/guardioes-integridade-20261029.md
docs/hospedagem-institucional.md
docs/nova-dinamica-piloto-20261028.md
docs/perspectivas-responsivas-20261029.md
docs/perspectivas-resumidas-20261029.md
docs/regras-v4-canais-voluntarios-20261029.md
docs/resumo-executivo-distribuicao-institucional.md
docs/selecao-jornadas-20261030.md
docs/versao-aprovada-tela-inicial-20261031.md
index.html
metadata.json
package.json
public/personagens/cidade-dos-encontros-nova.png
scripts/institutional-package.mjs
scripts/static-site-server.mjs
scripts/verify-institutional-browser.mjs
src/App.tsx
src/assets/fonts/Nunito-OFL.txt
src/assets/fonts/Nunito-Variable.ttf
src/components/board/CityImage.tsx
src/components/board/TownMap.tsx
src/components/cards/ChannelActivity.tsx
src/components/cards/InstitutionalCardModal.tsx
src/components/characters/CharacterAvatar.tsx
src/components/characters/PlayerAvatar.tsx
src/components/characters/PowerButton.tsx
src/components/lobby/JourneyHome.tsx
src/components/lobby/LobbyView.tsx
src/components/lobby/WelcomeScreen.tsx
src/components/mission/GuardianEncounter.tsx
src/components/mission/MissionConsequence.tsx
src/components/mission/MissionIndividualChoice.tsx
src/components/mission/MissionPerspectives.tsx
src/components/mission/MissionSituation.tsx
src/components/mission/ParticipantReveal.tsx
src/components/mission/TrueFalseChallenge.tsx
src/components/summary/GameSummary.tsx
src/components/summary/JourneyResources.tsx
src/components/summary/JourneyShareCard.tsx
src/components/summary/PilotSummary.tsx
src/components/ui/JourneyAudio.tsx
src/components/ui/Navbar.tsx
src/components/ui/RulesModal.tsx
src/data/channelActivity.ts
src/data/cityArtwork.ts
src/data/fortuneScenarios.ts
src/data/institutionalChannels.ts
src/data/journeys.ts
src/data/missions.ts
src/data/pathScenarios.ts
src/data/pilot.ts
src/data/trueFalseQuestions.ts
src/distribution.ts
src/game/engine.ts
src/hooks/useDialogAccessibility.ts
src/services/browserStorage.ts
src/services/cardKnowledge.ts
src/services/channelActivity.ts
src/services/guardianQuestions.ts
src/services/journeySelection.ts
src/services/journeyStorage.ts
src/services/learningScore.ts
src/services/socket.ts
src/types/game.ts
tests/cardKnowledge.test.ts
tests/channelActivity.test.ts
tests/institutional.test.ts
tests/journeySelection.test.ts
tests/journeys.test.ts
tests/pilot.test.ts
tests/socketRestart.test.ts
vite.institutional.config.ts
```

Sem push, merge ou deploy. A implementação da Jornada 2 permanece suspensa até o roteiro integral ser recebido, validado e autorizado.
