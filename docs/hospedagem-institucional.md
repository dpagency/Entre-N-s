# Entre Nós — instruções de hospedagem estática institucional

## O que publicar

Extraia `Entre-Nos-Institucional.zip`. Publique **somente o conteúdo de `site/`** no diretório web escolhido. O ZIP contém também `inventario.json` e estas instruções para conferência, fora da pasta do site.

O site utiliza o mesmo aplicativo, motor e conteúdos do projeto. Não requer banco de dados, login, autenticação institucional, funções da Vercel, Node.js ou servidor de aplicação. Os identificadores de sessão mantidos no navegador servem apenas à retomada local.

Não publique o repositório, `api/`, `server.ts`, `.env`, `node_modules` ou configurações de desenvolvimento. Se o endereço já hospedava APIs antigas, desative-as na infraestrutura: copiar este site não remove handlers previamente instalados.

## Raiz e subpasta

O mesmo pacote aceita, por exemplo:

- `https://jogo.instituicao.gov.br/`
- `https://portal.instituicao.gov.br/entre-nos/`

Mantenha a estrutura `assets/`, `personagens/` e `licencas/` junto a `index.html`. Configure `index.html` como documento padrão e redirecione `/entre-nos` para `/entre-nos/` quando necessário. O endereço da pasta precisa da barra final para resolver corretamente os recursos relativos. Não são necessárias rotas de backend ou regras de SPA que encaminhem `/api/*` para o HTML.

## Requisitos mínimos

- Servidor web estático, com leitura dos arquivos publicados e HTTPS recomendado.
- Tipos MIME: `.html` → `text/html`; `.js` → `text/javascript`; `.css` → `text/css`; `.png` → `image/png`; `.webp` → `image/webp`; `.ttf` → `font/ttf`.
- Navegador moderno com JavaScript, Canvas, Web Crypto e armazenamento local habilitado para retomada persistente.
- Síntese de voz do navegador/sistema para a narração. Voz em português, pronúncia e eventual uso de serviço remoto precisam de homologação nos equipamentos institucionais.
- Permissão para janela de impressão e downloads quando forem utilizados PDF e composição final.

Não há certificação de requisitos mínimos de CPU/RAM nesta entrega. Espaço e transferência são informados no inventário. Use o pacote inteiro e reserve margem para atualizações e rollback.

## Dados e conexões

O jogo individual processa decisões e pontuação no navegador. Salva apelido, avatar, progresso, respostas, preferências e históricos de rodízio em `localStorage`. Não envia esses registros às APIs antigas. Sem armazenamento disponível, funciona em memória e exibe aviso de possível perda ao fechar a página.

A fonte Nunito está incluída localmente com sua licença. Não é necessário carregar Google Fonts. As imagens também são locais e mantêm seus arquivos originais.

A narração usa `speechSynthesis`: o navegador ou sistema pode utilizar voz remota. Compartilhamento, área de transferência e e-mail são opcionais e dependem de ação do usuário. O e-mail abre o cliente configurado; o PDF deve ser anexado manualmente. A hospedagem e os proxies podem registrar acessos aos arquivos, conforme sua configuração.

Esta distribuição não é uma versão instalável/offline. Não depende da Vercel, mas exige acesso ao servidor estático para carregar o site. Não se recomenda abrir `index.html` por duplo clique (`file://`).

## Salvamento, atualização e computadores compartilhados

- A origem do site (protocolo, domínio e porta) determina o armazenamento do navegador. Migrar o endereço não transfere automaticamente partidas de outra origem.
- Aplicações no mesmo domínio/origem compartilham o espaço de armazenamento. Um subdomínio dedicado facilita o isolamento; uma subpasta, sozinha, não cria essa separação.
- A dinâmica atual do piloto é retomável nesta edição. Partidas da dinâmica anterior não são convertidas ou apagadas automaticamente; o aplicativo informa que devem ser retomadas na edição original ou substituídas por nova partida mediante confirmação.
- Em computadores compartilhados, orientar uso de perfil adequado e limpeza dos dados quando necessário. O apelido não exige nome real. Não inserir dados pessoais ou relatos identificáveis na avaliação.
- Ao atualizar, publicar os arquivos de forma coordenada, conservar rollback e evitar caches antigos de `index.html`. Os assets compilados possuem nomes com hash. As imagens preservam nomes estáveis, portanto a política de cache também deve considerar futuras alterações desses arquivos.

## Segurança e homologação da TI

Conferir TLS, permissões, logs e retenção, política de atualização, isolamento de origem e ausência de handlers `/api/*`. Recomenda-se `X-Content-Type-Options: nosniff`; CSP, enquadramento no portal e demais cabeçalhos devem ser definidos e testados pela TI, considerando estilos inline e janela de impressão existentes.

O arquivo `.sha256` acompanha o ZIP para verificação de integridade. O inventário relaciona o tamanho e SHA-256 de cada arquivo do site. Isso não equivale a assinatura digital ou certificação de segurança.

Pontuação e progresso locais podem ser alterados por quem controla o navegador. O jogo é educativo, não uma plataforma de provas ou emissão de comprovação inviolável de capacitação.

## Preparação e verificação pelos mantenedores

Na máquina de desenvolvimento, com as dependências do projeto já disponíveis:

```text
npm run build:institutional
npm run verify:institutional
npm run package:institutional
npm test
npm run lint
npm run test:institutional:browser
```

O ZIP e seu inventário são gerados em `artifacts/institutional/`. A compilação usa `dist-institucional/`, separada de `dist/`. A validação de navegador usa um servidor de arquivos temporário ligado somente a `127.0.0.1`; ele é uma ferramenta de teste e não integra o pacote.

As ferramentas de build/teste requerem Node.js e dependências de desenvolvimento. Nada disso precisa ser instalado no servidor web ou no computador dos participantes. A suíte de navegador requer Edge ou Chromium instalado; seu caminho pode ser informado pela variável `ENTRE_NOS_BROWSER`.

Antes de divulgar, TI e responsáveis pedagógicos devem revisar o relatório técnico, testar o endereço real e homologar a narração e os conteúdos. Nenhum deploy acompanha a geração do pacote.
