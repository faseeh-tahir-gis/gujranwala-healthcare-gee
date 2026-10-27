# Methodology

1. **Study area** – FAO GAUL 2015 Level 2, filtered to Gujranwala (Punjab).
2. **Facilities** – hand-entered point features with name, type, beds and tehsil.
3. **Service areas** – `buffer()` of 5 km / 10 km around hospitals, 3 km around clinics. The union of
   5 km buffers is subtracted from the district polygon to obtain underserved areas.
4. **Kernel density** – facility points rasterised, then convolved with a Gaussian kernel
   (radius 15 km, sigma 5 km).
5. **Accessibility** – cost surface = 1 + slope/10 (SRTM), `cumulativeCost()` from all facilities,
   max distance 50 km.
6. **Urban / rural** – facilities inside the City tehsil asset are treated as urban; the rest rural.
   GHSL built surface > 500 m² per cell gives a visual urban mask.
7. **Tehsil counts** – `filterBounds()` of facilities against each tehsil geometry.
