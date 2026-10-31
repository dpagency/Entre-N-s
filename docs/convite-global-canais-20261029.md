# Convite amarelo dos Canais em toda a jornada

Data: 29/10/2026. Alterações locais, sem commit, push, merge ou deploy.

## Correção

O botão amarelo era específico da tela de decisão, enquanto o convite do cabeçalho usava outra apresentação. O convite principal passou a ser renderizado uma única vez em `App.tsx`, no início do painel principal, em todas as etapas de uma jornada iniciada. No computador fica alinhado à direita; no celular usa a largura disponível e quebra o texto sem abreviação ou corte.

Texto único: “Explore os Canais de Atendimento e ganhe pontos!”. Mantida a identidade amarela no tema padrão e o respeito às preferências de alto contraste. Removidas as cópias de `Navbar.tsx` e `MissionIndividualChoice.tsx`. O acesso informativo compacto “Canais” continua no menu superior.

O botão usa o mesmo painel educativo já existente. Nenhuma pergunta, regra v4, cálculo, limite de créditos, narrativa, Guardião, carta ou registro de resposta foi alterado. O painel da missão permanece montado ao abrir os Canais, preservando decisões e estados de consulta. Antes de iniciar/retomar uma jornada, permanece somente o acesso informativo do menu.

## Telas verificadas expressamente

O teste percorre as quatro missões em duas jornadas completas e aciona o convite por teclado em cada etapa abaixo, em 390 e 1440 px:

| Etapa | Telas verificadas |
|---|---|
| Mapa | Mapa inicial e retorno ao mapa após cada uma das três primeiras missões |
| Narrativa | Apresentação das missões M-01, M-02, **M-03 “O erro na entrega”** e M-04 |
| Perspectivas | Perspectivas expandidas dos personagens nas quatro missões; também nas duas missões adicionais do catálogo por snapshots de teste |
| Decisão | “O que você faria?” nas quatro missões; identificação do texto também na decisão de uma jornada de versão 3 |
| Guardiões | “Desafio dos Guardiões da Integridade”, antes de iniciar e depois de responder, nas quatro missões |
| Cartas | Consequência antes do sorteio; Caminhos, Segunda Chance e Revés revelados; respectivas respostas e feedbacks |
| Resumo | Resumo/medalha antes de concluir a atividade voluntária e composição final após identificação com um Guardião |
| Consultas adicionais | Escolhas dos participantes e painel aberto de revisão das alternativas |

Para cada acionamento do percurso, são verificados: um único convite principal, texto exato, classe de fundo amarelo, visibilidade sem corte, abertura por Enter, próxima pergunta pendente ou mensagem de conclusão, navegação por Tab dentro do painel, fechamento por Escape e retorno do foco ao convite.

Após fechar, o teste compara integralmente o estado da missão, os registros de aprendizagem, as respostas das cartas e da atividade voluntária e o estado aberto/fechado dos painéis de perspectivas e revisão. O acesso não concede pontos nem perde progresso. As mudanças de largura usadas pelo teste são revertidas antes de continuar as verificações de áudio e perspectivas.

## Testes e evidências

35 testes de regressão, TypeScript e builds normal/institucional aprovados. O build normal mantém o aviso conhecido de JavaScript acima de 500 kB. Evidências em `artifacts/institutional/verification/resultados.json`, capturas `*-M03-convite-narrativa-*` e `zip-check.json`.

Resultado final: duas jornadas completas aprovadas, 224 verificações de layout e 176 verificações de presença, unicidade, acionamento por teclado e retorno do convite nas diferentes etapas. Dessas, 40 verificações correspondem às etapas de M-03. Nenhuma tentativa de API antiga, conexão HTTP externa, erro de execução ou recurso quebrado na execução aprovada. Pontuações v4 mantidas em 100/100 e 0/95 conforme as respostas do teste; versão 3 retomada com seus pontos anteriores preservados. `git diff --check` aprovado.

São mantidos os testes de pergunta pendente, resposta única, consulta sem pontuação, conclusão sem responder à atividade voluntária, retomada das regras 3 e anteriores, pontos e máximos, perspectivas somente resumidas, descoberta progressiva dos Guardiões, avaliação/PDF e composição/PNG.

Os testes de layout também cobrem 320 e 768 px, fonte Extra, alto contraste e redução de movimento. Captura de M-03 em celular inspecionada visualmente. Dispositivos móveis foram emulados; teclado e árvore de acessibilidade não equivalem a certificação com leitor de tela. O teste de PDF mantém a instrumentação de foco da janela para execução headless, sem alterar o jogo.

## Preservação e entrega

Versão anterior preservada em `artifacts/institutional/rollback-antes-convite-global-20261029/`, com ZIP, inventário, hash e evidências. SHA-256 anterior: `c8fe8591c08bd3cf503505717408bcd4fe7412792703932bff688eefe9c63e7e`.

Entrega: `artifacts/institutional/Entre-Nos-Institucional.zip` e `artifacts/institutional/publicacao-concurso-2026/site`. A conferência final de quantidade, tamanho e SHA-256, incluindo `index.html` diretamente na raiz, fica em `artifacts/institutional/verification/zip-check.json`.

Pacote final: 8.341.922 bytes, SHA-256 `d9b69ca73613023301d29b3fe7f48e720f3638446eca7698232a296596b9af35`. Pasta manual atualizada: 23 arquivos, 8.328.007 bytes, todos idênticos ao ZIP e inventário por tamanho e SHA-256. Extração independente por `Expand-Archive` em `artifacts/institutional/conferencia-convite-global-20261029/`. Imagens originais idênticas às anteriores.

Nenhuma ação foi executada no projeto Vercel. A publicação permanece manual.
