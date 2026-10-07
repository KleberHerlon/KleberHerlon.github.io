#!/usr/bin/env python3
"""Gera as bases anonimizadas (data.json) dos dashboards do portfólio.

Cada relatório original em PDF/Power BI é reconstruído aqui na forma de um
dataset tabular, preservando:
  * a granularidade e os campos do relatório de origem;
  * as métricas agregadas publicadas (KPIs, pareto, séries temporais).

Tudo o que é sensível (nomes de pessoas, e-mails, empresas e identificadores
internos) é substituído por rótulos fictícios — a flag `meta.anon` marca a base
como higienizada (LGPD).

Uso:  python scripts/generate_dash_data.py
"""
from __future__ import annotations

import json
import math
import random
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SEED = 20261007


def largest_remainder(weights: list[float], total: int) -> list[int]:
    """Distribui `total` inteiros proporcionais a `weights` (maior resto)."""
    s = sum(weights)
    if s == 0:
        return [0] * len(weights)
    exact = [w / s * total for w in weights]
    base = [int(math.floor(x)) for x in exact]
    rest = total - sum(base)
    order = sorted(range(len(weights)), key=lambda i: exact[i] - base[i], reverse=True)
    for i in order[:rest]:
        base[i] += 1
    return base


def ipf(row_w: list[float], col_w: list[float]) -> list[list[int]]:
    """Ajuste proporcional iterativo (matriz de contingência com totais-alvo)."""
    n, m = len(row_w), len(col_w)
    grand = sum(row_w)
    mat = [[row_w[i] * col_w[j] / grand for j in range(m)] for i in range(n)]
    for _ in range(40):
        for i in range(n):
            r = sum(mat[i])
            if r:
                for j in range(m):
                    mat[i][j] *= row_w[i] / r
        for j in range(m):
            c = sum(mat[i][j] for i in range(n))
            if c:
                for i in range(n):
                    mat[i][j] *= col_w[j] / c
    out = [[int(round(v)) for v in row] for row in mat]
    # corrige os totais de linha/coluna com o maior resto
    for i, target in enumerate(row_w):
        diff = int(target) - sum(out[i])
        if diff:
            j = max(range(m), key=lambda k: mat[i][k] - out[i][k])
            out[i][j] += diff
    return out


def assign(total: int, parts: dict[str, int]) -> list[str]:
    """Expande contagens {rótulo: qtd} numa lista embaralhada de `total` itens."""
    rng = random.Random(SEED)
    bag: list[str] = []
    for label, n in parts.items():
        bag.extend([label] * n)
    assert len(bag) == total, f"{len(bag)} != {total}"
    rng.shuffle(bag)
    return bag


# ---------------------------------------------------------------------------
# 1) EVPro — Recomendações de Estudo/Validação de Projeto
# ---------------------------------------------------------------------------

EVPRO_PLATAFORMAS = [
    "PRA-1", "P54", "P-77", "P 75", "P51", "P56", "P58", "P52", "P57",
    "P53", "P55", "P43", "P62", "P48", "PMXL1", "PNA1", "P31", "P25", "MOP",
]
EVPRO_PESO_PLATAFORMA = [58, 51, 56, 55, 41, 33, 27, 70, 5, 53, 48, 44,
                         41, 32, 20, 18, 14, 12, 11]
EVPRO_STATUS_APR = {"Aprovado pelo E&P": 428, "Aguardando aprovação": 321}
EVPRO_STATUS_REC = {
    "Recomendação Atendida": 272,
    "Não iniciada": 217,
    "Recomendação em Andamento": 160,
    "Recomendação Dispensada": 36,
    "Aguardando Avaliação EPM": 26,
    "Recomendação Postergada": 19,
    "Recomendação concluída": 14,
    "Recomendação em Atendimento": 5,
}
EVPRO_ANOS = [2022, 2023, 2024, 2025, 2026, 2027]
EVPRO_PESO_ANO = [1, 14, 105, 3, 4, 33]
EVPRO_SISTEMAS = ["TELEFONIA", "WAN", "CFTV", "PA/GA", "RADIO OPERACIONAL",
                  "EPTA", "CATV", "INFORMÁTICA"]
