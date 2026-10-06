# 🤖 Robot Dashboard — Monitoramento em Tempo Real de Robôs de Trading

Dashboard web que consolida em **tempo real** a performance dos robôs de day trade (contratos WIN/WDO da B3), com atualização automática a cada 5 segundos — sem recarregar a página.

![Stack](https://img.shields.io/badge/Stack-JavaScript%20%7C%20HTML%20%7C%20CSS-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![Dados](https://img.shields.io/badge/Fonte%20de%20Dados-JSON-4F5D95?style=flat-square)

---

## 📌 Visão Geral do Problema de Negócio

Robôs de trading operam o dia inteiro e o trader precisa **tomar decisão em segundos**: qual robô está operando bem hoje, quando ele entra em drawdown, quais os custos acumulados (corretagem/emolumentos). Um painel obsoleto ou manual gera **atraso na intervenção** e, consequentemente, perda financeira.

O dashboard resolve isso com um **ciclo de atualização de 5 segundos** e agregação de KPIs por robô e por dia histórico.

## 🛠️ Arquitetura & Tech Stack Utilizada

```
┌─────────────┐     HTTP (fetch)     ┌──────────────────┐
│  data.json   │ ──────────────────▶ │  index.html      │
│ (fonte)      │        GET          │  (SPA em Vanilla)│
└─────────────┘   cache-busting ?ts  └──────────────────┘
```

- **Frontend:** JavaScript puro (ES6+, sem frameworks — renderização via DOM API);
- **Dados:** arquivo `data.json` servido estaticamente, com `cache-busting` (`?ts`) para sempre exibir dados frescos;
- **UI:** tema escuro inspirado em terminal, legível para monitoramento contínuo.

## 📊 Modelagem de Dados & Pipelines

**Pipeline (ETL) — Extract, Transform, Load:**

1. **Extract** — o sistema de origem (broker/EA) grava o resultado de cada operação no `data.json`;
2. **Transform** — o `index.html` agrega os campos por robô (`mg` = magic number) e por dia:

| Campo | Descrição |
|---|---|
| `mg` | Identificador do robô (magic number) |
| `entries` | Nº de operações |
| `gp` | Lucro bruto (gross profit) |
| `gl` | Prejuízo bruto (gross loss) |
| `c` | Custos (corretagem + emolumentos) |
| `ts` | Timestamp da última atualização |

3. **Load** — renderização na tabela principal (robôs do dia) e na tabela de **histórico por dia** com janela configurável (1–30 dias).

**Métricas calculadas:** lucro/prejuízo líquido (`gp - gl`), resultado líquido final (`liq - custos`) e **totais agregados** com separador visual (linha `TOTAL`).

## 📈 Principais Insights / Resultados Gerados

- **Visão de intervenção instantânea**: identificação imediata de robô em drawdown, permitindo stop manual antes da perda crescer;
- **Comparação diária**: janela de histórico (1/2/3/5/7/15/30 dias) mostra tendência de degradação ou consistência por robô;
- **Custo real da operação**: linha "custos" deixa visível a diferença entre resultado bruto e líquido — ponto-chave para robôs que operam alto volume;
- **Monitor sem interação**: atualização automática a cada 5s mantém a visão correta sem F5 manual.

## 🚀 Como Executar o Projeto Localmente

Basta servir a pasta estática — qualquer servidor simples funciona:

```bash
# opção 1 — Python
python -m http.server 8000 --directory .

# opção 2 — Node/npx
npx serve .
```

Abra **http://localhost:8000** no navegador.

> Para dados reais, substitua o conteúdo de `data.json` pelo payload gerado pelo seu sistema de origem — o schema JSON está documentado na tabela acima.

---

## 📁 Estrutura

```
dash_online/
├── index.html      # Dashboard (HTML + CSS + JS embutido)
├── data.json       # Dados dos robôs (fonte para a visualização)
└── .nojekyll       # Impede parse Jekyll no GitHub Pages
```