# Distribuição institucional estática — relatório técnico

Data de referência: 28/10/2026. Branch: `ajustes-tela-inicial-20261021`. HEAD preservado: `48beb5c0a5bd4fae8dff25f486b03846e96ad217`.

## Escopo e preservação

Preparada uma modalidade de build do mesmo projeto. Não foi criada uma segunda aplicação: a entrada HTML, `main.tsx`, `App`, o motor, os componentes educativos e os conteúdos continuam compartilhados.

Havia 26 arquivos com alterações locais anteriores. Foi feita uma cópia de segurança fora do repositório antes das edições. Dezessete desses arquivos permaneceram byte a byte idênticos ao início desta etapa, incluindo motor, tipos, cálculo de pontos, dados do piloto, encontros dos Guardiões, resumo, armazenamento e testes do piloto. Nove receberam extensões pequenas para seleção de perfil ou resolução de endereços. Não houve descarte de alterações anteriores.

Imagens originais, personagens, missões, perguntas, cenários das cartas e relatórios técnicos anteriores foram preservados. O verificador compara SHA-256 das 17 imagens publicadas com os arquivos de origem. Não foram gerados, recortados ou substituídos retratos.

Sem commit, push, merge, instalação de dependências ou deploy. O download da fonte existente Nunito e de sua licença foi feito do repositório oficial Google Fonts, com autorização. A distribuição não exige Vercel, banco central, autenticação ou servidor de aplicação.

## Implementação

- `vite.institutional.config.ts` reaproveita a configuração Vite existente, usa caminhos relativos e saída `dist-institucional/`, separada de `dist/`.
- Uma constante resolvida no build seleciona o perfil institucional no mesmo `App`. Não há fluxo educativo copiado para outra aplicação.
- Módulos exclusivamente administrativos e telas coletivas/legadas são substituídos por exports vazios somente na compilação institucional. As rotas correspondentes ficam desativadas pelo mesmo perfil. O build rejeita dependências administrativas, módulos de servidor e marcadores das APIs antigas no JavaScript gerado.
- O serviço compartilhado continua executando o motor local. No build institucional não permite selecionar transporte online; os trechos de HTTP e atualização periódica são eliminados da saída. Os identificadores de sessão são apenas locais, para retomada.
- O motor comum ainda contém estruturas internas do protocolo e da compatibilidade histórica. Elas não representam APIs publicadas nem possibilitam multiplayer em rede nesta distribuição.
- A resolução dos endereços das imagens e do convite foi centralizada. Os arquivos originais não mudaram de nome ou de caminho no projeto. O mesmo pacote funciona na raiz e em subpasta com barra final.
- Nunito é carregada do próprio pacote, com o mesmo nome de família e os pesos usados pelo piloto. O CSS original permanece com sua configuração na edição normal; a substituição por fonte local ocorre somente no perfil institucional.
- O perfil não carrega arquivos `.env` e não expõe variáveis `VITE_*`. A base pública utiliza uma constante explícita, evitando serializar o objeto de variáveis de ambiente no frontend.
- O HTML institucional identifica o idioma como `pt-BR`, e o cabeçalho descreve execução individual, sem sugerir conexão a servidor de jogo.

## Conteúdo e oportunidades educativas

Foram mantidos quatro avatares, quatro Guardiões, quatro missões, encontros educativos, participantes virtuais, alternativas humanas, consequências, canais, cartas, preferências de acessibilidade, narração, avaliação e medalha. A identificação final com um Guardião continua subjetiva.

Nenhuma regra ou valor de pontuação foi alterado nesta etapa: o piloto mantém até 120 pontos de aprendizagem e os pontos das cartas separados. O relatório anterior da nova dinâmica continua sendo a referência para essa composição e para as pendências editoriais do banco.

Salvamentos da dinâmica atual são retomados. Salvamentos anteriores à nova dinâmica não são convertidos ou apagados automaticamente: a edição institucional informa que devem ser retomados na edição original ou substituídos mediante confirmação. A troca de domínio/protocolo/porta não transfere automaticamente dados do navegador.

## Artefatos

- `dist-institucional/`: somente o website estático.
- `artifacts/institutional/Entre-Nos-Institucional.zip`: distribuição contendo `site/`, inventário e instruções.
- `artifacts/institutional/inventario.json`: tamanho e SHA-256 de cada arquivo publicado.
- `artifacts/institutional/Entre-Nos-Institucional.zip.sha256`: integridade do arquivo ZIP.
- `artifacts/institutional/verification/`: evidências locais de navegador, dimensões, avaliação e extração do ZIP; não integra a publicação.

