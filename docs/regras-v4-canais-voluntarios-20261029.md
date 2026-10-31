# Regras de aprendizagem v4 e atividade voluntária dos Canais

Data: 29/10/2026. Implementação local, sem commit, push, merge ou deploy.

## Resultado

Novas jornadas do piloto recebem `learningRulesVersion: 4` ao iniciar ou reiniciar. Retomar uma jornada preserva seu marcador original; a leitura de snapshots não introduz a versão 4 retroativamente.

Na versão 4, iniciar um desafio dos Guardiões vale zero. O motor continua registrando a pergunta aberta em `guardianEncounters`, como progresso. A resposta adequada vale +15; a inadequada vale zero. A resposta permanece única por encontro. Nas jornadas de versão 3, os +5 de abertura e os cálculos anteriores continuam preservados, inclusive após recarga e nas etapas seguintes da mesma jornada.

O cálculo de versão 4 distingue Guardiões, cartas e atividade voluntária dos Canais. A nova atividade não usa registros de consulta, respostas antigas da prática ou registros das cartas. Abertura e consulta aos Canais não pontuam.

## Atividade voluntária

Foi criado um banco próprio de cinco perguntas (`cv-1` a `cv-5`, versão editorial 1), com três alternativas, uma mais adequada, gabaritos variados e feedback para qualquer resposta. São situações sobre educação ética, proteção de dados em manifestações, análise correcional sem presumir culpa, mudanças relevantes em atividade privada sujeita ao procedimento de prevenção de conflito de interesses e encaminhamento de situações com dimensões distintas.

Os IDs e enunciados são diferentes dos bancos dos Guardiões e de Caminhos; as perguntas originais desses bancos não foram alteradas. As situações novas exercitam temas relacionados por contextos próprios, não uma cópia dos enunciados anteriores.

Referências institucionais consultadas:

