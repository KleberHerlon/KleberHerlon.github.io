# 🇧🇷 Cotação de FIIs — Pipeline ETL (Scraping → Sheets)

Pipeline de **web scraping → limpeza → carga** que captura o ranking atualizado de **Fundos Imobiliários brasileiros** (FundsExplorer) e consolida os dados em uma **planilha Google Sheets**.

![Python](https://img.shields.io/badge/Python-3.10%2B-3776AB?style=flat-square&logo=python&logoColor=white)
![Pandas](https://img.shields.io/badge/Pandas-ETL-150458?style=flat-square&logo=pandas&logoColor=white)
![Sheets](https://img.shields.io/badge/Google%20Sheets-API-34A853?style=flat-square&logo=googlesheets&logoColor=white)

---

## 📌 Visão Geral do Problema de Negócio

Quem investe em FIIs precisa de um **ranking consolidado e comparável** — dividend yield, VPA, preço e vacância de todos os fundos em um só lugar. Baixar tabelas manualmente é lento e sujeito a erro de tipo (valores vêm como texto com `R$`, `.`, `,` e `%`). O pipeline automatiza a coleta e padroniza tudo em **dados numéricos prontos para análise**, carregados na nuvem.

## 🛠️ Arquitetura & Tech Stack Utilizada

```
FundsExplorer (HTML) ──▶ requests + pandas.read_html ──▶ DataFrame bruto
                                                               │
                                          normalização de tipos │ (Transform)
                                                               ▼
                              Google Sheets (gspread) ◀── DataFrame limpo
                                       ▲ (Load)
            Carga em A1:Z400, pronta para PbI/Excel/Análise
```

| Camada | Ferramenta |
|---|---|
| Extract | `requests` + `pandas.read_html` |
| Transform | `pandas` — limpeza de `%`, `R$`, separadores e nulos |
| Load | `gspread` (Google Sheets API) |

**Segurança do segredo:** a chave de serviço do Google Cloud (`key.json`) **não é versionada** (`.gitignore`) — recomenda-se usar variável de ambiente `GOOGLE_SERVICE_ACCOUNT`.

## 📊 Modelagem de Dados & Pipelines

### Extract
- GET no ranking do FundsExplorer com `User-Agent` para evitar bloqueio; `pandas.read_html` captura todas as tabelas e a principal é selecionada (`frames[0]`).

### Transform
- **Colunas %** (`DividendYield`, `DY (3M/6M/12M)`, `Variação Preço`, `Rentabilidade`, `VacânciaFísica`…) → remoção de `%` e conversão de vírgula em ponto;
- **Colunas R$** (`VPA`, `PatrimônioLíq.`, `Dividendo`, `Preço Atual`) → remoção de `R$` e pontos de milhar;
- Todos os tipos são convertidos para `float` e nulos preenchidos com `0` — base **modelada para agregação**.

### Load
- Escrita de **cabeçalho + dados** em `A1:Z400` da planilha `Cotacao_fiis`, sobrescrevendo a carga anterior (idempotente).

## 📈 Principais Insights / Resultados Gerados

- **Ranking comparável de DY (12M)** entre todos os FIIs em uma única planilha;
- **Dados prontos para BI**: sem texto misturado com `R$/%`, qualquer dashboard (Power BI/Excel/Looker) consome direto;
- **Automação recorrente**: o mesmo script pode rodar em agendamento (cron) para manter a planilha sempre atualizada.

## 🚀 Como Executar o Projeto Localmente

```bash
# 1. instalar dependências
pip install pandas requests gspread

# 2. criar a chave de serviço do Google Cloud (planilha compartilhada)
#    → salvar como key.json ou definir GOOGLE_SERVICE_ACCOUNT

# 3. rodar o pipeline
python scripts/cotacao_fiis.py
```

> O notebook original de exploração está em [`Cotação_FIIs.ipynb`](Cotação_FIIs.ipynb); o script é a versão refatorada (PEP8, funções reutilizáveis e tratamento de erro).

---

## 📁 Estrutura

```
Cotacao_FIIs/
├── Cotação_FIIs.ipynb      # Notebook de exploração original
├── scripts/
│   └── cotacao_fiis.py     # Pipeline ETL refatorado (recomendado)
├── key.json                # ⛔ Não versionado (credencial)
└── README.md
```