# Perspectivas resumidas — ajuste pontual

Data: 29/10/2026. Sem commit, push, merge ou deploy.

## Ajuste

Removida somente a renderização de `perspective.details` em `MissionPerspectives.tsx`. Cada cartão conserva a representação visual, nome, função e resumo original (`summary`). As falas completas continuam no banco narrativo, sem exclusão ou alteração.

Mantido o comportamento responsivo: a partir de 768 px, os três resumos ficam visíveis; no celular, a primeira perspectiva começa aberta e as demais podem ser expandidas independentemente. Mantidos rótulos, vínculos acessíveis, foco, navegação por teclado e comportamento após recarga.

Nenhuma alteração no código de narração: ele continua lendo somente os trechos visíveis marcados como narrativa. Como a fala integral não é renderizada nesta etapa, não aparece na interface, na árvore de acessibilidade nem na seleção de texto para narração. Resumos fechados no celular também não são narrados.

## Validação

O script de navegador foi atualizado para exigir somente o resumo original, rejeitar presença das falas completas no cartão e na árvore de acessibilidade e verificar que a narração contém os resumos visíveis, sem falas integrais.

O teste percorre as quatro missões do piloto em duas jornadas completas, na raiz e em `/entre-nos/`, e apresenta as duas missões adicionais do catálogo por snapshots de teste. Confere computador, celular, expansão independente, Enter/Tab, árvore de acessibilidade, fonte Extra, alto contraste, redução de movimento, recarga e retomada. Os resultados finais ficam em `artifacts/institutional/verification/resultados.json`.

TypeScript, build institucional e 29 testes de regressão aprovados. Verificação de espaços em branco aprovada. Capturas completas do estado inicial e expandido disponíveis na pasta de evidências.

Resultado final do navegador: duas jornadas completas aprovadas, seis missões conferidas, 148 verificações de layout aprovadas e nenhuma tentativa de API antiga, conexão HTTP externa, erro de execução ou recurso quebrado. Capturas de computador e celular inspecionadas visualmente.

Os arquivos de narrativas e áudio mantiveram os mesmos SHA-256 ao longo desta etapa:

- `src/data/missions.ts`: `6b58b6ec9800016e24d85683eac5ef272497535c9c8666140316e2b0f4e9c0d8`.
- `src/components/ui/JourneyAudio.tsx`: `e7278c2b099289e2e7f6a24d5d9629a09fa19aaae9a113d09159a1b6a872fd9b`.

Decisões, Guardiões, cartas, pontuação, medalha e avaliação não foram modificados. O teste completo continua verificando suas integrações e a ausência de chamadas a APIs antigas e recursos externos.

Celulares foram emulados. Acessibilidade foi verificada por teclado e árvore do navegador, sem certificação com leitor de tela. O áudio foi validado pelos controles e pelo texto encaminhado à síntese; qualidade de pronúncia depende de escuta humana.

## Pacote e retorno

O pacote, inventário e evidências anteriores foram preservados em `artifacts/institutional/rollback-antes-resumos-20261029/`. SHA-256 do ZIP anterior: `26b7c9053b6c4e00fde1ae9b0b921e13df786c8c27ba39a8cb2c233dbaf3b3bf`.

Pacote atual: `artifacts/institutional/Entre-Nos-Institucional.zip`. Inventário: `artifacts/institutional/inventario.json`. Pasta manual: `artifacts/institutional/publicacao-concurso-2026/site`.

ZIP: 8.328.352 bytes; SHA-256 `86a5b54c8936194a4a462c0abd1440b7c0805cd84fdde66c746d22913ff483fc`. A pasta manual foi atualizada e seus 23 arquivos (8.314.437 bytes) conferem com o ZIP e o inventário por quantidade, tamanho e SHA-256. `index.html` confirmado diretamente na raiz. Extração independente conferida em `artifacts/institutional/conferencia-resumos-20261029/`; imagens originais idênticas às anteriores.

O resultado da conferência entre ZIP, inventário e pasta manual, com quantidade, bytes, SHA-256 e presença de `index.html` na raiz, fica em `artifacts/institutional/verification/zip-check.json`. A atualização do projeto hospedado será manual; nenhuma ação foi executada no Vercel.
