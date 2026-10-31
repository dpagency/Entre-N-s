# Entre Nós — resumo executivo da distribuição institucional

Foi preparada uma edição estática do jogo individual, como modalidade do mesmo projeto. Ela reutiliza o aplicativo, as quatro missões, os quatro avatares, os quatro Guardiões e a dinâmica educativa existente. Não há uma segunda aplicação para manter.

O pacote conserva canais institucionais, cartas, pontuação, acessibilidade, narração, salvamento, avaliação e medalha. Exclui APIs antigas, painel administrativo, banco central e arquivos de servidor. A fonte e as imagens são carregadas do próprio pacote, preservando a identidade visual.

**Infraestrutura mínima:** um servidor web estático institucional, preferencialmente com HTTPS, e navegadores modernos com JavaScript e armazenamento local. Não é necessário instalar banco de dados, Node.js ou servidor de aplicação para disponibilizar o jogo. A publicação pode ser feita na raiz de um endereço ou em subpasta.

As partidas ficam no navegador do participante. Não há envio automático de decisões ou pontuações às APIs antigas. A mudança de endereço não transfere automaticamente os salvamentos. Computadores compartilhados exigem orientação sobre perfis e limpeza dos dados.

Foram verificadas duas jornadas completas em servidor estático, na raiz e em subpasta, com acertos e erros, quatro missões, cartas, retomada, reinício e encerramento. Houve verificações de responsividade em quatro larguras, teclado, imagens e ausência de chamadas às APIs antigas. A suíte automatizada possui 23 testes. Os detalhes e resultados efetivos constam do relatório técnico.

**A TI ainda precisa homologar:** endereço e HTTPS, cabeçalhos de segurança, políticas de logs, isolamento do armazenamento, atualização e rollback, permissões de impressão/download e funcionamento nos dispositivos reais. A narração usa o serviço de voz do navegador ou sistema, que pode depender de internet; requer teste e escuta nos equipamentos institucionais. Esta entrega não é uma versão totalmente offline.

O ZIP acompanha inventário e hash de integridade. A recomendação é publicar somente sua pasta `site/`, após homologação técnica e autorização institucional. As pendências editoriais e normativas anteriores permanecem separadas desta preparação técnica.

Não houve commit, push, merge ou publicação nesta etapa.
