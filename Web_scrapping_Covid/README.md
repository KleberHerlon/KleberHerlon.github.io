# 🦠 Web Scraping COVID-19 — Dados Globais da Pandemia

Extrai a tabela de dados globais da **pandemia de COVID-19** da Wikipedia e estrutura em **CSV** — base limpa para análise e visualização da evolução da doença no mundo.

![Python](https://img.shields.io/badge/Python-3.10%2B-3776AB?style=flat-square&logo=python&logoColor=white)
![BeautifulSoup](https://img.shields.io/badge/BeautifulSoup-Web%20Scraping-59666C?style=flat-square)
![CSV](https://img.shields.io/badge/Output-CSV-4F5D95?style=flat-square)

---

## 📌 Visão Geral do Problema de Negócio

Durante a pandemia, dados atualizados de casos por país estavam espalhados em páginas da Wikipedia — **sem formato estruturado para análise**. O objetivo: extrair a tabela oficial, limpar as células e gerar um **dataset CSV reutilizável** para análises temporais e geoespaciais.

## 🛠️ Arquitetura & Tech Stack Utilizada

```
Wikipedia (HTML) ──▶ urllib.request.urlopen ──▶ BeautifulSoup
                                                      │
                              localiza: table.wikitable │
                                                      ▼
                                         CSV (UTF-8) gerado
```

| Camada | Ferramenta |
|---|---|
| Extract | `urllib` + `BeautifulSoup` (buscando a 1ª `wikitable`) |
| Transform | iteração por `<tr>` / `<td>`/`<th>` com `.get_text().strip()` |
| Load | módulo `csv` → `Dataset.csv` (UTF-8, `newline=""`) |

## 📊 Modelagem de Dados & Pipelines

1. **Extract** — `urlopen` na fonte pública e parse com BeautifulSoup;
2. **Transform** — seleção da tabela `wikitable`, iteração por linha e limpeza de texto de cada célula (cabeçalhos `<th>` e dados `<td>`);
3. **Load** — gravação em `Dataset.csv` com o módulo `csv` (evita problemas de quoting).

O script refatorado (`scripts/coletar_covid.py`) estrutura o pipeline em **funções reutilizáveis** (`fetch_wikitable`, `rows_to_csv`) com docstrings e tratamento explícito de codificação.

## 📈 Principais Insights / Resultados Gerados

- **Dataset estruturado** de casos por país/período, pronto para pandas (`pd.read_csv`);
- Base para **análise de evolução temporal** e comparação entre países;
- Demonstração de um **pipeline ETL clássico** (scraping → transform → sink) em ~60 linhas de Python.

## 🚀 Como Executar o Projeto Localmente

```bash
# 1. instalar dependências
pip install beautifulsoup4

# 2. rodar o pipeline
python scripts/coletar_covid.py

# 3. resultado
#    Dataset.csv  (na raiz do projeto)
```

> O notebook original está em [`Web_scrapping_covid.ipynb`](Web_scrapping_covid.ipynb).

---

## 📁 Estrutura

```
Web_scrapping_Covid/
├── Web_scrapping_covid.ipynb   # Notebook de exploração original
├── scripts/
│   └── coletar_covid.py        # Pipeline ETL refatorado (recomendado)
├── Dataset.csv                 # Dataset gerado
└── README.md
```