EVPRO_UNIDADES = ["UN - ES", "UN - BUZ", "UN - BC", "UN - BS", "UN - AM",
                  "UN - BA", "UN - GAD-AGP"]


def build_evpro() -> dict:
    total = sum(EVPRO_STATUS_APR.values())          # 749
    plataformas = assign(total, dict(zip(
        EVPRO_PLATAFORMAS,
        largest_remainder(EVPRO_PESO_PLATAFORMA, total),
    )))
    anos = assign(total, dict(zip(
        EVPRO_ANOS, largest_remainder(EVPRO_PESO_ANO, total))))
    status_apr = assign(total, EVPRO_STATUS_APR)
    status_rec = assign(total, EVPRO_STATUS_REC)
    execucao = assign(total, {"Executado": 96, "Em andamento": 160,
                              "Não executado": 493})
    # 381 recomendações programadas: 56 no prazo, 9 com atraso, 316 sem prazo
    prazo = assign(total, {"No prazo": 56, "Com atraso": 9, "Sem prazo": 684})

    rng = random.Random(SEED)
    rows = []
    for i in range(total):
        util_de = rng.randint(2010, 2046)
        rows.append({
            "id": f"REC-{i + 1:04d}",
            "plataforma": plataformas[i],
            "unidade": rng.choice(EVPRO_UNIDADES),
            "sistema": rng.choice(EVPRO_SISTEMAS),
            "tipo": "EVPro" if rng.random() < 0.94 else "EVDesc",
            "status_aprovacao": status_apr[i],
            "execucao": execucao[i],
            "status_recomendacao": status_rec[i],
            "prazo": prazo[i],
            "ano_inicio": anos[i],
            "vida_util_de": util_de,
            "vida_util_ate": util_de + rng.randint(8, 18),
        })
    return {
        "meta": {
            "anon": True,
            "origem": "Power BI — EVPro (Recomendações E&P)",
            "registros": "recomendações",
            "kpi_extra": {"em_andamento_pct": "42,0%", "nao_iniciadas_pct": "57,0%"},
        },
        "rows": rows,
    }


# ---------------------------------------------------------------------------
# 2) Projetos & Melhorias (GM)
# ---------------------------------------------------------------------------

PROJ_DISCIPLINAS = ["CFTV", "PAGA", "TIC", "WAN", "INFORMÁTICA", "LAN",
                    "RADIO OPERACIONAL", "GMDSS", "WLAN", "CATV", "EPTA/ETEX"]
PROJ_PESO_DISC = [17, 11, 6, 6, 5, 4, 4, 3, 3, 1, 1]
PROJ_UNIDADES = ["(Em branco)", "BC", "BS", "BUZ", "ES", "GAD-AGP", "Sonda"]
PROJ_PESO_UN = [3, 30, 22, 21, 34, 20, 2]
PROJ_TIPOS = {"Projeto": 36, "Demanda": 16, "Melhoria Operacional": 11,
              "Pequenas Implantações": 2, "Demanda Simples MAC": 1}
PROJ_PRIORIDADE = {"Normal": 51, "Alta": 15}
PROJ_FASES = ["Implantação", "Execução", "Concluída", "Planejamento",
              "Elaboração do FAM", "Encerramento"]
PROJ_ETAPAS = ["Em andamento", "Aguardando finalização documental",
               "Em Migração de Dados", "Não iniciada", "Concluída"]
PROJ_LIDERES = [f"Líder {i:02d}" for i in range(1, 6)]
PROJ_PLATAFORMAS = ["P-25", "P-48", "P-51", "P-57", "P-58", "P-67", "P-68",
                    "P-76", "P-77", "P-20", "PGP-1", "PNA-2", "PMXL", "PAG2"]


