# -*- coding: utf-8 -*-
"""Gera data/analysis.json estático (GitHub Pages) sem Flask.

Uso:
    python build_static.py

Lê todos os relatórios HTML de reports/, roda o parser + KPI engine
(mesma lógica do app.py) e grava ../data/analysis.json, consumido pelo
index.html publicado em kleberherlon.github.io/PerformanceRoboMetatrader/.
"""

import datetime
import glob
import json
import os
import sys

BASE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, BASE)

from mt5_parser import MT5ReportParser          # noqa: E402
from kpi_engine import KPIEngine                # noqa: E402

REPORTS = os.path.join(BASE, 'reports')
OUT_DIR = os.path.join(os.path.dirname(BASE), 'data')
OUT = os.path.join(OUT_DIR, 'analysis.json')


def main():
    parser = MT5ReportParser()
    kpi = KPIEngine()

    paths = sorted(
        glob.glob(os.path.join(REPORTS, '*.html')) +
        glob.glob(os.path.join(REPORTS, '*.htm'))
    )

    all_trades = []
    details = []
    experts = {}
    files = []

    for path in paths:
        name = os.path.basename(path)
        try:
            files.append({'name': name, 'size_kb': round(os.path.getsize(path) / 1024, 2)})
        except OSError as exc:
            print('❌ tamanho:', name, exc)
            continue

        try:
            trades, info = parser.parse(path)
        except Exception as exc:  # noqa: BLE001 - relatório quebrado não derruba o build
            print('❌ parse:', name, exc)
            continue

        expert = info.get('expert_advisor', 'Desconhecido')
        for trade in trades:
            trade['expert_advisor'] = expert
        experts.setdefault(expert, []).extend(trades)
        all_trades.extend(trades)
        details.append({
            'filename': name,
            'total_trades': len(trades),
            'expert_advisor': expert,
        })

    if not all_trades:
        print('❌ Nenhuma operação encontrada nos relatórios.')
        sys.exit(1)

    payload = {
        'success': True,
        'generated_at': datetime.datetime.now().isoformat(timespec='seconds'),
        'reports_analyzed': len(details),
        'files': files,
        'experts': sorted(experts),
        'report_details': details,
        'analysis': kpi.analyze(all_trades),
        'analysis_by_robot': {
            expert: kpi.analyze(trades) for expert, trades in experts.items() if trades
        },
    }

    os.makedirs(OUT_DIR, exist_ok=True)
    with open(OUT, 'w', encoding='utf-8') as fh:
        json.dump(payload, fh, ensure_ascii=False, separators=(',', ':'))

    size = round(os.path.getsize(OUT) / 1024, 1)
    print(
        f'✅ {OUT} · {size} KB · {len(all_trades)} trades · '
        f'{len(details)} relatórios · {len(experts)} robôs'
    )


if __name__ == '__main__':
    main()
