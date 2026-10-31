# Correção do convite amarelo dos Canais

Data: 29/10/2026. Trabalho local, sem commit, push, merge ou deploy.

O botão amarelo de `MissionIndividualChoice.tsx` ainda escolhia entre “Canais · atividade voluntária” e “Canais · consulta e prática” conforme a versão da jornada. A condição foi retirada: o texto passou a ser sempre “Explore os Canais de Atendimento e ganhe pontos!”.

Mantidos posição, callback e destaque amarelo. O botão permite quebra natural de linha, tem texto legível e não usa abreviação, truncamento ou substituição em telas menores. Seu contêiner aceita quebra para acomodar fontes ampliadas. O convite global de `Navbar.tsx`, disponível no mapa, nas missões e no resumo da jornada v4, já possuía a redação aprovada e foi conferido sem alteração.

Não houve mudança em perguntas, créditos, regras v4, registros ou cálculos legados. Abrir os Canais continua sem conceder pontos; permanecem os créditos pelas respostas adequadas.

## Verificações

- TypeScript, build institucional e 35 testes de regressão aprovados.
- O teste de navegador verifica a frase exata no botão amarelo nas quatro missões das duas jornadas v4 e também em uma tela de decisão restaurada de versão 3.
- Verifica acionamento por Enter, abertura do painel, Escape, retorno do foco ao botão amarelo e estado da missão inalterado pelo acesso.
- Layouts em 320, 390, 768 e 1440 px, com fonte Extra, alto contraste e redução de movimento. Captura de celular inspecionada visualmente; a fonte ampliada pode usar mais de duas linhas para preservar a legibilidade, sem cortar o convite.
- Continuam os testes de atividade voluntária, pergunta pendente, pontuação única, conclusão sem responder à atividade, Guardiões, cartas, resumo, retomada, composição/PNG e avaliação/PDF. A exportação de PDF é instrumentada no teste para não disputar o foco da janela no navegador headless; o código do jogo não foi alterado para esse fim.

Evidências em `artifacts/institutional/verification/resultados.json`, capturas `*-decisao-*`, `*-convite-amarelo-legado-*` e `zip-check.json`. Dispositivos móveis foram emulados; não houve certificação com leitor de tela.

Resultado final: duas jornadas completas aprovadas e 216 verificações de layout sem rolagem horizontal, incluindo a decisão de versão 3. Nenhuma tentativa de API antiga, conexão HTTP externa, erro de execução ou recurso quebrado na execução aprovada. `git diff --check` aprovado.

## Preservação

Pacote anterior, inventário, hash e evidências preservados em `artifacts/institutional/rollback-antes-convite-amarelo-20261029/`. SHA-256 anterior: `da7873aa97ff42a7da722ad7817cd3639b0656dc9249db3e0ade57c3f625db16`.

A entrega usa `artifacts/institutional/Entre-Nos-Institucional.zip` e `artifacts/institutional/publicacao-concurso-2026/site`, com a conferência de quantidade, tamanho e SHA-256 registrada em `verification/zip-check.json`. Nenhuma ação foi executada no Vercel.

Pacote final: 8.342.261 bytes, SHA-256 `c8fe8591c08bd3cf503505717408bcd4fe7412792703932bff688eefe9c63e7e`. Pasta manual atualizada: 23 arquivos, 8.328.346 bytes, todos idênticos ao ZIP e inventário por tamanho e SHA-256. `index.html` confirmado diretamente na raiz. Extração independente conferida em `artifacts/institutional/conferencia-convite-amarelo-20261029/`. Imagens originais preservadas.