def build_projetos() -> dict:
    n = 66
    rng = random.Random(SEED)
    disc = assign(n, dict(zip(
        PROJ_DISCIPLINAS, largest_remainder(PROJ_PESO_DISC, n))))
    un = assign(n, dict(zip(
        PROJ_UNIDADES, largest_remainder(PROJ_PESO_UN, n))))
    tipo = assign(n, PROJ_TIPOS)
    prio = assign(n, PROJ_PRIORIDADE)

    rows = []
    for i in range(n):
        inicio = rng.randint(2022, 2026)
        rows.append({
            "id": f"PRJ-{i + 1:03d}",
            "unidade": un[i],
            "plataforma": rng.choice(PROJ_PLATAFORMAS),
            "projeto": f"DMD{rng.randint(1, 9999):05d} — {rng.choice(list(PROJ_TIPOS))} de infraestrutura",
            "disciplina": disc[i],
            "tipo_iniciativa": tipo[i],
            "prioridade": prio[i],
            "fase": rng.choice(PROJ_FASES),
            "etapa": rng.choice(PROJ_ETAPAS),
            "lider": rng.choice(PROJ_LIDERES),
            "ano_inicio": inicio,
            "data_inicio": f"{rng.randint(1, 28):02d}/{rng.randint(1, 12):02d}/{inicio}",
        })

    return {
        "meta": {
            "anon": True,
            "origem": "Power BI — Projetos & Melhorias (MAC/OFFS)",
            "registros": "projetos",
            "static": {
                "oms_por_ano": {
                    "titulo": "Ordens de manutenção por ano",
                    "labels": ["2021", "2022", "2023", "2024", "2025", "2026"],
                    "series": [{"label": "OMs", "data": [19, 126, 153, 75, 115, 102]}],
                },
                "gms_por_ano": {
                    "titulo": "Gestões de mudança por ano",
                    "labels": ["2021", "2022", "2023", "2024", "2025", "2026"],
                    "series": [{"label": "GMs", "data": [2, 42, 64, 1, 58, 29]}],
                },
                "gms_por_fase": {
                    "titulo": "Classificação das GMs por fase",
                    "labels": ["Execução", "Encerramento", "Planejamento",
                               "Operação", "Elaboração do FAM", "Análise de Risco"],
                    "series": [{"label": "GMs", "data": [93, 30, 24, 17, 12, 10]}],
                },
                "prazo_gms": {
                    "titulo": "Fases de GM em atraso",
                    "labels": ["No prazo", "Fora do prazo"],
                    "series": [{"label": "GMs", "data": [179, 12]}],
                },
                "kpi_hh": {
                    "hh_planejado": 32650.70,
                    "hh_realizado": 3415.50,
                    "hh_restante": 29247.20,
                },
            },
        },
        "rows": rows,
    }


# ---------------------------------------------------------------------------
# 3) NC Pareto — Não conformidades
# ---------------------------------------------------------------------------

NC_UNIDADES = ["BC", "ES", "GAD-AGP", "BUZ", "AM", "GAD", "BS", "ARMADOR", "BA"]
NC_QTD_UNIDADE = [4014, 2086, 1886, 1721, 933, 629, 266, 150, 125]
NC_TIPOS = {"NC_GE": 9483, "R_PE": 1541, "NC_MO": 775, "NC_CR": 11}
NC_METAS = {"NC_GE": 80.0, "R_PE": 90.0, "NC_MO": 99.0, "NC_CR": 100.0}
NC_ETAPAS = {"Programação": 5030, "Planejamento": 2833, "LOPAD": 387,
             "Suprimento": 18, "Inspeção": 2, "Outros": 3540}
NC_OPERACOES_TOTAL = 26631