O website contém HTML, JavaScript, CSS, a fonte Nunito, 17 imagens originais e avisos de licença. O empacotador utiliza lista permitida e rejeita arquivos inesperados, links simbólicos, imagens modificadas, referências às APIs antigas e à fonte remota. Não copia o repositório, `api/`, `.env`, `server.ts`, `.git`, `node_modules` ou configurações da Vercel.

O ZIP utiliza formato ZIP32 com CRC32 e não requer programa de compactação ou biblioteca adicional para ser gerado. A extração é conferida também com uma implementação independente do empacotador. Inventário e hash verificam integridade; não equivalem a assinatura digital ou certificação de segurança.

## Testes realizados

Resultado final: todas as verificações descritas abaixo passaram. O pacote possui 23 arquivos do website (8.417.655 bytes) e 25 entradas no ZIP, incluindo inventário e instruções. O ZIP tem 8.431.570 bytes e SHA-256 `8335cd7f67d5c8d331267ba48aee36a4095870cfe98d9bf759fab1f4e76aab1d`.

Um build adicional com marcadores fictícios em variáveis de cliente, servidor e administração confirmou que nenhum desses valores apareceu na saída. Os arquivos resultantes coincidiram com o inventário empacotado; evidência em `verification/environment-check.json`.

A tentativa nativa de narração produziu evento de início; o navegador disponibilizou 323 vozes. Pausa, retomada, parada e velocidade foram verificadas com instrumentação controlada. As duas jornadas também geraram PDFs reais da avaliação, preservados em `verification/raiz-avaliacao.pdf` e `verification/subpasta-avaliacao.pdf`. Isso não substitui escuta humana ou homologação de impressão em equipamentos institucionais.

### Automatizados e compilação

- `npm.cmd test`: 23 testes, incluindo os 20 anteriores e três novos testes para endereços portáveis, rejeição de APIs/fontes remotas/arquivos indevidos e estrutura/integridade do ZIP.
- `npm.cmd run lint`: verificação TypeScript.
- `npm.cmd run build`: regressão da compilação normal.
- `npm.cmd run build:institutional`, `verify:institutional` e `package:institutional`: compilação, inspeção e empacotamento próprios.
- Permanece o aviso de JavaScript acima de 500 kB. A saída institucional fica em aproximadamente 542 kB de JavaScript antes de gzip, contra aproximadamente 633 kB da edição normal; o tamanho exato acompanha cada build.

### Servidor estático e navegador

A validação reproduzível está em `scripts/verify-institutional-browser.mjs`. Usa apenas um servidor de arquivos de teste, ligado a `127.0.0.1`, com cache desabilitado e sem qualquer handler do jogo. Nenhum servidor de aplicação ou banco foi usado para essas partidas.

- Duas jornadas completas: uma em `/`, outra em `/entre-nos/`, com respostas corretas e incorretas. Resultados esperados: 120/120 e 40/120, respectivamente.
- Quatro missões por jornada, quatro Guardiões sem repetição, três outros avatares e decisão humana preservada.
- Três cartas do destino exercitadas. O gerador aleatório das cartas foi controlado temporariamente apenas no navegador de teste para cobrir Sorte, Revés e Segunda Chance; o código de produção não mudou.
- Consulta aos canais sem obrigação de responder, crédito da Comissão, pergunta, feedback, pontuação e retorno à decisão.
- Recarga e retomada durante o encontro educativo e no encerramento, preservando resposta, preferências e identificação final.
- Reinício na mesma sala com nova identidade e sem créditos herdados.
- Quatro avatares inspecionados na abertura. Os testes do motor cobrem jornadas completas com cada avatar; os dois percursos HTTP completos usam Exploradora e Observador.
- Todas as imagens e demais arquivos conferidos por HTTP na raiz e na subpasta, além da comparação de integridade local.
- Setenta e duas verificações de dimensões, nas larguras 320, 390, 768 e 1440 px: abertura, situação, Guardião, canais, decisão, participantes, consequência, resumo e composição. Incluídos texto Extra, alto contraste e redução de movimento. Sem rolagem horizontal na execução aprovada.
- Tab, Shift+Tab, Escape e Enter; foco contido nos modais e encaminhado ao feedback.
- Composição final, geração de PNG, convite com o endereço correto da subpasta e avaliação com comentário escapado para impedir execução como HTML.
- Recursos de narração exercitados com instrumentação: ouvir, pausar, retomar, parar e alterar 1× para 1,5×. A verificação registra também disponibilidade de vozes e tentativa nativa, sem certificar pronúncia ou qualidade sonora por escuta humana.
- Requisições às APIs antigas foram bloqueadas e contadas: nenhuma tentativa durante as jornadas aprovadas. Sondagens separadas confirmaram ausência de handlers de API, `.env` e `server.ts` no servidor estático.
- Conexões HTTP externas foram bloqueadas durante o teste da aplicação. Nenhuma tentativa na execução aprovada com extensões desabilitadas. Isso não certifica o tráfego do sistema operacional ou de serviços de voz fora da captura do navegador.

