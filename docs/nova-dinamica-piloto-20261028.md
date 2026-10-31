# Nova dinâmica do piloto — 28/10/2026

Branch: `ajustes-tela-inicial-20261021`. Base: `48beb5c0a5bd4fae8dff25f486b03846e96ad217`.

Implementação local, sem commit, push, merge ou deploy. Diretório inicialmente limpo; não havia alterações de terceiros a preservar. Os três relatórios técnicos anteriores permanecem intactos como registros históricos.

## Implementação em blocos

1. Confirmados branch, arquivos da auditoria e estado do repositório. Apresentado o plano antes da primeira edição.
2. Introduzida a versão 2 do piloto, com avatares participantes, encontros educativos e identidade própria da partida. Primeiro bloco validado com 19 testes e TypeScript.
3. Integradas as telas, o encerramento subjetivo, os canais, as cartas e a proteção ao armazenamento. Validação funcional em navegador.
4. Revisados os componentes conforme as skills React Best Practices e Verification; encerramento com 20 testes, TypeScript e build aprovados.

## Avatares e participantes

- Mantidos Exploradora, Observador, Construtora e Estrategista, com os mesmos arquivos e caminhos das imagens.
- Removidas da apresentação dos avatares as descrições que atribuíam traços de personalidade. O modal conserva a explicação de que o avatar não determina decisões.
- O avatar humano e os outros três avatares formam exatamente quatro participantes. Nenhum Guardião integra o grupo de participantes do novo piloto.
- Cada participante virtual sorteia uma alternativa válida, independentemente da escolha humana e sem prioridades éticas. A escolha fica estável depois de registrada.
- Guardiões não são comparados com a escolha humana; não há pontos de sintonia nem talismãs no novo percurso.
- O campo técnico `characterId` permanece no protocolo por compatibilidade; nos participantes virtuais novos, ele não determina imagem, nome, escolha ou pontuação.

## Fluxo

Mapa → situação e papel do jogador → encontro com o Guardião → questão e feedback → decisão livre → revelação dos quatro participantes → consequência original → carta do destino → reflexão complementar quando aplicável → mensagem motivacional → mapa ou encerramento.

- Conservadas as missões 1–4 e todas as suas alternativas, narrativas e consequências. Não foram criadas missões ou jornadas narrativas adicionais.
- Os quatro Guardiões são embaralhados no início e distribuídos conforme a ordem de realização das missões, sem repetição dentro da partida.
- Nome, retrato, característica e introdução breve aparecem antes da questão. Os retratos do encontro são exibidos em 160 px, chegando a 192 px no desktop; os arquivos não foram alterados.
- A resposta educativa precisa ser registrada para avançar; erro fornece a explicação original, sem retirar pontos.
- O antigo desafio intermediário do piloto foi substituído pelo encontro anterior à decisão. Suas questões foram reaproveitadas no banco, preservando oportunidades educativas em todas as quatro missões.
- Sorte, Revés e Segunda Chance, sorteio e valores +3/−3/+1 foram mantidos. Revés e Segunda Chance conservam seus cenários e feedbacks, com resposta da reflexão recuperável após recarga no novo piloto.
- As mensagens de conclusão utilizam os exemplos fornecidos no pedido, sem classificar a decisão.

## Banco educativo e rodízio

São sete questões existentes, sem alteração de enunciado, gabarito, explicação ou referência: ET-001 a ET-005, tf-2 e tf-5.

| Guardião | Temas | Questões elegíveis |
| --- | --- | --- |
| Rin | Integridade, responsabilidade e prevenção | ET-003, ET-004, ET-005 |
| Wa | Respeito, convivência e conflitos | ET-001, tf-2, tf-5 |
| Satori | Distinções, reflexão e orientação preventiva | ET-002, ET-003, ET-005 |
| Yūki | Orientação, prevenção e respeito | ET-001, ET-002, ET-005 |

Os subconjuntos se sobrepõem: não são doze perguntas distintas. Os metadados temáticos ficam em `src/data/pilot.ts`; acrescentar questões e associações não exige alterar o motor.

`selectGuardianQuestion` prioriza IDs ainda não utilizados no histórico disponível para aquele tema, exclui a questão imediatamente anterior e mantém a seleção estável por partida/missão. Quando o subconjunto temático se esgota, reinicia apenas esse subconjunto, ainda evitando repetição imediata. Históricos não são apagados ao reiniciar a partida. São locais ao navegador.

Os canais mantêm seu banco compartilhado de cinco perguntas, uma oportunidade por missão e o rodízio anterior. Os cenários das cartas mantêm seus cinco itens por tipo. Não foi implementada uma Carta dos Caminhos nova.