- [INPI — Consultar e Comunicar](https://www.gov.br/inpi/pt-br/governanca/gestao-da-integridade/etica/consultar-e-comunicar): orientação preventiva, conflito de interesses, SeCI e fluxos oficiais.
- [INPI — Atividade Correcional](https://www.gov.br/inpi/pt-br/governanca/gestao-da-integridade/atividade-correicional): análise, apuração e garantias dos procedimentos.
- [INPI — Ouvidoria](https://www.gov.br/inpi/pt-br/governanca/ouvidoria): referência ao canal institucional. Não são prometidos anonimato ou sigilo absolutos; valem os procedimentos oficiais aplicáveis.

O banco é pedagógico e local. O jogo não faz consultas a serviços institucionais nem encaminha manifestações. A pergunta sobre mudança de condições orienta verificar a necessidade de nova análise pelo procedimento competente, sem presumir autorização ou impedimento.

A atividade funciona no painel atual dos Canais, disponível no mapa, nas missões e no resumo, após iniciar uma jornada de versão 4. Não depende de missão ativa, não envia ações ao motor nem altera a decisão do jogador. Antes da jornada, o painel permanece informativo; não há resposta pontuada nem aproveitamento retroativo.

Cinco botões numerados permitem responder progressivamente e consultar respostas anteriores. A interface mostra quantidade respondida, pontos, feedback e possibilidade de sair e voltar. Uma tentativa confirmada por pergunta: +4 por acerto ou zero por erro. O resultado é calculado a partir dos registros; não há soma de crédito a cada clique.

Chaves: `entre-nos-channel-activity-v1-{journeyId}-{questionId}`. Cada resposta armazena versão, jornada, ID e alternativa. Há validação de versão, identidade e limites da alternativa. Confirmações repetidas retornam a resposta existente. Respostas inválidas, registros de outra jornada e chaves legadas não geram crédito.

## Pontos e compatibilidade

Com quatro perguntas de Guardiões apresentadas, quatro perguntas atuais de cartas e a atividade voluntária disponível, o máximo é 100: Guardiões 60, cartas 20 e Canais 20. O máximo das cartas continua baseado somente nas perguntas atuais efetivamente apresentadas; um registro histórico sem bônus não acrescenta oportunidade nova.

As cinco perguntas voluntárias estão disponíveis durante toda a jornada de versão 4, por isso oferecem até 20 pontos mesmo quando ainda não respondidas. A atividade é identificada separadamente no resumo, sem exigir sua conclusão para medalha, identificação final ou avaliação.

Jornadas de versão 3 mantêm abertura +5, conhecimento +15 e regras atuais das cartas. Jornadas ainda anteriores mantêm o tratamento legado, incluindo Sorte e créditos históricos. O sorteio das versões 3 e 4 continua usando Caminhos, Segunda Chance e Revés; seus efeitos próprios e bônus de conhecimento não foram alterados. A nova atividade não soma pontos em jornadas antigas, mesmo que existam registros incompatíveis no armazenamento.

Regras, resumo, mensagem dos Guardiões e rótulos dos Canais foram ajustados. Uma mensagem antiga “até +5 pontos” no botão da tela de decisão foi removida; agora informa a atividade voluntária ou a consulta/prática conforme a versão.

## Apresentação dos Guardiões

O cadastro atual e o arquivo original em `HEAD:src/data/characters.ts` identificam Wa como “Guardiã da Convivência”. Esse tratamento foi mantido: não houve evidência documental de erro nem inferência pela imagem.

Foi retirada a linha do título da missão na tela dos Guardiões, eliminando “Uma voz ainda não ouvida” dessa apresentação sem editar a narrativa original. Mantidos “Desafio dos Guardiões da Integridade”, o convite exato, “Iniciar desafio”, identidades, retratos e introduções individuais. A mensagem de pontuação diferencia as regras 4 e anteriores.

## Validação e ressalvas

- 33 testes de regressão aprovados, incluindo quatro novos testes do banco e serviço dos Canais. Cobrem alternativas, independência de bancos, pontuação única, erros sem nova tentativa pontuada, dados inválidos, bloqueio antes da jornada/na versão 3, isolamento e cálculo 100/100.
- Teste do motor verifica retomada de versão 3 com +5 preservados e resposta inadequada não reavaliada após restauração. Testes existentes de cartas, armazenamento, motor e distribuição continuam aprovados.
- TypeScript, sintaxe do script de navegador e builds normal/institucional aprovados. O build normal mantém o aviso de JavaScript acima de 500 kB; o institucional tem aproximadamente 454 kB. A suíte em Node emitiu aviso de ausência de arquivo de `localStorage`, usando o fallback em memória; a persistência real é exercitada no navegador.
- As jornadas completas no navegador verificam cinco respostas corretas e cinco inadequadas dos Canais, em várias visitas entre mapa, missão e resumo; acesso informativo e troca de canal sem pontuação; confirmação por teclado, foco no feedback, Escape e retorno ao botão de origem; bloqueio de nova resposta e retomada após recarga.
- O navegador também verifica medalha antes de responder à quinta pergunta voluntária, continuação da atividade no resumo, preservação do estado e das decisões, regras 3 e legadas, Caminhos, demais cartas, perspectivas somente resumidas nas seis missões do catálogo, descoberta progressiva, avaliação/PDF e composição/PNG.
- Um teste inicial identificou uma disputa de foco na abertura do novo componente. Corrigida, deixando o gerenciador do diálogo capturar o controle de origem antes dos movimentos de foco da atividade. Uma execução posterior sofreu interrupção de comunicação com o navegador durante a composição final; o resultado da execução final consolidada é registrado em `verification/resultados.json`.

Evidências em `artifacts/institutional/verification/`: resultados, capturas das perguntas e feedback dos Canais, Guardiões, perspectivas e PDFs. Foram exercitados 320, 390, 768 e 1440 px, fonte Extra, alto contraste e redução de movimento. Capturas de celular e computador foram inspecionadas visualmente.

Resultado final consolidado: duas jornadas completas de versão 4 aprovadas e 220 verificações de layout sem rolagem horizontal. A primeira obteve 100/100: Guardiões 60, cartas 20 e Canais 20. A segunda obteve 0/95, com erros nas perguntas atuais e uma resposta histórica de carta preservada sem reavaliação: cartas oferecem 15, Guardiões 60 e Canais 20. A retomada de versão 3 manteve 100/100, incluindo 20 de abertura, ignorando os registros novos dos Canais. Nenhuma tentativa de API antiga, conexão HTTP externa, erro de execução ou recurso quebrado na execução aprovada.

O teste de navegador de versão 3 usa um snapshot completo salvo pelo teste, com o marcador ajustado para representar as regras anteriores; não é uma migração cruzada executando todos os builds históricos. A compatibilidade também é exercitada pelo teste do motor e pela preservação dos formatos e dos caminhos de cálculo antigos.

Celulares foram emulados. Teclado e árvore de acessibilidade do navegador não equivalem a certificação com leitor de tela. A instrumentação verifica o texto e os controles da narração, sem certificar pronúncia. Vozes do navegador/sistema podem usar serviços remotos. Registros locais evitam duplicação acidental, mas não são invioláveis contra manipulação por quem controla o navegador. Preferências e progresso dependem da origem e do armazenamento local; se indisponível, há fallback apenas para a página aberta.

## Entrega e retorno

Versão anterior preservada em `artifacts/institutional/rollback-antes-regras-v4-20261029/`, incluindo ZIP, hash, inventário e evidências. SHA-256 do ZIP anterior: `0e37ec3c5106d1376d57f7474a7a84306a4c09c01380d388b4926062e1e200c9`.

O pacote atual é `artifacts/institutional/Entre-Nos-Institucional.zip`, com inventário em `artifacts/institutional/inventario.json`. A pasta manual é `artifacts/institutional/publicacao-concurso-2026/site`. A conferência final entre ZIP, extração independente e pasta manual é documentada em `artifacts/institutional/verification/zip-check.json`.

Entrega final: ZIP de 8.341.046 bytes, SHA-256 `591857b63bfac5763922f6ef71d63295a5e809bb4696c1dc17751002ab03160d`. A pasta manual foi atualizada: 23 arquivos, 8.327.131 bytes, todos conferidos contra as entradas do ZIP e o inventário por quantidade, tamanho e SHA-256. `index.html` diretamente na raiz. Extração independente por `Expand-Archive` em `artifacts/institutional/conferencia-regras-v4-20261029/`. Imagens originais comparadas ao inventário anterior e idênticas.

Nenhuma narrativa, perspectiva resumida, imagem original, banco de perguntas dos Guardiões ou de Caminhos, medalha ou avaliação foi editada. Alterações locais anteriores foram preservadas. Não houve commit, push, merge, deploy ou ação no projeto Vercel.
