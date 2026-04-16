# DRILL SERGEANT — Guia de Operações

## O que é
PWA (site instalável como app) que ensina inglês com um personagem de sargento debochado usando a API do Claude.

## Arquivos
- `index.html` — interface
- `app.js` — lógica, missões, chamada API
- `manifest.json` — torna instalável
- `sw.js` — service worker (funciona offline)
- `icon-192.png`, `icon-512.png` — ícones do app

## Como colocar no ar (grátis)

### Opção 1: Vercel (mais fácil, 2 min)
1. Crie conta em https://vercel.com
2. Instale o CLI: `npm i -g vercel`
3. Dentro da pasta: `vercel`
4. Pronto — vai te dar uma URL tipo `drill-sergeant.vercel.app`

### Opção 2: Netlify (drag & drop)
1. Entre em https://app.netlify.com/drop
2. Arraste a pasta inteira pra janela
3. Pronto, vai gerar URL

### Opção 3: GitHub Pages
1. Crie repo no GitHub, suba os arquivos
2. Settings → Pages → Source: main branch
3. URL vai ser `seuuser.github.io/nome-do-repo`

**IMPORTANTE:** PWA só funciona em HTTPS. Todas essas três opções já vêm com HTTPS.

## Como instalar no celular

### Android (Chrome)
1. Abra a URL no Chrome
2. Vai aparecer banner amarelo "INSTALAR" — clique
3. OU: menu (⋮) → "Adicionar à tela inicial" / "Instalar app"

### iPhone (Safari)
1. Abra a URL no Safari
2. Botão compartilhar (quadradinho com seta)
3. "Adicionar à Tela de Início"

## Primeira vez
1. O app vai pedir sua chave da API do Claude
2. Pegue em https://console.anthropic.com/settings/keys
3. Cole no campo — fica salva SÓ no seu celular (localStorage)
4. Precisa ter crédito na conta Anthropic (cada missão custa ~US$ 0,003)

## Customizações fáceis

**Trocar personalidade do sargento:** edite a função `buildSystemPrompt` em `app.js`.

**Adicionar mais missões:** adicione objetos ao array `MISSIONS` em `app.js`.

**Mudar cores:** edite as CSS variables no `:root` do `index.html`.

**Mudar modelo:** em `app.js`, troque `claude-sonnet-4-6` por `claude-opus-4-6` (mais inteligente, mais caro) ou `claude-haiku-4-5` (mais barato, mais rápido).
