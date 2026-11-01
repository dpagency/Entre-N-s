# Entre Nós — Consolidação de decisões sobre experiência de jogo e evolução

**Data:** 1º de novembro de 2026  
**Natureza:** registro editorial e funcional de decisões; não equivale a comprovação de implementação.  
**Destino sugerido no repositório:** `docs/decisoes-entre-nos-experiencia-e-evolucao-2026-11-01.md`  
**Branch de trabalho:** `desenvolvimento/selecao-jornadas-20261030`

## 1. Finalidade e princípios

O **Entre Nós — Cidade dos Encontros** é uma experiência lúdica de reflexão sobre ética e integridade. A interação deve priorizar o dilema, a decisão autônoma do jogador, as consequências e a aprendizagem. A revisão atual busca **menos cliques, menos instruções repetidas, mais continuidade narrativa e feedback educativo consistente**, sem introduzir complexidade técnica desnecessária.

Princípios editoriais:
- Não presumir conhecimento prévio de normas, guias ou materiais institucionais.
- Não atribuir nota às escolhas éticas dos dilemas; pontuar desafios educativos conforme regras existentes.
- Não antecipar orientações dos Guardiões que possam influenciar a decisão do jogador.
- Preservar referências e explicações após respostas educativas, mesmo ao simplificar textos introdutórios.
- Manter acessibilidade, leitura confortável em dispositivos móveis e redução de animações quando configurada.
- Distinguir decisões aprovadas, execução técnica relatada, validação da usuária e propostas futuras.

## 2. Situação conhecida antes desta rodada

Conforme relatórios apresentados pelo Codex, já foram realizados localmente, sem commit, push, merge ou deploy nesta rodada:
- Jornada 2 com quatro missões e narrativas próprias, mantendo a Jornada 1.
- Personagens incidentais sem retratos, preservando avatares e Guardiões.
- Perguntas reutilizáveis independentes do contexto de uma missão.
- Uma participação educativa dos Canais por missão, com acerto opcional, +5 por acerto, sem duplicidade.
- Navegação dos Canais com **Fechar pergunta**, **Voltar ao jogo** durante missões e **Fechar** fora delas.
- Encerramento da Jornada 2 em tela única, com acesso ao Guia Lilás.
- Agrupamento de diálogos da Jornada 2: 30 para 15 trechos, segundo o Codex.
- Último relatório técnico informado: **61 testes aprovados** após agrupamento de diálogos.

**Atenção:** resultados de testes e implementação acima são declarações do Codex; as decisões da seção seguinte ainda exigem implementação e validação específicas.

## 3. Decisões aprovadas para a próxima revisão

### 3.1. Narrativa e ritmo
- Agrupar falas curtas e informações consecutivas; não impor um clique por frase.
- Na abertura da Jornada 2, avaliar exibir os quatro trechos em uma única apresentação legível.
- Evitar rótulos como **Narração** quando apenas introduzem uma frase isolada sem ganho de compreensão.
- Preservar ordem, sentido e conteúdo das falas; não reduzir fonte para evitar rolagem.
- Após a escolha, reunir **consequência e reflexão final** em uma apresentação quando couber confortavelmente.
- Substituir **Ver o que aconteceu** por uma chamada breve relacionada à decisão, como **E depois da sua escolha, o que aconteceu?**.

### 3.2. Sequência desejada de cada missão
1. História e dilema.
2. Decisão autônoma do jogador.
3. Outros olhares: escolhas dos participantes virtuais.
4. Consequência da escolha e reflexão final.
5. **Desafio das Cartas do Destino**.
6. **Desafio dos Guardiões da Integridade**.
7. **Desafio dos Canais de Atendimento**.
8. Continuação para a missão seguinte.

**Justificativa:** perguntas dos Guardiões não devem interromper o raciocínio entre a apresentação do dilema e a decisão. A etapa dos Canais passa a integrar o fluxo natural da missão, sem aparência de obrigação externa à narrativa.

### 3.3. Guardiões da Integridade
- Preservar imagens, nomes, funções e valores individuais dos Guardiões. **Guardiões da Integridade** é a designação coletiva; manter designações individuais como **Guardiã da Convivência**.
- Guardião intervém **após** a decisão, sem modificá-la ou atribuir-lhe nota.
- Apresentar **breve reflexão própria** sobre a situação, que amplie a perspectiva do jogador sem repetir mecanicamente a reflexão final da missão; preferir duas ou três frases, na mesma tela do desafio, sem clique adicional.
- Apresentar imediatamente a pergunta educativa, sem frases introdutórias repetitivas ou botão **Iniciar desafio**.
- Manter explicações e referências após a resposta.
- Exibir indicação de pontos de modo discreto junto ao título da pergunta, por exemplo **Respeito diante de conflitos · Ganhe 15 pontos**; reduzir tamanho excessivo dos botões Verdadeiro/Falso.
- Perguntas podem vir do banco compartilhado e **não precisam** estar relacionadas ao dilema; a reflexão do Guardião, sim.
- **Não inventar reflexões novas sem validação editorial.**