def build_nc() -> dict:
    total = sum(NC_QTD_UNIDADE)                       # 11810
    col_w = [NC_TIPOS[t] for t in NC_TIPOS]
    mat = ipf(NC_QTD_UNIDADE, col_w)                  # unidade x tipo
    etapa_labels = list(NC_ETAPAS)
    etapa_prop = [v / sum(NC_ETAPAS.values()) for v in NC_ETAPAS.values()]

    rows = []
    for i, unidade in enumerate(NC_UNIDADES):
        for j, tipo in enumerate(NC_TIPOS):
            cell = mat[i][j]
            if cell <= 0:
                continue
            split = largest_remainder(etapa_prop, cell)
            for k, etapa in enumerate(etapa_labels):
                if split[k] <= 0:
                    continue
                rows.append({
                    "unidade": unidade,
                    "tipo_nc": tipo,
                    "etapa": etapa,
                    "qtd": split[k],
                    "meta": NC_METAS[tipo],
                })
    assert sum(r["qtd"] for r in rows) == total

    return {
        "meta": {
            "anon": True,
            "origem": "Power BI — Pareto de Não Conformidades",
            "registros": "ocorrências agrupadas",
            "periodo": "19/08/2025 a 18/08/2026",
            "operacoes_total": NC_OPERACOES_TOTAL,
            "static": {
                "falhas_tipo": {
                    "titulo": "Principais descrições de falha",
                    "labels": ["TIPO DE NOTA INCORRETO", "TIPO DE MANUTENÇÃO INCORRETO",
                               "TIPO DE INTERVENÇÃO INCORRETO",
                               "TEXTO BREVE DA OPERAÇÃO INCORRETO"],
                    "series": [{"label": "Ocorrências", "data": [9, 14, 10, 3]}],
                },
                "falhas_mes": {
                    "titulo": "% de falhas por mês",
                    "labels": ["nov/25", "dez/25", "jan/26", "fev/26", "mar/26",
                               "abr/26", "mai/26", "jun/26", "jul/26", "ago/26", "set/26"],
                    "series": [{"label": "% falhas",
                                "data": [51.8, 49.7, 45.1, 40.2, 42.7, 54.4,
                                         38.8, 47.0, 46.3, 40.4, 36.1]}],
                },
            },
        },
        "rows": rows,
    }


# ---------------------------------------------------------------------------
# 4) Suprimentos — MRP
# ---------------------------------------------------------------------------

MRP_UNIDADES = ["BUZ", "BS", "BC", "ES", "GAD-AGP", "AM"]
MRP_PESO_NM = [611, 494, 311, 284, 233, 11]
MRP_FABRICANTES = ["PIRELLI", "TRESMBRASI", "COMROD", "JOTRON", "AC ANTENAS",
                   "JAYBEAN", "PANDUIT", "RFS"]
MRP_DESCRICOES = [
    "Cabo coaxial RG213 PVC/A 50 Ohm",
    "Fita auto-fus. EPR 69kV 19mm",
    "Fita isolante PVC 750V 19mm",
    "Fusível vidro 250V 2A 5x20mm",
    "Cabo UTP Cat6 blindado",
    "Conector N fêmea 50 Ohm",
    "Antena omni 2,4 GHz",
    "Patch cord LC/UPC 3m",
    "Disjuntor curto 10A DIN",
    "Rack 19\" 42U",
]
MRP_TIPOS_MRP = ["ND", "P1", "P3", "VB", "ZB", "ZP", "ZS"]
MRP_IMPACTO = ["Alto", "Médio", "Baixo"]
MRP_DEPOSITOS = ["AREA_MRP", "CENTRO"]


