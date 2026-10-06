# -*- coding: utf-8 -*-
"""
Coleta e estruturação das cotações de Fundos Imobiliários (FIIs) brasileiros.

Pipeline ETL:
    Extract  → scraping do ranking do FundsExplorer (pandas.read_html)
    Transform→ limpeza de tipos, moeda (R$) e percentuais (%)
    Load     → carga em planilha do Google Sheets (via gspread)

Uso:
    Recomendado via variável de ambiente para não expor credenciais:
      export GOOGLE_SERVICE_ACCOUNT=/caminho/key.json   (Linux/macOS)
      set GOOGLE_SERVICE_ACCOUNT=C:\\caminho\\key.json    (Windows)
"""

import os

import gspread
import pandas as pd
import requests

# ---------------------------------------------------------------------------
# Configurações
# ---------------------------------------------------------------------------
RANKING_URL = "https://www.fundsexplorer.com.br/ranking"
USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/120.0 Safari/537.36"
)
SPREADSHEET_ID = "1mO-7fwEb6euJCBalaZRgtHsFt4NXFHuP4qkFD0UPtVk"
WORKSHEET_NAME = "Cotacao_fiis"

# Colunas numéricas que vêm como texto com % e/ou R$
PERCENT_COLUMNS = [
    "DividendYield", "DY (3M)Acumulado", "DY (6M)Acumulado",
    "DY (12M)Acumulado", "DY (3M)Média", "DY (6M)Média",
    "DY (12M)Média", "DY Ano", "Variação Preço", "Rentab.Período",
    "Rentab.Acumulada", "VacânciaFísica",
]
CURRENCY_COLUMNS = ["VPA", "PatrimônioLíq.", "Dividendo", "Preço Atual"]


def fetch_ranking_frame() -> pd.DataFrame:
    """Extrai a tabela principal de cotações do FundsExplorer.

    Returns:
        DataFrame com a tabela de cotações.
    Raises:
        ConnectionError: se a requisição falhar.
    """
    resp = requests.get(RANKING_URL, headers={"User-Agent": USER_AGENT},
                        timeout=30)
    resp.raise_for_status()
    frames = pd.read_html(resp.text)
    if not frames:
        raise ValueError("Nenhuma tabela encontrada na página.")
    return pd.DataFrame(frames[0])


def _to_float_series(series: pd.Series) -> pd.Series:
    """Converte uma coluna de texto (%, R$) em float normalizado."""
    return (
        series.astype(str)
        .str.replace("%", "", regex=False)
        .str.replace("R$", "", regex=False)
        .str.replace(".", "", regex=False)
        .str.replace(",", ".", regex=False)
        .str.strip()
        .replace("", "0")
        .astype(float)
    )


def clean_frame(frame: pd.DataFrame) -> pd.DataFrame:
    """Aplica a transformação de tipos nas colunas numéricas."""
    df = frame.copy()
    available = [c for c in PERCENT_COLUMNS + CURRENCY_COLUMNS if c in df.columns]
    for col in available:
        df[col] = _to_float_series(df[col])
    return df.fillna(0)


def load_to_sheets(df: pd.DataFrame, key_path: str | None = None) -> None:
    """Carrega os dados na planilha Google Sheets (camada Load)."""
    key = key_path or os.environ.get(
        "GOOGLE_SERVICE_ACCOUNT",
        os.path.join(os.path.dirname(__file__), "key.json"),
    )
    gc = gspread.service_account(filename=key)
    sheet = gc.open_by_key(SPREADSHEET_ID).worksheet(WORKSHEET_NAME)
    payload = [df.columns.values.tolist()] + df.values.tolist()
    sheet.update("A1:Z400", payload)


def main() -> None:
    """Pipeline ETL completo: extração → transformação → carga."""
    print("ETL FIIs")

    print("→ Extraindo ranking (FundsExplorer)...")
    df = fetch_ranking_frame()

    print("→ Transformando tipos (R$, %)...")
    df = clean_frame(df)
    df.info()

    print("→ Carregando para Google Sheets...")
    load_to_sheets(df)
    print("Carga concluída.")


if __name__ == "__main__":
    main()