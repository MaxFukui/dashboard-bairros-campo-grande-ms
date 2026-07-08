#!/usr/bin/env python3
"""
shp_to_geojson.py — Filter CG bairros and convert to GeoJSON.

Reads the state-level MS_bairros shapefile, keeps only the
"Campo Grande" records, and writes a GeoJSON file with the IBGE
attributes plus a numeric `id_bairro` joined from
`src/data/bairros.json`.

Usage:
    python3 scripts/geo/shp_to_geojson.py

Output:
    public/geo/bairros_campo_grande.geojson
"""
import json
import os
import re
import unicodedata
import shapefile

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SHP = os.path.join(ROOT, "public/shapefiles_bairros/CG_bairros_CD2022/CG_bairros_CD2022.shp")
JSON_DATA = os.path.join(ROOT, "src/data/bairros.json")
OUT = os.path.join(ROOT, "public/geo/bairros_campo_grande.geojson")


def decode(v):
    if isinstance(v, bytes):
        return v.decode("utf-8", errors="replace").strip()
    return str(v).strip() if v is not None else ""


def shape_to_geometry(shape):
    if shape.shapeType != 5:
        return None
    pts = shape.points
    parts = list(shape.parts) + [len(pts)]
    rings = []
    for i in range(len(parts) - 1):
        ring = pts[parts[i]:parts[i + 1]]
        if len(ring) < 4:
            continue
        if ring[0] != ring[-1]:
            ring = ring + [ring[0]]
        rings.append([[p[0], p[1]] for p in ring])
    if not rings:
        return None
    if len(rings) == 1:
        return {"type": "Polygon", "coordinates": rings}
    return {"type": "MultiPolygon", "coordinates": [[r] for r in rings]}


def normalize_name(s):
    s = unicodedata.normalize("NFD", s)
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    s = s.upper().replace("-", " ")
    return re.sub(r"\s+", "", s)


def main():
    with open(JSON_DATA, encoding="utf-8") as f:
        bairros = json.load(f)
    name_to_id = {normalize_name(b["Bairro"]): b["id_bairro"] for b in bairros}

    os.makedirs(os.path.dirname(OUT), exist_ok=True)

    reader = shapefile.Reader(SHP)
    fields = [fld[0] for fld in reader.fields[1:]]
    idx_nm_bairro = fields.index("NM_BAIRRO")

    features = []
    unmatched = []
    for shape, rec in zip(reader.shapes(), reader.records()):
        geom = shape_to_geometry(shape)
        if geom is None:
            continue
        raw = {fields[i]: decode(rec[i]) for i in range(len(fields))}
        nome = raw["NM_BAIRRO"]
        id_bairro = name_to_id.get(normalize_name(nome))
        if id_bairro is None:
            unmatched.append(nome)
            continue
        props = {
            "id_bairro": id_bairro,
            "nome": nome,
            "nome_upper": nome.upper(),
            "cd_bairro": raw["CD_BAIRRO"],
            "cd_mun": raw["CD_MUN"],
            "nm_mun": raw["NM_MUN"],
            "cd_dist": raw["CD_DIST"],
            "nm_dist": raw["NM_DIST"],
            "cd_subdist": raw["CD_SUBDIST"],
            "nm_subdist": raw["NM_SUBDIST"],
            "cd_regiao": raw["CD_REGIAO"],
            "nm_regiao": raw["NM_REGIAO"],
            "cd_uf": raw["CD_UF"],
            "nm_uf": raw["NM_UF"],
            "cd_rgint": raw["CD_RGINT"],
            "nm_rgint": raw["NM_RGINT"],
            "cd_rgi": raw["CD_RGI"],
            "nm_rgi": raw["NM_RGI"],
            "cd_concurb": raw["CD_CONCURB"],
            "nm_concurb": raw["NM_CONCURB"],
        }
        features.append({"type": "Feature", "properties": props, "geometry": geom})

    if unmatched:
        print(f"WARNING: {len(unmatched)} unmatched bairros:")
        for n in unmatched:
            print(f"  - {n}")

    geojson = {
        "type": "FeatureCollection",
        "name": "bairros_campo_grande",
        "crs": {"type": "name", "properties": {"name": "urn:ogc:def:crs:OGC:1.3:CRS84"}},
        "metadata": {
            "title": "Bairros de Campo Grande - MS",
            "source": "IBGE - Censo Demografico 2022 (CD2022)",
            "count": len(features),
            "municipality": "Campo Grande",
            "municipality_ibge_code": "5002704",
        },
        "features": features,
    }

    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(geojson, f, ensure_ascii=False, separators=(",", ":"))

    size_kb = os.path.getsize(OUT) / 1024
    print(f"Wrote {len(features)} features to {OUT}")
    print(f"Size: {size_kb:.1f} KB")


if __name__ == "__main__":
    main()
