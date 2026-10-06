# -*- coding: utf-8 -*-
"""
Coleta os dados globais de COVID-19 a partir da tabela da Wikipedia
(e.g. "Template:COVID-19 pandemic data") e estrutura em CSV.

Pipeline:
    Extract  → urlopen + BeautifulSoup (tabela wikitable)
    Transform→ iteração por linhas/células e limpeza de texto
    Load     → Dataset.csv (UTF-8)

Uso:
    python scripts/coletar_covid.py
"""

from __future__ import annotations

import csv
from urllib.request import urlopen

from bs4 import BeautifulSoup

# Fonte pública (encurtador para a tabela de dados da pandemia)
DATA_URL = "https://bit.ly/3jpMFRW"
OUTPUT_CSV = "Dataset.csv"


def fetch_wikitable() -> list:
    """Extrai a primeira tabela 'wikitable' da página da Wikipedia."""
    html = urlopen(DATA_URL)
    soup = BeautifulSoup(html, "html.parser")
    table = soup.find_all("table", {"class": "wikitable"})[0]
    return table.find_all("tr")


def rows_to_csv(rows: list, output_path: str = OUTPUT_CSV) -> None:
    """Converte as linhas HTML em CSV estruturado (UTF-8, newline='')."""
    with open(output_path, "wt+", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        for row in rows:
            cells = row.find_all(["td", "th"])
            writer.writerow([cell.get_text().strip() for cell in cells])


def main() -> None:
    """Executa o pipeline completo: extração → carga."""
    print(f"→ Coletando dados de {DATA_URL}")
    print(f"→ Gerando {OUTPUT_CSV}...")
    rows = fetch_wikitable()
    rows_to_csv(rows)
    print("Concluído.")


if __name__ == "__main__":
    main()