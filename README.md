<div align="center">

# Analytics Engineer & Data Analyst

**Kleber Carboni** — transformando dados brutos em decisões. 100% remoto.

[![Site](https://img.shields.io/badge/Portf%C3%B3lio-Online-07d4ad?style=for-the-badge&logo=githubpages&logoColor=white)](https://kleberherlon.github.io/)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-KleberHerlon-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/kleber-herlon-analista-de-dados)
[![E-mail](https://img.shields.io/badge/Email-kleberherlonsc%40gmail.com-EA4335?style=for-the-badge&logo=gmail&logoColor=white)](mailto:kleberherlonsc@gmail.com)
[![Localização](https://img.shields.io/badge/Jacare%C3%AD%2FSP%20%E2%80%94%20100%25%20Remoto-4f7942?style=for-the-badge)]()

</div>

---

## 👋 Sobre Mim

Analytics Engineer & Data Analyst com **formação em Análise e Desenvolvimento de Sistemas** e histórico de **impacto mensurável** em operações de alta complexidade:

- 🎯 Dashboard estratégico que **zerou 100 dias de passivo operacional** (R100) na Infotec Brasil;
- 🤖 Automações em **SAP/SAP HANA** (extração D-1, inventário offshore, gestão de férias) que **eliminaram multas contratuais**;
- 📊 **+4 anos** construindo pipelines ETL, modelos estatísticos e dashboards em Power BI, Looker Studio e Python;
- 🏥 Formação complementar em **Fisioterapia** — diferencial raro em projetos de *health analytics*.

---

## 🧰 Core Tech Stack

| Categoria | Tecnologias |
|---|---|
| 🗄️ **Databases & SQL** | ![SQL](https://img.shields.io/badge/SQL-SAP_HANA_%7C_PostgreSQL-4479A1?style=flat-square&logo=postgresql&logoColor=white) ![SAP HANA](https://img.shields.io/badge/SAP_HANA-Modelagem_%26_Extra%C3%A7%C3%A3o-000033?style=flat-square&logo=sap&logoColor=white) ![Consultas](https://img.shields.io/badge/Queries-CTE%2C_JOIN%2C_Views-4F5D95?style=flat-square) |
| 🔄 **Pipelines & Python** | ![Python](https://img.shields.io/badge/Python-3.10%2B-3776AB?style=flat-square&logo=python&logoColor=white) ![Pandas](https://img.shields.io/badge/Pandas-ETL%2FScraping-150458?style=flat-square&logo=pandas&logoColor=white) ![BeautifulSoup](https://img.shields.io/badge/BeautifulSoup-HTML_Parsing-59666C?style=flat-square) ![Flask](https://img.shields.io/badge/Flask-Data_API-000000?style=flat-square&logo=flask&logoColor=white) ![ETL](https://img.shields.io/badge/ETL-Extract%E2%80%A2Transform%E2%80%A2Load-FF6C37?style=flat-square&logo=apacheairflow&logoColor=white) |
| 📊 **BI & Visualização** | ![Power BI](https://img.shields.io/badge/Power_BI-DAX_%26_M-F2C811?style=flat-square&logo=powerbi&logoColor=black) ![Looker](https://img.shields.io/badge/Looker_Studio-Dashboards-4285F4?style=flat-square&logo=googlelooker&logoColor=white) ![Excel](https://img.shields.io/badge/Excel-Avan%C3%A7ado-217346?style=flat-square&logo=microsoftexcel&logoColor=white) |
| 🛠️ **Ferramentas & Dev** | ![Git](https://img.shields.io/badge/Git-Flow- F05032?style=flat-square&logo=git&logoColor=white) ![GitHub](https://img.shields.io/badge/GitHub-Actions_%7C_Pages-181717?style=flat-square&logo=github&logoColor=white) ![React](https://img.shields.io/badge/React-19_%7C_Vite-61DAFB?style=flat-square&logo=react&logoColor=black) |

---

## 🏆 Projetos de Engenharia de Dados & Analytics

### 🔬 1. Motor de KPIs de Trading — PMTG MT5
> **Destaque:** parsing robusto + **20 KPIs estatísticos** expostos via API.

| | |
|---|---|
| **Tecnologias** | ![Python](https://img.shields.io/badge/-Python-3776AB?logo=python&logoColor=white) ![Flask](https://img.shields.io/badge/-Flask-000000?logo=flask&logoColor=white) ![BeautifulSoup](https://img.shields.io/badge/-BeautifulSoup-59666C?flat) ![Pandas](https://img.shields.io/badge/-Pandas-150458?logo=pandas) |
| **Problema** | Relatórios HTML do MetaTrader 5 são ilegíveis para comparação de performance entre robôs. |
| **Solução** | Parser com auto-detecção de encoding e **mapeamento dinâmico de colunas** (PT/EN) + `KPIEngine` que calcula win rate, profit factor, payoff, expectância, **Sharpe**, **max drawdown**, streaks e curva de equity. |
| **Resultado** | Análise consolidada + individual por Expert Advisor em uma única API REST (`/api/analyze`). |
| **Código** | [`PerformanceRoboMetatrader/`](./PerformanceRoboMetatrader/) |

### 📈 2. Pipeline ETL — Cotação de FIIs (Scraping → Sheets)
> **Destaque:** ETL desacoplado com normalização de tipos e carga idempotente na nuvem.

| | |
|---|---|
| **Tecnologias** | ![Python](https://img.shields.io/badge/-Python-3776AB?logo=python&logoColor=white) ![Pandas](https://img.shields.io/badge/-Pandas-150458?logo=pandas) ![Sheets](https://img.shields.io/badge/-Google_Sheets-34A853?logo=googlesheets) |
| **Problema** | Ranking de FIIs vindo como texto (`R$`, `%`, vírgulas) inviabiliza análise agregada. |
| **Solução** | `pandas.read_html` + pipeline **Extract → Transform → Load** que padroniza tipos e carrega em Google Sheets (`A1:Z400`). |
| **Resultado** | Base numérica pronta para BI/Power BI, atualizável por agendamento. |
| **Código** | [`Cotacao_FIIs/`](./Cotacao_FIIs/) |

### 🦠 3. Web Scraping — Dados Globais de COVID-19
> **Destaque:** pipeline ETL clássico em ~60 linhas, de `urlopen` ao CSV.

| | |
|---|---|
| **Tecnologias** | ![Python](https://img.shields.io/badge/-Python-3776AB?logo=python&logoColor=white) ![BeautifulSoup](https://img.shields.io/badge/-BeautifulSoup-59666C) ![CSV](https://img.shields.io/badge/-CSV-4F5D95) |
| **Problema** | Dados da pandemia espalhados em tabelas sem formato estruturado. |
| **Solução** | Extração da `wikitable` + estruturação em `Dataset.csv` (UTF-8) com módulo `csv`. |
| **Resultado** | Dataset reutilizável para análises temporais e geográficas. |
| **Código** | [`Web_scrapping_Covid/`](./Web_scrapping_Covid/) |

### 📊 4. Dashboards Power BI — Gestão Operacional (Produção)
> **Destaque:** visualização de alto impacto direto da operação real.

| Dashboard | Tema |
|---|---|
| `EVPro.pbix` | Evolução de projetos e ações — status e prazos (**40+ páginas**) |
| `NC_Pareto.pbix` | Análise de **Pareto** de não conformidades (DAX) |
| `Projetos.pbix` | Portfólio de projetos e melhorias por unidade |
| `Suprimentos - MRP.pbix` | Estoque, requisições e MRP |
| `Evolução das Carteiras - offs.pbix` | Carteiras (MIP protegido — print) |
| `HC x HP Atualizado.pbix` | Hora planejada × hora confirmada (MIP — print) |

> Prints em [`assets/dashboards/`](./assets/dashboards/).

---

## 🛠️ Projetos de Apoio & Desenvolvimento Web

| Projeto | Descrição | Stack |
|---|---|---|
| [**dash_online**](./dash_online/) | Dashboard de robôs de trading **em tempo real (5s)** — KPIs por robô e histórico diário | JavaScript · JSON · HTML |
| [**breakeltner-site**](./breakeltner-site/) | Landing page + checkout orientada a conversão | HTML · CSS · JS |
| [**Form-Pesquisa**](./Form-Pesquisa/) | Formulário de satisfação (escala 0–10) com envio estruturado | JavaScript · HTML · CSS |
| [**Portfolio**](./Portfolio/) | Site pessoal responsivo mobile-first | HTML · CSS |

---

## 🧩 Arquitetura de Código & Padrões ETL

Boas práticas aplicadas nos pipelines: **tipagem estática**, **desacoplamento Extract-Transform-Load**, **tratamento de HTTP** e **manipulação estatística** em funções puras.

### ✨ Pipeline ETL — FIIs (desacoplado e tipado)

```python
def fetch_ranking_frame() -> pd.DataFrame:
    """Extract: baixa o ranking e captura a tabela principal."""
    resp = requests.get(RANKING_URL, headers={"User-Agent": USER_AGENT}, timeout=30)
    resp.raise_for_status()                     # tratamento de erro HTTP explícito
    if not (frames := pd.read_html(resp.text)):
        raise ValueError("Nenhuma tabela encontrada.")
    return pd.DataFrame(frames[0])


def clean_frame(frame: pd.DataFrame) -> pd.DataFrame:
    """Transform: normaliza % / R$ / milhar para float (base analisável)."""
    df = frame.copy()
    for col in PERCENT_COLUMNS + CURRENCY_COLUMNS:
        if col in df.columns:
            df[col] = df[col].astype(str).str.replace("%", "", regex=False) \
                       .str.replace("R$", "", regex=False) \
                       .str.replace(",", ".", regex=False) \
                       .astype(float)
    return df.fillna(0)


def load_to_sheets(df: pd.DataFrame) -> None:
    """Load: grava cabeçalho + dados em Google Sheets (carga idempotente)."""
    gc = gspread.service_account(filename=KEY)      # segredo via env var / key.json
    ws = gc.open_by_key(SPREADSHEET_ID).worksheet("Cotacao_fiis")
    ws.update("A1:Z400", [df.columns.tolist()] + df.values.tolist())
```

### 📊 Motor de KPIs — métricas estatísticas em funções puras

```python
class KPIEngine:
    """Calcula KPIs de trading via funções puras e reutilizáveis."""

    def _summary_kpis(self, trades):
        profits = [t["profit"] for t in trades if t.get("profit") is not None]
        wins, losses = [p for p in profits if p > 0], [p for p in profits if p < 0]
        gross_profit, gross_loss = sum(wins), abs(sum(losses))

        # Conversão explícita de inf → ∞ (dado sem golpe perdido)
        profit_factor = gross_profit / gross_loss if gross_loss else float("inf")
        std = (sum((p - (sum(profits) / len(profits))) ** 2 for p in profits) / len(profits)) ** 0.5
        sharpe = ((sum(profits) / len(profits)) / std * math.sqrt(252)) if std else 0.0

        return {
            "win_rate": round(len(wins) / len(profits) * 100, 2),
            "profit_factor": round(profit_factor, 2),
            "sharpe_ratio": round(sharpe, 3),
            "max_drawdown": round(self._calculate_max_drawdown(trades), 2),
        }
```

**Padrões em destaque:** ✔ tipagem de retorno (`-> pd.DataFrame`) · ✔ *separation of concerns* ETL · ✔ `raise_for_status()` no HTTP · ✔ tratamento de divisão por zero · ✔ funções puras testáveis.

---

## 📬 Contato

- **E-mail:** [kleberherlonsc@gmail.com](mailto:kleberherlonsc@gmail.com)
- **LinkedIn:** [/in/kleber-herlon-analista-de-dados](https://www.linkedin.com/in/kleber-herlon-analista-de-dados)
- **Disponibilidade:** 100% remoto — **Analytics Engineering**, **Data Engineering** e **Análise de Dados**.

---

<div align="center">

*Feito com 💚 e dados.* · Repositório publicado via GitHub Pages: [kleberherlon.github.io](https://kleberherlon.github.io/)

</div>