Resultados detalhados, tentativas de áudio e contagens efetivas ficam em `artifacts/institutional/verification/resultados.json`. A extração, hashes e quantidade de entradas do ZIP ficam em `zip-check.json`.

### Ocorrência de ambiente identificada

Uma primeira execução completou as duas jornadas, mas a captura detectou tentativas de obter `merlin_config.json` em um CDN externo. Esse endereço não foi encontrado no código ou no artefato. A execução foi repetida com extensões desabilitadas em perfil temporário; as requisições desapareceram e a verificação passou. A evidência indica interferência do ambiente do navegador, não uma dependência encontrada no aplicativo. A homologação institucional precisa considerar também extensões e políticas do navegador.

## Conexões externas remanescentes

1. **Acesso ao servidor institucional:** necessário para carregar os arquivos. Logs podem existir na infraestrutura, conforme configuração da TI.
2. **Síntese de voz:** `speechSynthesis` pertence ao navegador/sistema; pode utilizar vozes remotas. A edição não substitui a voz por uma função decorativa nem promete áudio offline.
3. **Compartilhamento e e-mail voluntários:** dependem de ação do usuário, permissões e aplicativos disponíveis. Nenhum e-mail ou mensagem foi enviado durante os testes. O compartilhamento do convite foi interceptado no perfil de teste para conferir o endereço, sem envio externo.

Não foram encontradas chamadas do percurso individual às APIs antigas. A fonte Google Fonts foi eliminada da edição institucional. Não foi implementado Service Worker, instalação PWA ou pacote totalmente offline, conforme o escopo autorizado.

## Infraestrutura e questões para a TI

Requisitos e publicação estão em `docs/hospedagem-institucional.md`. Publicar somente `site/`, com tipos MIME adequados, documento padrão e barra final na subpasta. Node.js e dependências são ferramentas da preparação, não requisitos do servidor ou dos participantes.

A TI ainda deve homologar HTTPS, cabeçalhos/CSP, eventual incorporação ao portal, permissões de impressão/download/compartilhamento, vozes portuguesas, desempenho em equipamentos reais, logs, retenção, isolamento de origem, atualização e rollback. Também deve confirmar que não existem handlers antigos previamente instalados no endereço de destino.

Os testes de celular utilizam emulação de viewport; não substituem homologação em dispositivos físicos. A narração requer escuta manual. O pacote não produz comprovação inviolável de capacitação, pois pontuação e progresso residem no navegador. Autorizações institucionais de publicação e pendências pedagógicas/normativas anteriores não são resolvidas pelo empacotamento técnico.

## Arquivos desta etapa

Novos: `src/distribution.ts`, `vite.institutional.config.ts`, `distribution/institutional-assets.json`, `src/assets/fonts/Nunito-Variable.ttf`, `src/assets/fonts/Nunito-OFL.txt`, `scripts/institutional-package.mjs`, `scripts/static-site-server.mjs`, `scripts/verify-institutional-browser.mjs`, `tests/institutional.test.ts`, este relatório, instruções de hospedagem e resumo executivo.

Compartilhados estendidos: `src/App.tsx`, `src/services/socket.ts`, `src/components/ui/Navbar.tsx`, `src/components/lobby/LobbyView.tsx`, `src/components/lobby/WelcomeScreen.tsx`, `src/components/characters/CharacterAvatar.tsx`, `src/components/characters/PlayerAvatar.tsx`, `src/components/board/TownMap.tsx`, `src/components/mission/MissionSituation.tsx`, `src/components/mission/MissionIndividualChoice.tsx`, `src/components/mission/MissionConsequence.tsx`, `src/components/summary/JourneyShareCard.tsx`, `package.json` e `.gitignore`.

Não alterados nesta etapa: motor, tipos, conteúdos, regras de pontuação, narração, preferências de acessibilidade, APIs antigas, `server.ts`, `vite.config.ts`, `vercel.json`, lockfiles e relatórios anteriores.
