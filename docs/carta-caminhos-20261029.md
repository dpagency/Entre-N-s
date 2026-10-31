# Carta dos Caminhos — implementação e validação

Data: 29/10/2026. Trabalho local, sem commit, push, merge ou deploy.

## Resultado

Novas jornadas do piloto usam `learningRulesVersion: 3`, independente do `pilotVersion: 2` que identifica a dinâmica das missões. O marcador é gravado ao iniciar/reiniciar a jornada, enviado no estado sanitizado e preservado no snapshot. Restaurar uma jornada não introduz esse marcador retroativamente.

O sorteio conserva três cartas fechadas, escolha e revelação no desfecho da missão. Novas jornadas sorteiam Caminhos, Segunda Chance ou Revés. Caminhos não concede pontos pelo sorteio. Segunda Chance mantém +1 e Revés mantém −3, separados da aprendizagem. Responder adequadamente a qualquer pergunta atual de carta concede +5; outra resposta concede zero, com feedback, sem alterar a decisão original.

## Conteúdo institucional

`src/data/pathScenarios.ts` reúne cinco perguntas de três alternativas, com gabaritos em posições variadas, feedback por alternativa, explicação e referência pedagógica:

1. Orientação ética preventiva, distinguindo-a de denúncia e apuração.
2. Possível conflito de interesses em atividade privada e consulta pelo SeCI, no caso expressamente sujeito a esse procedimento.
3. Reclamações e sugestões sobre atendimento, recebidas pela Ouvidoria.
4. Diferença entre recebimento de denúncia e análise/apuração correcional.
5. Registro no Fala.BR de denúncia de possível desconformidade ética no INPI.

Foram reaproveitados os temas de orientação preventiva e conflito de interesses do banco existente. As cinco questões originais de verdadeiro ou falso permanecem na prática opcional dos Canais, com seus IDs e respostas anteriores preservados.

Fontes oficiais consultadas:

