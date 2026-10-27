# Spatial Distribution of Healthcare Facilities — Gujranwala District, Punjab, Pakistan

A Google Earth Engine (GEE) script that maps and analyses the spatial distribution of
healthcare facilities across Gujranwala District: service-area buffers, underserved zones,
kernel-density hotspots, cost-distance accessibility, and tehsil-wise summaries, with an
interactive dark-themed UI panel and click inspector.

**Version:** 4.0 — the Gujranwala City (Sadar) tehsil now uses a real boundary asset.

## Features

- **Study area** – Gujranwala District from FAO GAUL 2015 (Level 2)
- **Facilities** – 12 hospitals (public / private / military) and 15 BHU / MCH clinics
- **Buffers** – 5 km and 10 km hospital zones, 3 km clinic zones
- **Underserved areas** – district area more than 5 km from any hospital
- **Kernel density** – Gaussian KDE hotspot map of facility concentration
- **Accessibility** – slope-weighted cumulative cost distance from SRTM
- **Population** – WorldPop 2020 (100 m) and GHSL built-up surface (urban mask)
- **Tehsil counts** – facilities per tehsil (City tehsil uses the real asset geometry)
- **UI** – legend, statistics, layer toggles, click inspector (nearest facilities within 5 km)
- **Exports** – GeoTIFFs, shapefiles, and a CSV to Google Drive

## Datasets

| Layer | Source |
|---|---|
| District boundary | `FAO/GAUL/2015/level2` |
| Population | `WorldPop/GP/100m/pop` (2020, PAK) |
| Built-up surface | `JRC/GHSL/P2023A/GHS_BUILT_S` (2020) |
| Elevation / slope | `USGS/SRTMGL1_003` |
| City tehsil boundary | `projects/ee-faseehtahir105/assets/Gujranwala_City` (private asset) |

## Usage

1. Open the [GEE Code Editor](https://code.earthengine.google.com/).
2. Paste `scripts/gujranwala_healthcare_analysis.js` into a new script.
3. Make sure you have access to the City boundary asset (see below), then click **Run**.
4. Open the **Tasks** tab to run the export jobs.

### Using the City asset

The script reads `projects/ee-faseehtahir105/assets/Gujranwala_City`. If you are not that
account, upload your own Gujranwala City tehsil shapefile as an asset and replace the path in
section 2a. Sharing the asset publicly (Asset Manager → Share → "Anyone can read") lets others
run the script unchanged. A copy of the shapefile can also go in `data/`.

## Repository structure

```
.
├── README.md
├── LICENSE
├── .gitignore
├── scripts/
│   └── gujranwala_healthcare_analysis.js
├── data/            # optional: boundary shapefile, exported outputs
└── docs/
    └── methodology.md
```

## Known limitations

Please read before citing any numbers from this analysis.

- **Facility coordinates are approximate.** Locations were entered by hand and should be
  verified against an authoritative source (Punjab Health Department, OpenStreetMap, or field GPS).
- **Four of five tehsils are bounding rectangles**, not real boundaries, so tehsil-wise counts for
  Wazirabad, Kamoke, Nowshera Virkan and Hafizabad are indicative only. Rectangles also overlap.
- **The side-panel statistics and interpretation text are hardcoded**, not computed. They do not
  match the facility lists in the code (the code defines 12 hospitals + 15 clinics = 27, but the
  panel splits these as 5 + 4 + 16, and its per-tehsil counts differ from the data). Compare against
  the console output of `tehsilCounts` and update the panel, or compute the values dynamically.
- Population figures (5.9 M district, per-tehsil values) are estimates, not derived from WorldPop in
  the script.
- Cost distance uses slope only (no roads, rivers or travel mode), and buffers are Euclidean.

## Roadmap

- [ ] Replace rectangle tehsils with real boundaries
- [ ] Replace hand-entered coordinates with verified facility data
- [ ] Compute side-panel statistics from the data (`evaluate()`)
- [ ] Road-network-based accessibility
- [ ] Population-weighted coverage (share of people within 5 km)

## Author

Faseeh Tahir — [github.com/faseeh-tahir-gis](https://github.com/faseeh-tahir-gis)

## License

MIT — see [LICENSE](LICENSE). Underlying datasets remain subject to their own licences.
