# Proposta LP Home

Landing page da proposta comercial do novo e-commerce da LP Home (WordPress, Elementor e WooCommerce).

Site estático: HTML, CSS e JavaScript puros, sem build.

## Publicar na Vercel

1. Suba esta pasta para um repositório no GitHub.
2. Na Vercel: **Add New > Project**, importe o repositório.
3. Framework Preset: **Other**. Build Command e Output Directory ficam vazios.
4. Deploy.

## Onde editar

- Textos e valores: `index.html`. O investimento fica na seção `#investimento`, no fim da página.
- WhatsApp dos botões "Aceitar proposta": links `https://wa.me/5511975713735?...` em `index.html`.
- Cores e fontes: `css/tokens.css`, gerado do design system LP Home (`design-system/project/tokens.json`).
- Componentes da loja (cards, selos, cabeçalho): `css/lp-home-ds.css`.
- Estilos da proposta: `css/proposta.css`. Navegação, vídeo, demos e efeitos: `js/main.js`. Roteiros do chat do agente: `js/agent-demo.js`.
- Datas do prazo (dias úteis e feriados nacionais): `js/prazo.js`. Teste: `node tests/prazo.test.mjs`.
- Vídeo do topo: `media/` (Pexels, vídeo 19228305 de Curtis Adams, licença Pexels: uso livre, sem atribuição obrigatória).
- Efeitos: GSAP 3.15.0 (ScrollTrigger, SplitText, DrawSVG) e Lenis 1.3.27 via CDN.

A página tem `noindex` para a proposta não aparecer no Google.
