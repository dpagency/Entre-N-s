# Auditoria do rodízio e desafios dos canais — 22/10/2026

Branch: `ajustes-tela-inicial-20261021`. Alterações exclusivamente locais, preservando o layout ampliado e as revisões anteriores.

## Bancos aprovados, sem alterações de conteúdo

| Canal | Perguntas disponíveis |
| --- | --- |
| Comissão de Ética Pública | 5, do banco compartilhado |
| Gestão de Pessoas / Recursos Humanos | As mesmas 5 |
| Ouvidoria / Canal de Manifestação | As mesmas 5 |
| Corregedoria / Unidade Correcional | As mesmas 5 |
| Canal de Acolhimento e Apoio Psicossocial | As mesmas 5 |

São **5 perguntas distintas no total**, `ET-001` a `ET-005`, em `src/data/ethicsQuestions.ts`. Não há 25 perguntas nem bancos exclusivos por canal. São perguntas gerais de conhecimento ético; seus enunciados, verdadeiro/falso, gabaritos, explicações e referências foram preservados.

- **Segunda chance:** 5 cenários, `sc-1` a `sc-5`, cada um com duas alternativas reflexivas e respectivos feedbacks.
- **Revés:** 5 cenários, `rv-1` a `rv-5`, cada um com três alternativas e respectivos feedbacks.
- Esses cenários vêm de `src/data/fortuneScenarios.ts`, também preservado. A segunda chance é uma oportunidade da carta do destino, não uma segunda tentativa da pergunta de canal. Suas regras e pontuação não foram alteradas.

## Problemas encontrados e correções

1. **Canais podiam repetir imediatamente uma pergunta:** o sorteio era independente, sem histórico. Agora exclui a última pergunta sorteada e, havendo alternativas, a utilizada na mesma missão da partida anterior.
2. **Estado do desafio não distinguia integralmente as partidas:** a comparação em memória verificava a missão, mas não a sala. Agora pergunta e resposta são associadas à combinação sala + missão, sem transportar uma resposta antiga para a nova jornada.
3. **Segunda chance tinha proteção parcial:** já excluía o último cenário quando o armazenamento funcionava. Foi mantida essa regra e acrescentada a exclusão do cenário anterior da mesma missão, com continuidade em memória quando o armazenamento estiver bloqueado.
4. **Reinício solo estava bloqueado sem recarregar:** descartar o salvamento limpava as credenciais locais, mas mantinha a conexão vinculada ao jogador antigo no motor local. A criação da segunda sala era rejeitada. Ao descartar explicitamente uma jornada, agora se usa a desconexão local já existente antes de criar outra sala, além de limpar a missão ativa. O motor não foi alterado. Voltar ao início continua preservando o salvamento; a liberação ocorre somente ao descartar a jornada.
5. **Pergunta ficava abaixo de todo o conteúdo educativo:** agora o desafio vem primeiro, após a contextualização breve da finalidade do canal.

## Como a seleção funciona

- Ao abrir os canais durante uma missão, recupera-se a pergunta já atribuída àquela sala/missão ou sorteia-se uma nova.
- Todos os canais compartilham essa oportunidade da missão: mudar de canal não permite trocar a pergunta, tentar novamente nem multiplicar pontos.
- Para uma oportunidade nova, a seleção aleatória escolhe entre os IDs restantes após as exclusões do histórico. Com os bancos atuais de cinco itens, há alternativas suficientes.
- Perguntas e cenários ficam estáveis quando a mesma oportunidade é reaberta ou a página é recarregada.
- O histórico anterior dos cenários e os registros antigos de canais por índice continuam sendo aceitos. Os novos registros também guardam o ID, evitando depender apenas da posição no banco.
- Histórico de rodízio é mantido localmente, por tipo de banco e missão; não é apagado ao começar uma nova partida.

## Apresentação dos canais

- Nome e finalidade breve do canal antes do desafio, utilizando os textos já existentes do canal.
- Painel com borda destacada, título **Desafio de conhecimento**, indicação **+5 pontos**, enunciado e alternativas Verdadeiro/Falso.
- Botão explícito para consultar o conteúdo sem responder. Fora das missões, o conteúdo continua disponível e a indisponibilidade do desafio fica informada.
- Após responder, feedback original e referência ficam visíveis, o foco vai ao feedback e o painel rola internamente para apresentá-lo. A página da missão não é deslocada para isso.
- O conteúdo complementar é expandido automaticamente: quando acionar, limites, exemplo e esclarecimento do fluxo. Também pode ser ocultado/reaberto livremente.
- Alternativas respondidas permanecem identificadas e bloqueadas. Estados selecionados, nomes acessíveis e alto contraste são preservados, inclusive quando a resposta fica desabilitada.
- Nenhuma alteração nas regras de aprendizagem: acerto no canal vale +5 uma única vez por missão; erro não acrescenta pontos e não libera nova tentativa. Tetos e demais fontes de pontos continuam definidos pelo serviço existente, sem alteração.

