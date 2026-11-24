"""Gera os dados SINTÉTICOS do experimento ISOTERMA (seed fixa, determinístico).

Nada aqui representa medição real. Território fictício.
Uso: python3 -I make_data.py <saida.json>
"""
import json
import random
import sys

SEED = 20261124
rng = random.Random(SEED)

W, H = 1000, 680
COLS, ROWS = 4, 3

# vértices compartilhados com jitter (polígonos sem lacunas)
verts = []
for r in range(ROWS + 1):
    row = []
    for c in range(COLS + 1):
        x = c * W / COLS
        y = r * H / ROWS
        if 0 < c < COLS:
            x += rng.uniform(-38, 38)
        if 0 < r < ROWS:
            y += rng.uniform(-30, 30)
        row.append((round(x, 1), round(y, 1)))
    verts.append(row)

profiles = [
    # id, nome, tipo, temp sup °C, copa %, impermeável %, telhados %, albedo, dens hab/km2, vulnerab, qualidade
    ("r01", "Encosta Norte", "residencial de baixa densidade", 33.8, 31, 48, 22, 0.19, 4200, 0.31, "ok"),
    ("r02", "Bairro Jardim", "residencial arborizado", 32.4, 38, 41, 20, 0.20, 5100, 0.22, "ok"),
    ("r03", "Conjunto Aurora", "conjunto habitacional", 39.6, 7, 78, 34, 0.14, 14800, 0.78, "ok"),
    ("r04", "Alto da Caixa d'Água", "residencial misto", 36.9, 14, 66, 30, 0.16, 9600, 0.57, "ok"),
    ("r05", "Orla do Ribeirão", "margem fluvial", 31.2, 44, 29, 12, 0.18, 2300, 0.35, "ok"),
    ("r06", "Centro Antigo", "centro comercial denso", 41.3, 5, 91, 41, 0.13, 11200, 0.64, "ok"),
    ("r07", "Mercado Central", "comércio e serviços", 40.2, 6, 88, 44, 0.15, 7400, 0.58, "ok"),
    ("r08", "Vila Operária", "residencial adensado", 38.7, 9, 74, 36, 0.15, 16300, 0.83, "ok"),
    ("r09", "Parque Linear", "área verde", 29.6, 63, 14, 3, 0.21, 600, 0.18, "ok"),
    ("r10", "Distrito Logístico", "galpões e pátios", 42.1, 3, 93, 52, 0.12, 900, 0.41, "ok"),
    ("r11", "Novo Loteamento", "expansão urbana", 37.4, 11, 59, 25, 0.17, 3800, 0.49, "insuficiente"),
    ("r12", "Várzea Sul", "residencial informal", 39.1, 8, 70, 38, 0.14, 13500, 0.86, "ok"),
]

regions = []
i = 0
for r in range(ROWS):
    for c in range(COLS):
        p = profiles[i]
        i += 1
        poly = [verts[r][c], verts[r][c + 1], verts[r + 1][c + 1], verts[r + 1][c]]
        cx = round(sum(v[0] for v in poly) / 4, 1)
        cy = round(sum(v[1] for v in poly) / 4, 1)
        regions.append({
            "id": p[0],
            "name": p[1],
            "kind": p[2],
            "polygon": [list(v) for v in poly],
            "centroid": [cx, cy],
            "surfaceTempC": p[3],
            "canopyPct": p[4],
            "imperviousPct": p[5],
            "roofSharePct": p[6],
            "albedo": p[7],
            "populationDensity": p[8],
            "vulnerabilityIndex": p[9],
            "dataQuality": p[10],
        })

# grade térmica (textura): temperatura interpolada por distância inversa aos centróides + ruído
CELL = 20
grid = []
for gy in range(H // CELL):
    row = []
    for gx in range(W // CELL):
        x, y = gx * CELL + CELL / 2, gy * CELL + CELL / 2
        num = den = 0.0
        for reg in regions:
            dx, dy = x - reg["centroid"][0], y - reg["centroid"][1]
            w = 1.0 / ((dx * dx + dy * dy) ** 1.2 + 1)
            num += w * reg["surfaceTempC"]
            den += w
        row.append(round(num / den + rng.uniform(-0.6, 0.6), 1))
    grid.append(row)

# ribeirão fictício
river = [[0, 300], [140, 285], [260, 330], [330, 420], [430, 470], [560, 455], [700, 520], [820, 600], [1000, 640]]

data = {
    "meta": {
        "label": "DADOS SINTÉTICOS — território fictício, gerado para experimento de interface. Não representa nenhuma cidade real nem medições.",
        "seed": SEED,
        "generator": "coordination/make_data.py",
        "viewBox": [0, 0, W, H],
        "units": {
            "surfaceTempC": "°C (temperatura de superfície sintética, tarde de verão fictícia)",
            "canopyPct": "% da área com copa arbórea",
            "imperviousPct": "% da área impermeabilizada",
            "roofSharePct": "% da área coberta por telhados",
            "albedo": "0–1 (refletância média sintética)",
            "populationDensity": "habitantes/km² (sintético)",
            "vulnerabilityIndex": "0–1 (índice sintético composto)",
        },
        "gridCellSize": CELL,
    },
    "regions": regions,
    "thermalGrid": grid,
    "river": river,
}

with open(sys.argv[1], "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=1)
print("regions", len(regions), "grid", len(grid), "x", len(grid[0]))
