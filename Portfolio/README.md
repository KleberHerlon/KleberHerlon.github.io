# 👤 Portfolio — Site Pessoal Responsivo

Site pessoal de apresentação — perfil, competências e contato — com layout **responsivo** para desktop, tablet e mobile.

![HTML](https://img.shields.io/badge/HTML-5-E34F26?style=flat-square&logo=html5&logoColor=white)
![CSS](https://img.shields.io/badge/CSS-3-1572B6?style=flat-square&logo=css3&logoColor=white)
![Responsivo](https://img.shields.io/badge/Responsivo-Todas%20as%20telas-4F5D95?style=flat-square)

---

## 📌 Visão Geral do Problema de Negócio

Um profissional precisa de uma **presença digital que traduza sua identidade** em poucos segundos: quem sou, o que faço e como contatar. Esta página resolve isso com um **perfil direto**, hierarquia visual clara e adaptação total a qualquer tela.

## 🛠️ Arquitetura & Tech Stack Utilizada

```
index.html ──▶ css/ (estilos) + Img/ (assets)
```

| Camada | Papel |
|---|---|
| `index.html` | Estrutura semântica (perfil, sobre, competências, contato) |
| `css/` | Folhas de estilo responsivas (breakpoints por device) |
| `Img/` | Assets/imagens do site |

- Zero frameworks — performance máxima e portabilidade;
- Design system simples baseado em variáveis e media queries.

## 📊 Modelagem de Dados & Pipelines

*Aplicação de apresentação — sem pipeline de dados. Padrões de qualidade aplicados:*

- **HTML semântico** para SEO e acessibilidade (headings hierárquicos, links claros);
- **Mobile-first**: `media queries` garantem usabilidade em qualquer viewport;
- **Pronto para SEO**: `meta` tags e conteúdo textual indexável.

## 📈 Principais Insights / Resultados Gerados

- **Carregamento instantâneo** (estático, sem dependências);
- **Presença profissional única** — base visual reaproveitada no atual portfólio GitHub Pages;
- **Portabilidade**: qualquer hospedagem estática serve o site.

## 🚀 Como Executar o Projeto Localmente

```bash
# abrir diretamente no navegador
start index.html

# ou servir a pasta
python -m http.server 8000 --directory .
# → http://localhost:8000
```

---

## 📁 Estrutura

```
Portfolio/
├── index.html      # Página principal
├── css/            # Estilos (layout + responsividade)
└── Img/            # Imagens/assets
```