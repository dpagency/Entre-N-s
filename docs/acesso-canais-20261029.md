# Acesso e retomada dos Canais — conferência antes da publicação

Data: 29/10/2026. Sem commit, push, merge ou deploy.

## Diagnóstico e ajustes mínimos

O acesso aos Canais já estava no cabeçalho comum ao mapa, às missões e ao resumo. As respostas, feedbacks, pontuação única e possibilidade de terminar sem concluir a atividade já existiam. Porém, no celular o acesso principal aparecia apenas como ícone; a reabertura não preservava uma pergunta pendente escolhida manualmente; e, depois das cinco respostas, mostrava por padrão a primeira pergunta respondida.

Foram ajustados somente esses pontos:

- `Navbar.tsx`: convite visível durante a jornada v4, no computador e celular, com o texto exato “Explore os Canais de Atendimento e ganhe pontos!”. Nenhuma quantidade de pontos no botão. O acesso compacto existente foi mantido. Jornadas antigas mantêm o acesso informativo, sem anunciar uma premiação que não pertence às suas regras.
- `channelActivity.ts`: registro separado da pergunta pendente por jornada e versão do banco. Não altera respostas nem pontos. Uma pergunta confirmada deixa de ser candidata à abertura; outra ainda disponível é apresentada no próximo acesso. Se o painel for fechado sem confirmação, a pergunta pendente é preservada, inclusive após recarga.
- `ChannelActivity.tsx`: abertura posicionada na pergunta pendente, sem disputar o foco inicial com o gerenciador do diálogo. Após as cinco respostas, abre com a mensagem de conclusão e mantém os botões para consultar respostas e feedbacks, além das informações dos Canais. Não repete uma pergunta pontuada por padrão.
- `App.tsx`: convite da jornada não é exibido na abertura informativa anterior à retomada/início. A pontuação e os registros antigos não foram modificados.

O registro novo guarda a pergunta, não uma resposta confirmada nem pontos por acesso. Não há mudança das regras v4, dos bancos de perguntas, dos Guardiões, das cartas, dos indicadores ou da compatibilidade das jornadas anteriores.

## Onde foi verificado

- `tests/channelActivity.test.ts`: pergunta pendente escolhida, reabertura, avanço após confirmação, conclusão e preservação dos cinco registros. Continuam os testes de pontuação única, erros sem segunda tentativa, isolamento, compatibilidade e máximo 100.
- `scripts/verify-institutional-browser.mjs`: convite acionado por teclado no mapa; pergunta 4 escolhida e preservada após fechar e recarregar; acessos durante missões e no resumo; resposta seguida de outra pergunta disponível; conclusão sem pergunta pendente; respostas bloqueadas para edição e feedback consultável; informação dos Canais disponível após conclusão.
- Uma das duas jornadas chega à medalha com zero perguntas voluntárias respondidas e depois realiza a atividade no resumo, confirmando que ela não bloqueia conclusão ou avaliação.

Resultados: 35 testes aprovados, TypeScript e builds normal/institucional aprovados; duas jornadas completas e 212 verificações de layout em 320, 390, 768 e 1440 px, incluindo fonte Extra, alto contraste, redução de movimento, teclado e recarga. Pontuações mantidas em 100/100 e 0/95 conforme respostas e oportunidades do teste. Retomada de versão 3 com seus pontos antigos preservados. Nenhuma tentativa de API antiga, conexão HTTP externa, erro de execução ou recurso quebrado nas jornadas aprovadas.

Evidências em `artifacts/institutional/verification/resultados.json`, capturas e `zip-check.json`. Celulares foram emulados; a verificação de acessibilidade não equivale a certificação por leitor de tela. O build normal mantém o aviso conhecido de JavaScript acima de 500 kB. Registros continuam locais, com as limitações de armazenamento já documentadas na entrega v4.

## Entrega manual

Novo pacote: `artifacts/institutional/Entre-Nos-Institucional.zip`, 8.342.127 bytes. SHA-256: `da7873aa97ff42a7da722ad7817cd3639b0656dc9249db3e0ade57c3f625db16`.

`artifacts/institutional/publicacao-concurso-2026/site` atualizada: 23 arquivos, 8.328.212 bytes, com `index.html` diretamente na raiz. Quantidade, tamanho e SHA-256 conferem com as entradas do ZIP e o inventário. Extração independente por `Expand-Archive` em `artifacts/institutional/conferencia-acesso-canais-20261029/`. Imagens originais idênticas às anteriores.

Versão anterior, hash, inventário e evidências preservados em `artifacts/institutional/rollback-antes-acesso-canais-20261029/`. SHA-256 anterior: `591857b63bfac5763922f6ef71d63295a5e809bb4696c1dc17751002ab03160d`.

A pasta está pronta para conferência e publicação manual no projeto `entre-nos-piloto-concurso-2026`. Nenhuma ação foi executada no Vercel.