### Pendência editorial antes de qualquer publicação

- Validar as associações temáticas e as introduções. As questões são transversais ao serviço público; nem todas tratam especificamente dos fatos da missão em que o Guardião aparecerá.
- Validar a atualidade e suficiência das referências já existentes. Em particular, a própria referência de ET-004 solicita conferência das regras aplicáveis. Não foi criada fundamentação normativa nova nem realizada validação jurídica dessas fontes.
- Ampliar o banco se for necessário oferecer quatro questões inteiramente inéditas em várias partidas sucessivas. Com sete itens e três elegíveis por Guardião, repetições após esgotamento são inevitáveis.
- O histórico dos desafios dos Guardiões é separado do histórico dos canais. Uma questão compartilhada pode aparecer nas duas modalidades na mesma missão; a garantia de rodízio não abrange essa combinação.

Solicita-se validação editorial desses pontos antes de publicar ou ampliar os conteúdos. Não houve publicação nesta etapa.

## Pontuação real

Preservados os valores unitários de consulta e conhecimento. Como agora todas as quatro missões têm um desafio de Guardião, o máximo do novo piloto é calculado para quatro missões:

| Fonte | Valor por missão | Máximo |
| --- | --- | --- |
| Conhecer a orientação/desafio do Guardião | +5 | 20 |
| Consultar a Comissão de Ética | +5 | 20 |
| Acertar o desafio do Guardião | +15 | 60 |
| Acertar o desafio dos canais | +5 | 20 |
| Aprendizagem | — | **120** |

As cartas preservam seus pontos de sorte e são apresentadas separadamente. Não aumentam nem diminuem a pontuação de aprendizagem. A medalha continua reconhecendo a conclusão, independentemente do resultado.

Não foram mantidos o denominador fixo /100, os níveis de classificação por faixas, a contagem de perspectivas supostamente ouvidas ou as reconsiderações artificiais na nova tela final. São mostrados desafios efetivamente respondidos e missões concluídas. O resumo oferece os caminhos registrados e suas consequências, sob consulta.

## Reinício e compatibilidade

- Cada `START_GAME` do novo piloto gera um `journeyId`. Créditos locais, perguntas e cenários usam essa identidade, não apenas a sala. Reiniciar na mesma sala não reaproveita pontos, respostas nem seleção final.
- `guardianOrder`, questões/respostas dos encontros, decisão humana e identificação final integram o estado salvo.
- Partidas anteriores à versão 2 continuam recuperáveis na dinâmica original, com aviso explícito. Não são convertidas no meio da missão. Ao reiniciar uma partida antiga pela tela final, a interface cria uma partida do novo piloto.
- Os componentes e testes da dinâmica anterior permanecem para essa compatibilidade; não representam o fluxo público de uma nova partida.

## Encerramento

Mantida a Medalha Caminhos da Escuta e incluída a pergunta “Com qual Guardião você mais se identificou nesta jornada?”. Os quatro Guardiões aparecem com retratos, nomes e características.

A escolha é persistida e não altera pontos nem decisões. A composição final usa o avatar inicial, o Guardião escolhido no encerramento, a medalha e a mensagem de reflexão. Compartilhamento, salvamento da composição e convite continuam disponíveis após a escolha. Os desenhos originais não foram alterados.

## Acessibilidade e armazenamento

- Preservados os três tamanhos de texto, alto contraste, redução de movimento, preferências persistidas e layout ampliado.
- Conteúdos narráveis do encontro e das reflexões das cartas receberam a marcação usada pelo áudio existente. O papel do jogador também é narrável.
- Fechamento de modais por Escape reconhece “Voltar à decisão”; nomes acessíveis, foco no feedback e contenção de Tab foram verificados.
- O cabeçalho dos canais permite quebra de linha em 320 px com texto Extra.
- Limitadas a duas notificações simultâneas para não empilhar avisos sobre grandes áreas da interface.
- O adaptador `browserStorage` conserva funcionamento em memória quando o armazenamento é negado. A interface informa que o progresso pode ser perdido ao fechar a página.
- O painel administrativo interno só é montado quando aberto, evitando que sua leitura de configuração local interfira na experiência pública com armazenamento bloqueado. Não foi criado acesso público ao Organizador.

## Validação

### Automatizada

