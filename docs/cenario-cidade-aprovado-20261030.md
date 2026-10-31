# Cenário aprovado da Cidade dos Encontros — 30/10/2026

Branch: `desenvolvimento/selecao-jornadas-20261030`.

## Arquivo e configuração

O arquivo não estava literalmente na raiz com o nome informado. Foi localizado e conferido visualmente em `Imagens/cidade-dos-encontros-nova.png.png`. É a nova ilustração com pessoas caminhando, conversando e utilizando os espaços públicos.

Foi feita uma cópia sem conversão, redimensionamento ou alteração de pixels para:

`public/personagens/cidade-dos-encontros-nova.png`

Tamanho: **3.219.341 bytes**. SHA-256, idêntico na origem e no destino:

`e9cb9f82e077f5349fb81f71442769f5c277b779fe096aa06e0dcb4301203305`

Em `src/data/cityArtwork.ts`, a alternativa foi configurada e marcada como aprovada. O mecanismo existente é compartilhado pela abertura e pelo mapa; a nova imagem passa a ser utilizada nesses componentes. A imagem original permanece disponível como reserva, sem alterações:

`public/personagens/cidade-dos-encontros.webp`

SHA-256 original preservado:

`0a2c10847e10a3d4f3b52bf46be7417469abc0dd3b50f5702388495fdbfe2807`

`CityImage` mantém o tratamento de falha que retorna ao original. Seu texto alternativo foi ajustado para descrever a presença de pessoas; quando a reserva é utilizada, volta à descrição do cenário original. No mapa, a imagem continua decorativa, sem duplicar os nomes acessíveis dos controles.

A lista `distribution/institutional-assets.json` inclui ambos os arquivos, garantindo que uma compilação futura contenha o cenário novo e sua reserva. O arquivo PNG aprovado tem aproximadamente 3,22 MB; foi mantido integralmente, sem otimização com perda.

## Preservação e enquadramento

Nenhum componente do accordion, narrativa, personagem, banco de perguntas, cálculo de pontuação, motor ou salvamento foi alterado nesta etapa.

O enquadramento existente da abertura usa `object-contain`: a imagem inteira é preservada nas larguras avaliadas, sem novo recorte ou deformação. Os controles permanecem nos painéis próprios, separados da ilustração. Não foi necessário alterar o CSS de enquadramento.

Antes das edições, os arquivos envolvidos e a imagem original foram copiados para `artifacts/development/city-artwork-20261030/baseline`, com manifesto de tamanho e SHA-256. Os trabalhos locais preexistentes foram mantidos.

## Arquivos envolvidos

- Novo recurso: `public/personagens/cidade-dos-encontros-nova.png`.
- Configuração: `src/data/cityArtwork.ts`.
- Texto alternativo: `src/components/board/CityImage.tsx`.
- Lista de recursos estáticos: `distribution/institutional-assets.json`.
- Adequação das expectativas existentes: `tests/journeySelection.test.ts`.
- Verificação da imagem ativa, enquadramento e reserva: `scripts/verify-institutional-browser.mjs`.
- Este relatório.

## Testes

- **50 testes existentes aprovados**, incluindo Jornada 1, migração/retomada, isolamento de tentativas, pontuação única, cartas, Guardiões, Canais e acessibilidade.
- **TypeScript aprovado** (`tsc --noEmit`).
- **Build institucional aprovado**, exclusivamente em `artifacts/development/city-artwork-20261030/build`.
- Verificação final do navegador **aprovada**: dois percursos completos, 248 verificações de dimensões, 16 verificações específicas de enquadramento e dois testes de reserva/recarga, sem erros de execução, falhas de recursos ou chamadas às APIs antigas. Evidências em `artifacts/development/city-artwork-20261030/browser`.

Foram acrescentadas verificações de enquadramento em 320, 390, 768 e 1440 pixels, imagem com texto alternativo, ausência de sobreposição dos botões à ilustração na abertura e retorno ao original quando o evento de falha é simulado no componente real. Uma recarga deve voltar a utilizar a arte aprovada. As capturas de computador e celular foram conferidas visualmente.

O percurso completo existente verifica também accordion exclusivo, foco/teclado, ampliação e contraste, áudio, missões, medalha, avaliação, retomada de partidas anteriores e início com outro avatar. A navegação móvel é emulada no navegador; os controles de síntese de voz usam simulação determinística, sem certificação de pronúncia audível.

## Publicação

Não foram gerados ZIPs de publicação nem atualizada a pasta `artifacts/institutional/publicacao-concurso-2026/site`. O pacote estável permanece com SHA-256:

`d9b69ca73613023301d29b3fe7f48e720f3638446eca7698232a296596b9af35`

Sem commit, push, merge ou deploy. A publicação depende de validação posterior.

Conferência final somente de leitura: os 23 arquivos da pasta de publicação, totalizando 8.328.007 bytes, continuam correspondendo ao ZIP estável por tamanho e SHA-256.