def build_mrp() -> dict:
    n = 450
    rng = random.Random(SEED)
    # NMs com MRP por unidade (distribuição real do relatório)
    un_counts = largest_remainder(MRP_PESO_NM, n)
    unidade_bag: list[str] = []
    for u, c in zip(MRP_UNIDADES, un_counts):
        unidade_bag.extend([u] * c)

    # Conformidade MRP x LTEC: 65,6% conforme / 34,4% não conforme
    conf_bag = assign(n, {"Conforme": 295, "Não Conforme": 155})
    param_bag = assign(n, {"Sim": 267, "Não": 183})

    rows = []
    for i in range(n):
        material = str(rng.randint(10050000, 10099999))
        rows.append({
            "material": material,
            "descricao": rng.choice(MRP_DESCRICOES),
            "fabricante": rng.choice(MRP_FABRICANTES),
            "modelo": f"{rng.choice(['RG213', 'H0002', 'AV19', 'GPS4', 'CX49', 'AR7M'])}{rng.randint(10, 99)}",
            "unidade": unidade_bag[i],
            "plataforma": rng.choice(["P09", "P18", "P20", "P25", "P31", "P48",
                                      "P54", "P57", "P58", "P74", "P75", "P76", "P77", "P78", "P79"]),
            "centro": rng.choice(["4142", "2320", "5313", "4130"]),
            "deposito": rng.choice(MRP_DEPOSITOS),
            "tipo_mrp": rng.choice(MRP_TIPOS_MRP),
            "parametrizado": param_bag[i],
            "conformidade": conf_bag[i],
            "impacto_falha": rng.choice(MRP_IMPACTO),
            "unidade_medida": rng.choice(["M", "UN", "PC"]),
            "quantidade": round(rng.choice([1, 2, 4, 6, 10, 20, 50]) * rng.random(), 2) or 1,
        })

    return {
        "meta": {
            "anon": True,
            "origem": "Power BI — Suprimentos / MRP (SAP-MM)",
            "registros": "materiais",
            "static": {
                "nms_por_un": {
                    "titulo": "NMs com MRP por unidade de negócio",
                    "labels": MRP_UNIDADES,
                    "series": [{"label": "NMs", "data": MRP_PESO_NM}],
                },
                "conformidade_mrp": {
                    "titulo": "Conformidade MRP x LTEC",
                    "labels": ["Conforme", "Não Conforme"],
                    "series": [{"label": "Materiais", "data": [780, 409]}],
                },
            },
        },
        "rows": rows,
    }


# ---------------------------------------------------------------------------
# 5) HC x HP — Headcount x Headplan
# ---------------------------------------------------------------------------

HCHP_ESTRUTURAS = ["AJUSTE", "AM", "ARMADOR", "AUSÊNCIA", "BA", "BC", "BS",
                   "BUZ", "ES", "GAD", "GAD-AGP", "ONSHORE", "TREINAMENTO"]
HCHP_MESES = [(2024, m) for m in range(1, 13)] + \
             [(2025, m) for m in range(1, 13)] + \
             [(2026, m) for m in range(1, 8)]      # jan/24 .. jul/26
HCHP_PESO_ESTR = [4, 26, 9, 3, 12, 22, 18, 21, 24, 6, 11, 8, 5]
HCHP_EMPRESAS = ["Contratada", "Cliente"]


def build_hchp() -> dict:
    rng = random.Random(SEED)
    rows = []
    for ano, mes in HCHP_MESES:
        dist = largest_remainder(HCHP_PESO_ESTR, rng.randint(38, 62))
        for estr, carteiras in zip(HCHP_ESTRUTURAS, dist):
            if carteiras == 0:
                continue
            hp = round(carteiras * rng.uniform(180, 340), 1)
            he = round(hp * rng.uniform(0.74, 0.97), 1)
            rows.append({
                "ano": ano,
                "mes": mes,
                "mes_label": ["jan", "fev", "mar", "abr", "mai", "jun", "jul",
                              "ago", "set", "out", "nov", "dez"][mes - 1],
                "estrutura": estr,
                "empresa": rng.choice(HCHP_EMPRESAS),
                "carteiras": carteiras,
                "hh_planejado": hp,
                "hh_executado": he,
            })
    return {
        "meta": {
            "anon": True,
            "origem": "Power BI — HC x HP Atualizado",
            "registros": "carteiras por estrutura e mês",
            "periodo": "02/01/2024 a 22/10/2027",
            "static": {
                "kpis": {
                    "carteiras_total": 2087,
                    "empresas": "Contratada e Cliente",
                },
            },
        },
        "rows": rows,
    }


BUILDERS = {
    "evpro": build_evpro,
    "projetos": build_projetos,
    "nc-pareto": build_nc,
    "mrp": build_mrp,
    "hc-hp": build_hchp,
}


def main() -> None:
    for name, fn in BUILDERS.items():
        out_dir = ROOT / name
        out_dir.mkdir(parents=True, exist_ok=True)
        data = fn()
        path = out_dir / "data.json"
        path.write_text(json.dumps(data, ensure_ascii=False, indent=1),
                        encoding="utf-8")
        print(f"{name:12s} rows={len(data['rows']):5d} "
              f"size={path.stat().st_size:7d}B  anon={data['meta']['anon']}")


if __name__ == "__main__":
    main()
