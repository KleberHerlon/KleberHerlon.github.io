# 📉 PerformanceRoboMetatrader — Análise de Performance de Robôs MT5

Motor em **Python** que lê relatórios da plataforma **MetaTrader 5** (HTML), extrai todas as operações e calcula **+20 KPIs de trading** — de win rate a Sharpe ratio — por robô (Expert Advisor) e de forma consolidada. Tudo exposto via **API REST (Flask)** e painel web.

![Python](https://img.shields.io/badge/Python-3.10%2B-3776AB?style=flat-square&logo=python&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-API%20REST-000000?style=flat-square&logo=flask&logoColor=white)
![BeautifulSoup](https://img.shields.io/badge/BeautifulSoup-HTML%20Parsing-59666C?style=flat-square)
![Pandas](https://img.shields.io/badge/Pandas-Agrega%C3%A7%C3%B5es-150458?style=flat-square&logo=pandas&logoColor=white)

---

## 📌 Visão Geral do Problema de Negócio

O Metatrader exporta relatórios de backtest/forecast em HTML com dezenas de tabelas — **impossível ler a performance real de cabeça**. O desafio: extrair de forma robusta as tabelas de transações (que variam o layout conforme idioma e versão da plataforma), calcular métricas de risco/retorno confiáveis e comparar robôs em uma mesma base.

## 🛠️ Arquitetura & Tech Stack Utilizada

```
reports/*.html ──▶ mt5_parser.py ──▶ trades (dicts)
                                         │
                                         ▼
API /api/analyze ── Flask ──▶ kpi_engine.py ──▶ +20 KPIs
                                        ▲
                           analysis_by_robot (por EA)
```

| Módulo | Responsabilidade |
|---|---|
| `mt5_parser.py` | Detecção automática de cabeçalhos, mapeamento de colunas e parse de datas (multi-encoding/layout) |
| `kpi_engine.py` | Motor de cálculo dos KPIs e séries temporais |
| `app.py` | API REST + renderização do painel |
| `reports/` | Relatórios MT5 de entrada |
| `templates/`, `static/` | Painel web |

## 📊 Modelagem de Dados & Pipelines

**Extract** — para cada arquivo em `reports/*.html`:

1. Auto-deteção de **encoding** entre `utf-8-sig`, `utf-16`, `cp1252`, `latin-1`;
2. Parse via BeautifulSoup e identificação da seção **"Transações"** (o cabeçalho real fica 1–5 linhas abaixo do título);
3. **Mapeamento dinâmico de colunas** por sinonímia (ex.: `lucro`, `profit`, `p&l` → `profit`) — robusto a PT/EN e variações.

**Transform** — cada trade é padronizado em dicionário `{ticket, open_time, type, size, symbol, open_price, commission, swap, profit, comment}`. Depósitos/ajustes (sem `profit`) são excluídos da análise.

**Load / Agregação** — o `KPIEngine` gera as camadas:

- **Summary KPIs**: total trades, win rate, gross profit/loss, profit factor, payoff ratio, expectância matemática, desvio padrão, **Sharpe simplificado**, max drawdown, recovery factor, maiores sequências de win/loss;
- **Séries temporais**: agregados por dia/mês/ano, distribuição horária, distribuição por dia da semana, curva de equity, retornos mensais (heatmap) e profit factor por período;
- **Consolidação**: visão geral (todos os robôs) + visão individual por Expert Advisor.

> **Boa prática aplicada:** cálculos financeiros isolados em funções puras (`_summary_kpis`, `_drawdown_analysis`, `_streak_analysis`), facilitando testes unitários e reuso.

## 📈 Principais Insights / Resultados Gerados

- **Risco/retorno de um relance**: profit factor (< 1 = perdedor), expectância (R$ por operação) e Sharpe avaliam consistência, não apenas lucro total;
- **Qualidade da estratégia**: payoff ratio + win rate revelam se o robô ganha em amplitude ou em frequência;
- **Ciclos de ruína**: drawdown máximo e sequências de loss indicam o pior cenário passado — base para dimensionamento de capital;
- **Janelas de maior eficiência**: distribuição horária e por dia da semana mostram *quando* cada robô opera melhor.

## 🚀 Como Executar o Projeto Localmente

```bash
# 1. instalar dependências
pip install flask beautifulsoup4

# 2. colocar os relatórios MT5 (HTML) em reports/
#    mt5_report_analyzer/reports/*.html

# 3. subir o servidor
python mt5_report_analyzer/app.py
# → http://localhost:5000
```

**Endpoints:**
- `GET /api/files` — lista relatórios encontrados;
- `POST /api/analyze` — processa todos e retorna a análise completa (JSON).

---

## 📁 Estrutura

```
PerformanceRoboMetatrader/
├── README.md
├── index.html                  # Visão geral do projeto (site)
└── mt5_report_analyzer/
    ├── app.py                  # API REST (Flask)
    ├── kpi_engine.py           # Motor de cálculos (+20 KPIs)
    ├── mt5_parser.py           # Parsing dos relatórios HTML
    ├── reports/                # Relatórios MT5 de entrada
    ├── templates/index.html    # Painel web
    └── static/                 # Assets/ícones
```