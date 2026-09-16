# Launch Line — Site

Site institucional em HTML/CSS/JS puro (sem build step), com um símbolo 3D
metálico em Three.js, animação de introdução cinematográfica, uma linha
contínua em SVG que acompanha o scroll, e revelações de seção com GSAP +
ScrollTrigger.

## Rodar localmente

```bash
python -m http.server 5173
```

Depois abra `http://localhost:5173`.

Não há passo de build: é HTML estático + três arquivos JS carregados via
`<script>` e três bibliotecas via CDN (Three.js, GSAP, ScrollTrigger).

## Estrutura

- `index.html` — marcação e conteúdo de todas as seções.
- `css/style.css` — design system (cores, tipografia, layout, responsivo).
- `js/scene.js` — cena 3D persistente (símbolo metálico + partículas).
- `js/intro.js` — sequência de abertura (a linha desenha o símbolo).
- `js/main.js` — linha de scroll, revelações, método, conexão, formulário.

## Pendências para o time da Launch Line

Estes pontos foram deixados como placeholder de propósito, porque a
instrução do projeto foi explícita em não inventar dados:

1. **Cases** (`#cases`): hoje mostram "em breve". Quando houver projetos
   reais, substituir o conteúdo de `.case-card` por desafio/solução/
   implementação/resultado reais, com imagens e métricas.
2. **Formulário de contato** (`#contato`): hoje só mostra uma confirmação
   client-side ao enviar. É preciso ligar o `<form id="contact-form">` a um
   backend real (e-mail, CRM, Zapier/Make, etc.) ou a um número de WhatsApp
   Business real, já que nenhum contato foi fornecido para uso no site.
3. **Analytics/SEO**: adicionar tags de analytics e Open Graph quando o
   domínio final estiver definido.

## Notas técnicas

- O símbolo (anel aberto + duas letras "L") é desenhado por código (SVG e
  Three.js), a partir da mesma geometria, para não distorcer a marca.
- A introdução roda uma vez por sessão do navegador (`sessionStorage`) para
  não prejudicar visitas repetidas.
- Partículas e efeitos são reduzidos automaticamente em telas ≤768px.