- `npm.cmd test`: **20 testes passaram**, nenhum falhou.
- Os três novos testes cobrem os quatro avatares e quatro missões, guardiões sem repetição, bloqueios das fases, pergunta inválida, resposta preservada, escolhas humanas imutáveis, cartas estáveis, total 120, identificação final/snapshot, reinício com zero, rodízio/esgotamento e armazenamento negado.
- Os 17 testes existentes continuam aprovados, incluindo salvamento/API e compatibilidade da dinâmica anterior.
- `npm.cmd run lint`: TypeScript aprovado.
- `npm.cmd run build`: aprovado. Aviso de bundle acima de 500 kB permanece; JavaScript aproximadamente 632 kB antes de gzip.
- `git diff --check`: sem erros de whitespace; avisos de normalização LF/CRLF do ambiente.

### Navegador

Edge em perfis temporários isolados. Foram realizadas quatro partidas completas até a medalha, uma por avatar, e quatro reinícios pelo botão final na mesma sala, todos com zero pontos e nova identidade.

| Avatar humano | Aprendizagem | Consultas | Conhecimento | Sorte |
| --- | --- | --- | --- | --- |
| Exploradora | 120/120 | 40 | 80 | +2 |
| Observador | 40/120 | 40 | 0 | +2 |
| Construtora | 120/120 | 40 | 80 | +2 |
| Estrategista | 40/120 | 40 | 0 | +2 |

- Alternadas partidas com acertos e erros. Em todas, as decisões humanas permaneceram intactas e os três outros avatares participaram.
- Os quatro Guardiões apareceram uma vez em cada partida; ordens diferentes foram observadas.
- Sorte, Revés e Segunda Chance foram exercitados. Apenas nos perfis de teste, o gerador das cartas foi controlado temporariamente para garantir cobertura; o código de produção não foi modificado para isso.
- Pergunta do Guardião e resposta/feedback preservados após recarregar e retomar. A escolha final também foi verificada por snapshot no teste automatizado.
- Canais consultados sem resposta obrigatória; acertos/erros e consulta à Comissão verificados.
- Situação, encontro, feedback, decisão, revelação, consequências, resumo e composição avaliados em **320, 390, 768 e 1440 px**, incluindo Extra/alto contraste. Foram registradas 156 verificações de fluxo/dimensões no percurso principal, sem overflow horizontal após a correção do cabeçalho.
- Conferência complementar do encontro em Padrão e Extra nas quatro larguras, sem overflow. Texto da questão aumentou de 20 para 30 px.
- Tab, Shift+Tab, Escape e Enter exercitados; foco permaneceu no modal e foi encaminhado ao feedback.
- Testados navegação, consulta, resposta e decisão com armazenamento negado, com aviso visível.
- Áudio: narração do encontro, pausa, retomada, parada e alteração 1× → 1,5× verificadas com instrumentação determinística de síntese de voz no navegador. A retomada utilizou a última posição informada pela voz. O navegador enumerou 323 vozes nativas; qualidade sonora e pronúncia ainda requerem escuta manual. Não se afirma validação auditiva humana.

Capturas e scripts de verificação ficaram exclusivamente na pasta temporária do sistema, fora do repositório.

## Arquivos desta etapa

Novos:
- `src/data/pilot.ts`
- `src/services/browserStorage.ts`
- `src/services/guardianQuestions.ts`
- `src/components/characters/PlayerAvatar.tsx`
- `src/components/mission/GuardianEncounter.tsx`
- `src/components/mission/ParticipantReveal.tsx`
- `src/components/summary/PilotSummary.tsx`
- `tests/pilot.test.ts`
- `docs/nova-dinamica-piloto-20261028.md`

Alterados:
- `src/App.tsx`
- `src/types/game.ts`
- `src/game/engine.ts`
- `src/services/socket.ts`
- `src/services/learningScore.ts`
- `src/hooks/useDialogAccessibility.ts`
- `src/components/lobby/WelcomeScreen.tsx`
- `src/components/lobby/LobbyView.tsx`
- `src/components/characters/PowerButton.tsx`
- `src/components/mission/MissionSituation.tsx`
- `src/components/mission/MissionIndividualChoice.tsx`
- `src/components/mission/MissionConsequence.tsx`
- `src/components/mission/TrueFalseChallenge.tsx`
- `src/components/cards/InstitutionalCardModal.tsx`
- `src/components/summary/JourneyShareCard.tsx`
- `src/components/ui/JourneyAudio.tsx`
- `src/components/ui/RulesModal.tsx`

Sem alterações em `public/`, imagens, banco original de missões, personagens, questões, cenários das cartas, configuração do projeto ou dependências. A integração futura de uma Carta dos Caminhos poderá reutilizar os modelos editoriais existentes, após validação das associações entre missão, canal e referência.
