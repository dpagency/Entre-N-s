# Perspectivas dos personagens — correção de apresentação

Data: 29/10/2026. Trabalho local; sem commit, push, merge ou deploy.

## Problema e correção

A apresentação individual em `MissionSituation` escondia todas as perspectivas inicialmente e usava o rótulo “Ouvir” para revelar somente o resumo. As falas completas (`details`) já existiam no banco, mas não apareciam nessa apresentação.

O novo componente `MissionPerspectives` mostra o resumo e a fala integral de cada personagem, sem editar os conteúdos originais. Nomes, funções e representações visuais existentes foram preservados.

- A partir de 768 px, todas as perspectivas ficam visíveis, em cartões empilhados, com altura natural e sem botão de revelação.
- Abaixo de 768 px, a primeira perspectiva começa aberta. Cada perspectiva pode ser aberta ou fechada independentemente, pelos botões “Ver perspectiva” e “Ocultar perspectiva”. Abrir outra não fecha a anterior.
- Os botões possuem nomes acessíveis com o nome do personagem, `aria-expanded`, `aria-controls` e foco visível. Cada painel é uma região nomeada pelo personagem. Painéis fechados no celular usam `display: none`, ficando fora da árvore de acessibilidade.
- Ao trocar a missão ou recarregar a página, o celular volta ao padrão de primeira perspectiva aberta. No computador, todas continuam visíveis, inclusive depois de redimensionar a janela a partir do celular.
- As perspectivas estão disponíveis na situação, antes da decisão. Abrir ou fechar texto não envia mensagens ao motor, não concede pontos e não depende da alternativa escolhida.

## Narração

Os controles existentes de ouvir, pausar, continuar, parar e velocidade foram mantidos. Ler ou expandir uma perspectiva não inicia áudio.

Os resumos e as falas integrais mantêm a marcação `data-narration="story"`. Como os painéis agora ficam montados para possibilitar a apresentação responsiva, a seleção de trechos para narração foi ajustada para considerar somente elementos visíveis. Isso impede narrar uma perspectiva fechada no celular. No computador ou com as três perspectivas abertas no celular, todas as falas visíveis entram na narração.

## Validação

- TypeScript aprovado: `node node_modules/typescript/bin/tsc --noEmit`.
- 29 testes de regressão aprovados: `node --import tsx --test tests/*.test.ts`.
- Builds normal e institucional aprovados. O build normal mantém o aviso de JavaScript acima de 500 kB; o institucional tem aproximadamente 441 kB.
- Duas jornadas completas no navegador, na raiz e em `/entre-nos/`, cobrem as quatro missões do piloto. As duas missões adicionais do catálogo foram verificadas por snapshots restaurados somente para a apresentação, sem alterar a seleção de missões do jogo.
- As seis missões do catálogo, com 18 perspectivas originais, foram conferidas. Os testes comparam cada resumo e fala integral ao banco original, além de nomes, funções e representações visuais.
- Verificadas apresentação inicial no computador e celular, expansão independente, fechamento individual, nomes e vínculos acessíveis, Enter, Tab, manutenção do foco no botão e conteúdo aberto/fechado na árvore de acessibilidade do navegador.
- Verificadas leitura sem disparo de áudio, narração das falas visíveis, exclusão de fala fechada da narração, recarga e retomada da situação e redimensionamento de celular para computador.
- Fonte Extra, alto contraste e redução de movimento exercitados. As capturas completas do estado inicial e do estado expandido foram inspecionadas visualmente em 390 e 1440 px.
- 148 verificações de layout em 320, 390, 768 e 1440 px, sem rolagem horizontal, incluindo todas as seis missões, fonte ampliada e painéis expandidos. Resultados em `artifacts/institutional/verification/resultados.json`.
- Decisões, cartas e seus registros comparados antes/depois de consultar perspectivas e retomar. Pontuações finais das jornadas mantidas em 100/100 e 20/95; a segunda preserva uma resposta histórica sem bônus retroativo.
- Descoberta progressiva dos Guardiões, Carta dos Caminhos, Segunda Chance, Revés, Sorte legada, consulta aos Canais sem pontos, medalha, composição/PNG e avaliação/PDF continuam aprovados pelo teste completo.
- Nenhuma tentativa de API antiga, conexão HTTP externa, erro de execução ou recurso quebrado nas jornadas verificadas. `git diff --check` aprovado.

Evidências: `artifacts/institutional/verification/resultados.json`, capturas `*-perspectivas-iniciais-*` e `*-perspectivas-missao-1-*`, PDFs e `zip-check.json`. As duas jornadas também verificam a persistência de preferências e dos registros pedagógicos existentes.

Acessibilidade foi verificada pela semântica, teclado e árvore de acessibilidade do navegador; não houve certificação com leitor de tela. Celulares foram emulados. Os testes de áudio verificam controles e textos com instrumentação, sem certificar pronúncia ou qualidade sonora. As vozes do navegador/sistema podem usar serviço remoto.

## Pacote e publicação manual

Novo ZIP: `artifacts/institutional/Entre-Nos-Institucional.zip`, 8.328.435 bytes.

SHA-256: `26b7c9053b6c4e00fde1ae9b0b921e13df786c8c27ba39a8cb2c233dbaf3b3bf`.

Inventário: `artifacts/institutional/inventario.json`. O website tem 23 arquivos, com 8.314.520 bytes. O ZIP inclui também o inventário e as instruções de hospedagem.

Extração independente por `Expand-Archive` em `artifacts/institutional/conferencia-perspectivas-20261029/`. A entrega manual é `artifacts/institutional/publicacao-concurso-2026/site`, com `index.html` diretamente na raiz. A conferência de quantidade, tamanho e SHA-256 e o resultado final da atualização estão em `artifacts/institutional/verification/zip-check.json`.

Pacote anterior, inventário, hash e evidências preservados em `artifacts/institutional/rollback-antes-perspectivas-20261029/`. SHA-256 anterior: `53230bd46632bb8cc6816e1d8440393de6523da1e5db0a45f51d2d008f150546`. Os demais pacotes históricos foram mantidos. As imagens da entrega foram comparadas por SHA-256 ao inventário anterior e permanecem idênticas.

Não houve alteração no banco de missões, nas falas, personagens, decisões, motor, pontuação, Guardiões, cartas, medalha ou avaliação final. As alterações de código desta etapa limitam-se a `MissionPerspectives.tsx`, sua integração em `MissionSituation.tsx` e o filtro de visibilidade de narração em `JourneyAudio.tsx`; o script de testes foi ampliado. Alterações locais anteriores foram preservadas.

A atualização do projeto `entre-nos-piloto-concurso-2026` no Vercel será manual, após conferência. Nenhuma ação foi executada no projeto hospedado.