## Validação realizada

### Automatizada

- **17 testes passaram**: os 8 testes anteriores, 8 novos testes do rodízio e 1 regressão do reinício solo.
- Testes novos cobrem: duas jornadas; última pergunta e missão correspondente; pergunta/resposta estáveis; compatibilidade com registros antigos; registros inválidos; rodízio de segunda chance e revés; armazenamento bloqueado; bancos pequenos; segunda sala independente com salvamento funcional.
- `npm run lint`: TypeScript sem erros.
- `npm run build`: concluído. Permanece o aviso de bundle acima de 500 kB.

### Navegador

Edge em perfil isolado, sem interferir na partida do navegador habitual:

- **Duas jornadas completas, quatro missões em cada uma, até a medalha.** A segunda foi iniciada pela interface sem recarregar, verificando a correção do vínculo local.
- Perguntas dos canais na execução final:
  - Partida 1: `ET-004`, `ET-001`, `ET-005`, `ET-003`.
  - Partida 2: `ET-002`, `ET-004`, `ET-001`, `ET-002`.
- Nenhuma repetição imediatamente consecutiva. As perguntas das missões correspondentes também diferiram entre as duas partidas.
- Segunda chance na mesma missão das duas partidas: **`sc-2` e `sc-4`**, distintas. O embaralhamento das cartas foi controlado apenas no perfil de teste para garantir duas oportunidades de segunda chance; a seleção dos cenários usou a implementação real de rodízio. Não houve alteração no sorteio de produção.
- Primeira partida: quatro respostas corretas, quatro créditos de +5 nos canais. Segunda: quatro incorretas, nenhum crédito de canal. Os demais componentes da pontuação permaneceram independentes.
- Os cinco canais foram consultados: mesma pergunta por missão e contextualização do canal selecionado. Consulta educativa sem resposta verificada.
- Fechar/reabrir, trocar de canal e retornar ao painel não alteraram a pergunta/resposta nem duplicaram pontos.
- Desafio, feedback correto e incorreto verificados em **320, 390, 768 e 1440 px**, em Padrão e com Extra/alto contraste. Nenhuma rolagem horizontal encontrada.
- Verificado que o feedback recebe foco e fica visível dentro da janela nas quatro larguras; conteúdo complementar aparece após a resposta.

## Limitações mantidas

- O banco é compartilhado e geral: não foi inventado conteúdo específico de RH, Ouvidoria, Corregedoria ou Acolhimento.
- Não há promessa de percorrer as cinco perguntas sem repetir: repetições não consecutivas são permitidas. A garantia é contra a repetição imediata e, havendo alternativas, contra a repetição na missão correspondente da partida anterior.
- Históricos são deste navegador. Limpar dados, trocar de dispositivo ou usar outro perfil remove a continuidade desse histórico. Com armazenamento bloqueado, o rodízio continua apenas em memória enquanto a página permanece aberta.
- O registro de pontos mantém a dependência já existente do armazenamento local. Não foi criado servidor, coleta de dados pessoais, integração externa ou dependência nova para essa função.
- A segunda chance continua sendo uma reflexão com feedback por alternativa, sem transformar o dilema em uma pergunta com gabarito.

## Arquivos desta etapa

- `src/services/questionRotation.ts`: seleção estável, exclusões do histórico, migração e persistência dos desafios.
- `src/components/cards/InstitutionalCardModal.tsx`: contextualização, desafio destacado, consulta livre, feedback e estados por sala/missão.
- `src/components/mission/MissionConsequence.tsx`: integração do rodízio dos cenários, preservando seu conteúdo e regras.
- `src/services/socket.ts`: liberação da conexão ao descartar a jornada e limpeza da missão ativa.
- `src/index.css`: legibilidade da resposta selecionada/desabilitada em alto contraste.
- `tests/questionRotation.test.ts` e `tests/socketRestart.test.ts`: regressões.
- `docs/auditoria-perguntas-canais-20261022.md`: este relatório.

Imagens, personagens, perguntas aprovadas, narrativas, missões, medalhas, áudio e serviço de pontuação sem alterações. Scripts temporários de verificação removidos; capturas de diagnóstico ficaram somente na pasta temporária do sistema.

Nenhum commit, push, merge ou publicação na Vercel realizado.
