# Revisão local da abertura e da acessibilidade — 21/10/2026

Branch: `ajustes-tela-inicial-20261021`. Base do trabalho local: `6e2e791`.
Nenhum commit, push, merge ou comando de publicação foi realizado nesta revisão.

## Abertura

- Identificação do jogo movida do selo central para o cabeçalho, ao lado de Entre Nós.
- Canais, Regras e Acessibilidade mantidos, com nomes acessíveis explícitos.
- Título completo e Cidade dos Encontros preservados.
- Orientação inicial única; status do Guardião informa o nome e preserva a autonomia do jogador.
- Apelido limitado a 448 px no desktop; ocupa a largura disponível no celular.
- Avatares antes dos Guardiões em todas as larguras, quatro cards por linha a partir de 640 px e dois no celular.
- Retratos originais preservados, até 192 px, sem alterações nos arquivos, caminhos ou nomes dos oito personagens.
- Botão Começar compacto, arredondado e centralizado; envio, validações e transição preservados.

## Auditoria das opções existentes

| Recurso | Problema encontrado | Correção e evidência no navegador |
| --- | --- | --- |
| Padrão / Grande / Extra | A classe no contêiner não alcançava componentes com tamanho próprio. | Escala tipográfica global de 100%, 125% e 150%, incluindo tamanhos em pixels e ajustes móveis. Nome de avatar no desktop: 18 → 22,5 → 27 px; título do painel: 18 → 22,5 → 27 px. Retornar a Padrão restaura as medidas iniciais. |
| Alto contraste | Filtro de contraste no contêiner, sem tratamento dos estados. | Fundo preto, texto branco, bordas brancas, seleção amarela com texto preto. Bordas do input passaram da cor slate para branco; cards selecionados passaram a `rgb(250, 204, 21)` com texto `rgb(0, 0, 0)`. As imagens não recebem filtros. |
| Reduzir animações | Classe sem ligação efetiva aos efeitos. | Animações e transições CSS desativadas; preferência encaminhada ao MotionConfig. Transição de card: 0,15 s → 0 s. Componente de confetes, verificado isoladamente: 24 partículas → 0. A preferência do sistema também é respeitada. |
| Teclado | Interruptores sem nome explícito; ausência de contenção/restauração global do foco nos modais. | Interruptores nomeados; foco visível; Tab e Shift+Tab circulam no modal; Escape fecha modais dispensáveis e devolve o foco ao controle de origem. Enter registra uma alternativa na missão. Estados selecionados são anunciados também em cards, mapa, questionários e avaliação. |
| Persistência | Preferências visuais começavam com os valores padrão ao recarregar. | Preferências validadas e salvas em `entre-nos-accessibility`, aplicadas no documento inteiro; verificadas após reload e ao percorrer a missão. Armazenamento indisponível não impede o uso na sessão. |
| Narração | Mudar velocidade pausava, mas a retomada podia usar o enunciado já criado com a velocidade antiga. | A retomada com nova velocidade recria somente o restante informado pelo evento de posição da voz. Velocidade também fica salva. Ouvir, Pausar, Continuar e Parar preservados. Nenhum texto narrativo alterado. |

## Validação funcional e visual

- Edge sem interface gráfica em 320, 390, 768 e 1440 px: abertura, painel, avatar e avaliação sem rolagem horizontal, inclusive com Extra e alto contraste.
- Inspeção visual das capturas de abertura em celular/desktop, painel em alto contraste e missão com texto Extra.
- Modais preservados; controles de tamanho, contraste e movimento acionados pela interface.
- Navegação de teclado: Tab, Shift+Tab, Escape, foco visível e devolução do foco; seleção de ação por Enter.
- Missão solo **Uma voz ainda não ouvida** percorrida pelo fluxo real: abertura → lobby → mapa → cenário e diálogo → escolha por teclado → revelação → consequências/reflexão → carta e eventual desafio → retorno ao mapa.
- Preferências Extra, alto contraste e movimento reduzido permaneceram ativas. Cenário: 16 → 24 px no desktop; diálogo: 21 px em Extra; alternativa: 25,5 px no celular. Cenário, alternativas, revelação e feedbacks verificados sem transbordamento horizontal em 390 px.
- Narração: adaptador controlado confirmou seleção exclusiva dos trechos `data-narration="story"`, pausa, retomada, parada e mudança de 1× para 1,5× a partir da posição informada. Textos de navegação não foram incluídos.
- `npm test`: 8 testes passaram, incluindo dois novos testes de persistência e recuperação segura das preferências. Os seis testes existentes de API/jogo continuaram passando.
- `npm run lint`: TypeScript sem erros.
- `npm run build`: concluído; permanece o aviso de bundle acima de 500 kB.
- Arquivos de personagens/imagens, dados de missões, motor, salvamento e pontuação sem alterações nesta revisão. Mudanças em componentes de jogo se limitam à semântica de acessibilidade e apresentação.

## Limitações e conferências manuais pendentes

- O Edge sem interface gráfica não disponibilizou vozes (`getVoices()` retornou zero). O teste de áudio valida a ligação dos comandos com um adaptador; não comprova som audível. É necessária conferência manual em navegador com voz pt-BR instalada.
- A retomada comum usa o pause/resume nativo. Ao mudar a velocidade, a precisão depende dos eventos `boundary` da voz. Se ela não informar posição, o trecho pode recomeçar. A interface informa essa dependência.
- Não foi realizada certificação WCAG nem teste com leitor de tela real (NVDA, JAWS ou VoiceOver). Foram verificados nomes, estados, foco e teclado no navegador.
- Preferências persistem neste navegador quando o armazenamento está disponível. Bloqueio do armazenamento limita a persistência à sessão em memória.

## Arquivos modificados ou adicionados

- `src/App.tsx`: integração/persistência das preferências, configuração de movimento e foco dos modais; largura da abertura mantida.
- `src/index.css`: tipografia escalável, contraste, foco, movimento e reflow móvel com texto ampliado; retratos ampliados mantidos.
- `src/components/lobby/WelcomeScreen.tsx`: apresentação, apelido e botão Começar; seleção e imagens preservadas.
- `src/components/ui/Navbar.tsx`: identificação discreta e nomes acessíveis.
- `src/components/ui/AccessibilityModal.tsx`: nomes/estados dos controles e painel rolável.
- `src/components/ui/JourneyAudio.tsx`: velocidade efetiva na retomada e persistência da velocidade.
- `src/components/ui/LearningConfetti.tsx`: preferência de movimento escolhida no jogo.
- `src/components/board/TownMap.tsx`: estado selecionado acessível no mapa desktop.
- `src/components/cards/CardView.tsx`: nome e estados acessíveis das alternativas.
- `src/components/mission/MissionConsequence.tsx`: estados acessíveis das cartas e respostas.
- `src/components/evaluation/PreTestModal.tsx` e `PostTestModal.tsx`: seleção anunciada.
- `src/components/evaluation/FeedbackModal.tsx`: avaliação nomeada, notas com estado selecionado e campo de comentário associado à identificação.
- `src/hooks/useDialogAccessibility.ts`: contenção e restauração do foco nos modais.
- `src/services/accessibility.ts`: leitura validada e gravação das preferências.
- `tests/accessibility.test.ts`: regressões de persistência e armazenamento inválido/bloqueado.
- `docs/revisao-acessibilidade-20261021.md`: este relatório.

Roteiros e página temporária de verificação removidos. Capturas de diagnóstico ficaram apenas na pasta temporária do sistema, fora do repositório.
