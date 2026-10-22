# Revisão global da escala visual — 22/10/2026

Branch: `ajustes-tela-inicial-20261021`.

A revisão de 21/10 concentrou-se na abertura e na acessibilidade. Ela não ampliou sistematicamente o mapa e todas as telas da jornada. Este trabalho complementa essa etapa, preservando as alterações locais anteriores.

## Mapa Territorial da Convivência e quatro regiões

- Área principal da jornada ampliada de um limite de 1280 para 1440 px.
- Removido o limite de 520 px de altura da ilustração. Em viewport de 1440 px, o mapa mediu **1326 × 745,875 px**, aproximadamente 43% acima do antigo limite de altura.
- A mesma ilustração original também aparece no celular: **320 × 200 px** em viewport de 390 px; **250 × 156,25 px** em viewport de 320 px.
- Cards das regiões retirados da sobreposição sobre a paisagem e colocados em grade abaixo dela. Assim, a ilustração ganha espaço e os nomes/subtítulos podem ser exibidos por inteiro.
- Grade: uma coluna no celular, duas a partir de 640 px e quatro a partir de 1280 px.
- Em 1440 px, cada card mediu aproximadamente **319,5 × 281 px**. Antes, os cards sobrepostos tinham limite de 210 px de largura no desktop.
- Em 390 px, os quatro cards usam toda a largura disponível de **320 px**, com altura aproximada de 288 px. A altura cresce quando o texto ou o estado da região exige.
- Títulos das regiões: **24 px** no desktop, em lugar dos antigos 14 px; subtítulos e ações deixam de depender de textos de 10–11 px. Ícones ampliados de 24 para 32 px.
- Título do mapa ampliado de 24 para **44 px** no desktop.
- Mantidos os quatro nomes, ícones, imagem da cidade, marcador, seleção, confirmação de destino, estados atual/concluído, contadores e bloqueio das regiões já concluídas.
- A grade agora utiliza uma única versão dos cards responsivos. Não há duas cópias concorrentes dos controles para celular e desktop.

## Demais telas da jornada

As regras de escala são aplicadas apenas quando a aplicação está exibindo a jornada; a abertura mantém a composição aprovada.

| Elemento | Escala anterior | Nova escala no desktop |
| --- | --- | --- |
| Contêiner de cenário/revelação/consequências | Limite de 768 px | Limite de 1120 px |
| Resumo e desafio | Limite de 896 px | Limite de 1280 px |
| Alternativas e outros painéis largos | Limite de 1024 px | Limite de 1360 px |
| Texto `xs` | 12 px | 14 px |
| Texto `sm` | 14 px | 16 px |
| Texto `base` | 16 px | 18 px |
| Títulos `2xl` | 24 px | 32 px |
| Títulos `3xl` | 30 px | 40 px |
| Retratos menores da jornada | 40/56 px | 56/72 px |
| Molduras de ícones de 64 px | 64 px | 80 px |

- Cenários, diálogos, alternativas, fundamentos, revelações, desafios, consequências, descobertas, resumo, medalha e avaliação recebem a nova escala de texto e espaçamento conforme suas classes existentes.
- Parágrafos, listas e trechos narrados usam entrelinha de 1,65.
- Controles da área principal têm altura mínima de 52 px; os cards de alternativa ganham mais espaço interno.
- Grades de três alternativas são empilhadas abaixo de 1280 px. No celular, grades de três elementos também se tornam uma coluna, evitando o estreitamento de textos e retratos.
- As dimensões e a proporção das imagens são ajustadas somente por CSS. Nenhum arquivo de imagem foi gerado, editado ou substituído.
- Os retratos de até 192 px da abertura continuam preservados.

## Acessibilidade preservada

A escala básica da jornada continua sendo multiplicada pelos controles Padrão, Grande e Extra; não substitui a preferência escolhida.

- Cenário solo no desktop: **18 px em Padrão → 27 px em Extra**.
- Cenário solo em 390 px: **19,125 px em Padrão → 28,6875 px em Extra**.
- Títulos de região no desktop: **24 → 36 px**.
- Mapa, cenário, alternativas e resumo também foram verificados com Extra, alto contraste e movimento reduzido aplicados.
- Foco visível, estados selecionados, preferências persistentes e controles de áudio continuam integrados. Esta revisão não altera a implementação da narração.

## Verificação no navegador

Edge em **320, 390, 768 e 1440 px**:

1. Percurso real solo desde a abertura/lobby, com seleção das quatro regiões, quatro missões distintas, decisões, revelações, desafio verdadeiro/falso quando oferecido, consequências, cartas, eventuais desafios das cartas, retorno ao mapa e conclusão com medalha.
2. Conferência de cada tipo de tela nas quatro larguras; conteúdos adicionais das quatro missões também conferidos em 390 px.
3. Resumo, medalha e avaliação verificados no percurso real.
4. Mapa, cenário, alternativas e resumo novamente conferidos nas quatro larguras com Extra e alto contraste.
5. Cenário coletivo, revelação coletiva, votação coletiva e questionários pré/pós renderizados com os componentes reais e dados locais de teste, em Padrão e Extra, nas quatro larguras. Esta verificação é de apresentação; não equivale a uma partida multiplayer entre dispositivos.
6. Inspeção visual das capturas do mapa em desktop/celular, alternativas, resumo, votação coletiva e cenário ampliado.

Resultado: **sem transbordamento horizontal encontrado nas telas verificadas**. Rolagem vertical é intencional, especialmente em texto Extra e no resumo móvel. A largura ocupada pela barra de rolagem vertical foi considerada nas medições.

## Testes e integridade

- `npm test`: **8 testes passaram**, incluindo jornada completa, preservação das decisões, afinidade/restauração, API e persistência das preferências.
- `npm run lint`: TypeScript sem erros.
- `npm run build`: concluído; permanece o aviso de bundle JavaScript acima de 500 kB.
- Imagens, arquivos de personagens, dados de missões/regiões, motor, comunicação, salvamento e pontuação sem alterações nesta etapa.
- Scripts e página temporária de verificação removidos do repositório. Capturas ficaram somente na pasta temporária do sistema.

## Arquivos desta etapa

- `src/App.tsx`: identificação da tela ativa e largura da área da jornada.
- `src/components/board/TownMap.tsx`: escala do mapa e dos cards, grade responsiva única e apresentação dos textos completos.
- `src/index.css`: escala tipográfica da jornada, larguras de leitura, espaçamento, dimensões de exibição dos retratos e reflow das grades.
- `docs/revisao-escala-visual-20261022.md`: este relatório.

As demais alterações locais pendentes pertencem à revisão anterior e foram preservadas. Não houve commit, push, merge ou publicação na Vercel.