- [INPI — Consultar e Comunicar](https://www.gov.br/inpi/pt-br/governanca/gestao-da-integridade/etica/consultar-e-comunicar): orientação ética preventiva, consulta de conflito de interesses pelo SeCI e recebimento de denúncias pelo Fala.BR. A pergunta de conflito explicita a sujeição ao procedimento para evitar generalizar sua aplicação.
- [INPI — Ouvidoria](https://www.gov.br/inpi/pt-br/governanca/ouvidoria): recebimento e tratamento de manifestações.
- [INPI — Atividade Correcional](https://www.gov.br/inpi/pt-br/governanca/gestao-da-integridade/atividade-correicional): funções correcionais e distinção entre recebimento e apuração.

O catálogo de canais foi revisado: Comissão de Ética do órgão não é apresentada como a Comissão de Ética Pública central; consulta informal não substitui o procedimento competente; Ouvidoria não é unidade de investigação; acolhimento não substitui denúncia. Removidas promessas de sigilo absoluto e qualificadas as atribuições de Gestão de Pessoas e do acolhimento conforme a estrutura e as normas do órgão. Referências são texto local; o jogo não consulta essas páginas para funcionar.

## Registros, rodízio e pontuação

- Caminhos reutiliza `rotatingItem`, com pergunta estável por jornada/missão, histórico por tipo e por missão, evitando repetição imediata quando possível.
- O registro `entre-nos-card-knowledge-v2-*` já contém versão editorial, tipo, ID da pergunta e resposta. Foi estendido com o tipo `caminhos`, sem renomear chaves existentes nem reescrever registros antigos.
- O bônus é calculado a partir da resposta confirmada, não somado por evento. Reconfirmar, reabrir ou recarregar não duplica o crédito. Respostas confirmadas bloqueiam as alternativas.
- O botão Canais permanece na localização atual, independente do sorteio. Foram removidas as gravações de créditos por consulta à Comissão e por acerto na prática. A prática continua opcional, com feedback e sem pontos.
- Nas novas jornadas, encontro apresentado com Guardião vale +5 e acerto no desafio vale +15. Créditos de Canais não entram no cálculo, mesmo se houver dados indevidos sob a chave da jornada.
- O máximo da jornada considera os encontros apresentados; o máximo das cartas soma +5 apenas por pergunta atual efetivamente apresentada, inclusive respondida inadequadamente. Não há meta fixa de cartas presumidas.
- Com quatro encontros e quatro perguntas atuais de cartas, há 100 pontos possíveis: 20 de encontros, 60 de desafios dos Guardiões e 20 de cartas. Esse valor não é imposto a jornadas que não receberam todas essas oportunidades.

## Compatibilidade

Jornadas sem o novo marcador conservam Sorte e o +3 original, incluindo nos sorteios seguintes da mesma jornada. Uma Sorte já revelada não se converte em Caminhos nem cria pergunta ou bônus. Reiniciar cria uma nova jornada com as novas regras.

Créditos antigos de consulta e dos desafios dos Canais continuam no total da jornada antiga. O acesso e a prática nesta edição não criam novos créditos, inclusive em jornadas antigas. Para não mostrar oportunidades que deixaram de existir, o denominador legado dos Canais considera os créditos históricos já registrados, mantendo seu valor. Não se promete novo crédito de consulta numa partida retomada.

Respostas antigas permanecem intactas. O suporte anterior a perguntas de cartas da primeira versão continua somente para consulta, sem reavaliação nem bônus retroativo. Não houve migração de decisões das missões, imagens, identidades, falas, avatares, descoberta progressiva, medalha ou avaliação.

## Validação executada

- TypeScript: `node node_modules/typescript/bin/tsc --noEmit`, aprovado.
- Suíte: `node --import tsx --test tests/*.test.ts`, 29 testes aprovados. Inclui banco Caminhos, rodízio sem repetição imediata, erro/acerto, rejeição de respostas inválidas, confirmação única, restauração, isolamento entre jornadas e registros antigos. O teste das três saídas do sorteio usa aleatoriedade controlada somente no teste.
- A execução inicial do tsx no ambiente restrito falhou em `uv_os_get_passwd`; a execução autorizada fora da restrição passou. Não foram instaladas dependências.
- Builds normal e institucional aprovados. O build normal apresentou aviso de chunk acima de 500 kB; o JavaScript institucional ficou em aproximadamente 440 kB.
- Navegador: duas jornadas completas, em `/` e `/entre-nos/`, com Caminhos, Revés e Segunda Chance. Acertos: 100/100, incluindo 20/20 nas cartas. Erros e resposta histórica preservada: 20/95, incluindo 0/15 nas cartas atuais. As respostas e a aleatoriedade são controladas apenas pelo teste.
- Foram verificadas três alternativas, confirmação por teclado, foco no feedback, alternativas bloqueadas, tentativa de alteração, recarga e retomada, decisão original intacta e ausência de mudança no registro de aprendizagem após consulta/prática dos Canais.
- Compatibilidade no navegador: snapshot de consequência da jornada de teste, sem o marcador novo e com Sorte registrada, retomado com +3, sem pergunta retroativa e com continuação para o mapa. Não equivale a uma migração cruzada executando cada build histórico. Testes unitários também verificam manutenção dos créditos históricos, estado e regra após restauração.
- 100 verificações de dimensões em 320, 390, 768 e 1440 px, sem rolagem horizontal. Incluídos alto contraste, fonte Extra, redução de movimento, Canais, feedback e Sorte legada. Captura de Caminhos em celular inspecionada visualmente.
- Descoberta progressiva verificada: sem identidades dos Guardiões na abertura ou nas regras, quatro escolhas de avatar, quatro encontros distintos e os quatro Guardiões no encerramento. Medalha, escolha final, avaliação/PDF e composição/PNG preservados.
- Narração e controles de áudio verificados pela instrumentação existente. Nenhuma tentativa de API antiga, conexão HTTP externa, erro de execução ou recurso quebrado nas jornadas de teste.
- `git diff --check` aprovado após correção de espaço em branco.

Evidências: `artifacts/institutional/verification/resultados.json`, `zip-check.json`, capturas e PDFs. Celulares foram emulados; não houve ensaio em dispositivos físicos nem certificação com leitor de tela. Qualidade audível da voz continua sujeita a escuta humana; vozes do navegador/sistema podem utilizar serviço remoto. Dados locais não constituem registros invioláveis.

## Pacote e retorno

Novo pacote: `artifacts/institutional/Entre-Nos-Institucional.zip`, 8.327.715 bytes. Contém 23 arquivos do website, com 8.313.800 bytes, além de inventário e instruções.

SHA-256 do ZIP: `53230bd46632bb8cc6816e1d8440393de6523da1e5db0a45f51d2d008f150546`.

Inventário: `artifacts/institutional/inventario.json`, com tamanho e SHA-256 de cada arquivo. ZIP extraído independentemente por `Expand-Archive` em `artifacts/institutional/conferencia-caminhos-20261029/`; todos os 23 arquivos conferidos por tamanho e SHA-256, sem arquivos extras. Imagens do pacote comparadas com o inventário anterior, sem diferenças.

Pacote anterior, hash, inventário e evidências preservados em `artifacts/institutional/rollback-antes-caminhos-20261029/`. SHA-256 anterior: `0bf3c37ad63dc4a5e4499a771a0d25b3e726a77249b0211c6f429f148eeee884`. Os demais pacotes anteriores também foram mantidos.

`artifacts/institutional/publicacao-concurso-2026/site` permanece na versão anterior. Seus arquivos foram conferidos contra o inventário preservado e não foram atualizados nesta etapa. A nova versão está no ZIP e na pasta de conferência; a atualização da pasta de publicação e qualquer publicação dependem de autorização posterior.

## Arquivos de implementação

- `src/types/game.ts`, `src/game/engine.ts`: versão das regras, estado sanitizado e sorteio.
- `src/data/pathScenarios.ts`, `src/services/cardKnowledge.ts`: banco, rotação e registros de Caminhos.
- `src/data/institutionalChannels.ts`: revisão do catálogo.
- `src/components/mission/MissionConsequence.tsx`: pergunta e feedback de Caminhos no fluxo existente.
- `src/components/cards/InstitutionalCardModal.tsx`: acesso/prática sem pontos.
- `src/services/learningScore.ts`, `src/components/summary/PilotSummary.tsx`: cálculo e discriminação dos pontos e máximos.
- `src/components/ui/RulesModal.tsx`, `src/App.tsx`: regras atuais e aviso contextual para jornada antiga.
- `tests/cardKnowledge.test.ts`, `tests/pilot.test.ts`, `scripts/verify-institutional-browser.mjs`: cobertura funcional e de compatibilidade.

Revisão React: hooks permanecem incondicionais, controles mantêm semântica de botão, seleção por `aria-pressed`, foco no feedback e opções bloqueadas após confirmação. Nenhum serviço externo ou biblioteca nova foi introduzido. Alterações locais anteriores foram preservadas.
