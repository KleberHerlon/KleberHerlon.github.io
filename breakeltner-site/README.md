# 🚀 BreaKeltner — Landing Page & Checkout de Alta Conversão

Página de vendas profissional para o sistema **BreaKeltner v3.0** (Keltner Breakout System para o mini-índice **WIN**), com hero, benefícios, prova social e **checkout integrado** — construída em HTML/CSS/JS puro.

![HTML](https://img.shields.io/badge/HTML-5-E34F26?style=flat-square&logo=html5&logoColor=white)
![CSS](https://img.shields.io/badge/CSS-3-1572B6?style=flat-square&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6%2B-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![Responsivo](https://img.shields.io/badge/Responsivo-Desktop%20%7C%20Tablet%20%7C%20Mobile-4F5D95?style=flat-square)

---

## 📌 Visão Geral do Problema de Negócio

Lançar um produto digital (robô/curso de trading) exige uma página que **converte visitantes em compradores** — mensagem clara em segundos, estrutura de CTA e checkout confiável. O site foi desenhado com foco em conversão: escaneabilidade, propostas de valor em destaque e jornada contínua até o pagamento.

## 🛠️ Arquitetura & Tech Stack Utilizada

```
index.html (landing) ── CTA ──▶ checkout.html
```

| Página | Papel |
|---|---|
| `index.html` | Hero, diferencial do sistema, benefícios, seções de venda |
| `checkout.html` | Etapa final de conversão (oferta + pagamento) |

- **HTML/CSS/JS puros** — zero dependências, carregamento rápido e auditável;
- Tema escuro profissional (`#0A0E14`) com scrollbar e estados estilizados;
- Layout responsivo para desktop, tablet e mobile.

## 📊 Modelagem de Dados & Pipelines

*Aplicação de marketing — sem pipeline de dados. O foco está em conversão e experiência de usuário:*

- **CTA strategy**: chamadas à ação em pontos estratégicos da rolagem;
- **Progressão lógica**: dor → solução → prova → ação (checkout);
- **Copy orientada a benefício**: altíssimo escaneamento no primeiro dobra (hero).

## 📈 Principais Insights / Resultados Gerados

- **Estrutura de venda reutilizável** para qualquer produto digital (template canônico de landing + checkout);
- **Tempo de carga mínimo** (sem frameworks), reduzindo abandono por performance;
- **Foco em conversão**: caminho do visitante controlado do hero até o pagamento sem atrito.

## 🚀 Como Executar o Projeto Localmente

```bash
# basta abrir o index.html no navegador
start index.html

# ou servir a pasta estaticamente
python -m http.server 8000 --directory .
# → http://localhost:8000
```

---

## 📁 Estrutura

```
breakeltner-site/
├── index.html      # Landing page (hero, benefícios, prova social)
├── checkout.html   # Etapa de checkout/conversão
└── deploy.txt      # Notas de deploy
```