### 3.4. Cartas e Canais
- Nome da etapa: **Desafio das Cartas do Destino**. Preservar três cartas, sorteio e regras existentes.
- Retirar das telas explicações reiteradas sobre sorteio, pontos e ausência de nota nas escolhas; centralizar regras nas instruções do jogo e no resumo de pontuação.
- Nome da etapa: **Desafio dos Canais de Atendimento**. Uma participação por missão, sem exigir acerto; +5 por resposta correta.
- Após responder, permitir **Fechar pergunta**, consultar livremente os canais e **Voltar ao jogo**.
- Retirar botão amarelo permanente dos Canais das telas narrativas, **preservando consulta livre fora das missões**.
- Preservar o conteúdo institucional dos canais para revisão editorial futura, sem alterá-lo nesta rodada.

### 3.5. Feedback e celebração
- Retomar confetes breves **apenas após respostas corretas em desafios pontuados**, respeitando a preferência de redução de animações.
- Não usar confetes para sinalizar suposta correção moral das escolhas nos dilemas.

## 4. Banco de perguntas: orientação editorial aprovada

- Um **banco compartilhado e reutilizável** entre jornadas; não criar bancos exclusivos por jornada nem níveis de dificuldade.
- Perguntas curtas e acessíveis, especialmente verdadeiro/falso para Guardiões, sem exigir leitura prévia.
- Cada questão deve registrar identificador, afirmação, resposta, breve explicação e referência ao material de origem.
- O Guia Lilás da CGU é uma fonte inicial, **não exclusiva**; outros materiais institucionais também podem inspirar perguntas.
- Oferecer referência ou **Saiba mais** opcional; não impor leitura para avançar.
- Preservar perguntas próprias sobre competências institucionais para o desafio dos Canais, sem duplicar pontos ou repetir perguntas na mesma tentativa.
- Preparar inicialmente **12 perguntas inspiradas no Guia Lilás para validação editorial**, sem incorporá-las automaticamente.

## 5. Evolução futura: avisos institucionais temporários

**Status: ideia aprovada conceitualmente, NÃO implementada.**

Possibilitar um aviso pontual na entrada da Cidade dos Encontros para:
- Felicitações pelo **Dia do Servidor Público** ou **Ano-Novo**.
- Divulgação de edições do **Minuto da Ética**.
- Convites para palestras, campanhas e eventos de ética e integridade.
- Divulgação de conteúdos educativos relevantes.

Características desejadas: um aviso por vez, dispensável, não reapresentado de forma insistente, conteúdo e link configuráveis, sem backend ou painel administrativo inicialmente. Não transformar a página inicial em mural permanente. Conteúdo institucional sujeito à validação da unidade competente.

**Potencial para o Concurso de Boas Práticas em Ética:** evidenciar a possibilidade de evolução do Entre Nós como ponto de contato recorrente com comunicação e educação institucional. **Não apresentar como funcionalidade entregue ou resultado medido.**

Texto-base para documentação da proposta:

> A proposta prevê a possibilidade de avisos institucionais temporários na entrada da Cidade dos Encontros, para divulgar campanhas, eventos, materiais educativos e mensagens alusivas a datas comemorativas. O recurso poderá ampliar as oportunidades de contato com conteúdos de ética e integridade, sem interferir na experiência de jogo.

## 6. Enquadramento para o Concurso de Boas Práticas

Três dimensões da iniciativa:
1. **Experiência:** dilemas, escolhas autônomas, perspectivas de outros participantes e consequências.
2. **Aprendizagem:** reflexões dos Guardiões, cartas, perguntas educativas, feedback e acesso a referências e canais institucionais.
3. **Comunicação:** potencial de avisos temporários e divulgação de campanhas e conteúdos institucionais.

**Cuidado com evidências:** distinguir funcionalidades publicadas, funcionalidades implementadas apenas localmente, propostas de melhoria e impactos efetivamente demonstrados. Evitar afirmações de alcance, engajamento ou efetividade sem dados.

## 7. Orientações de implementação e controle

- Trabalhar na branch `desenvolvimento/selecao-jornadas-20261030`.
- Revisar componentes compartilhados com cautela para não provocar regressão da Jornada 1.
- Preservar avatares, Guardiões, escolhas, consequências, cartas, pontuação, acessibilidade, tela inicial aprovada, encerramentos e consulta institucional.
- **Atenção a partidas salvas:** mudança da ordem das etapas pode afetar retomadas; identificar e tratar compatibilidade antes de aplicar migrações.
- Validar desktop, celular, teclado, leitura, animações reduzidas, fluxo completo, não repetição de perguntas e pontuação.
- Solicitar capturas e relatório de testes.
- **Não realizar commit, push, merge ou deploy sem autorização.**

## 8. Pendências de validação

- [ ] Conferir visualmente a abertura compactada e os blocos narrativos.
- [ ] Aprovar a apresentação conjunta de consequência e reflexão.
- [ ] Validar a nova sequência de desafios nas quatro missões da Jornada 2.
- [ ] Revisar editorialmente as reflexões específicas dos Guardiões.
- [ ] Conferir textos e referências do feedback educativo.
- [ ] Testar confetes e opção de reduzir animações.
- [ ] Validar retomada de partidas existentes após reorganização.
- [ ] Aprovar e integrar posteriormente as 12 novas perguntas do banco compartilhado.
- [ ] Consolidar commit local após aprovação; manter publicação inalterada.

---

**Registro de decisão:** este documento é a referência editorial consolidada em 01/11/2026. Qualquer divergência técnica ou necessidade de alteração de conteúdo deve ser submetida à validação antes de implementação.
