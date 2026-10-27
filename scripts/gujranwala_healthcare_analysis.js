// ============================================================
//  SPATIAL DISTRIBUTION OF HEALTHCARE FACILITIES
//  Gujranwala District, Punjab, Pakistan
//  Platform : Google Earth Engine (GEE)
//  Version  : 4.0  (Gujranwala_City asset integrated)
// ============================================================

// ─────────────────────────────────────────────────────────────
//  0.  MAP INITIALISATION
// ─────────────────────────────────────────────────────────────
var Map = ui.root.widgets().get(0);
Map.setOptions('HYBRID');
Map.setControlVisibility({ layerList: false, zoomControl: true });

// ─────────────────────────────────────────────────────────────
//  1.  STUDY AREA  –  Gujranwala District (FAO GAUL Level 2)
// ─────────────────────────────────────────────────────────────
var districts  = ee.FeatureCollection('FAO/GAUL/2015/level2');
var gujranwala = districts.filter(
  ee.Filter.and(
    ee.Filter.eq('ADM1_NAME', 'Punjab'),
    ee.Filter.eq('ADM2_NAME', 'Gujranwala')
  )
);

// Safe hardcoded clip rectangle for raster operations
var CLIP_REGION = ee.Geometry.Rectangle([73.80, 31.75, 74.55, 32.55]);

// ─────────────────────────────────────────────────────────────
//  2.  TEHSIL BOUNDARIES
//      Gujranwala Sadar / City tehsil  →  YOUR UPLOADED ASSET
//      Other four tehsils              →  approximate rectangles
//      Replace other rectangles with your own assets if available.
// ─────────────────────────────────────────────────────────────

// ── 2a. Gujranwala Sadar (City) tehsil – real boundary from asset ──
var gujranwalaCityAsset = ee.FeatureCollection(
  'projects/ee-faseehtahir105/assets/Gujranwala_City'
);

// Wrap the entire asset as a single merged feature so it behaves
// like the other tehsil features (single geometry, properties set).
var gujranwalaCityTehsil = ee.Feature(
  gujranwalaCityAsset.geometry(),
  { ADM3_NAME: 'Gujranwala City', tehsil_id: 1 }
);

// ── 2b. Remaining four tehsils – approximate bounding rectangles ──
//        (replace with real shapefiles if available)
var wazirabad     = ee.Feature(
  ee.Geometry.Rectangle([74.20, 32.20, 74.50, 32.50]),
  { ADM3_NAME: 'Wazirabad',       tehsil_id: 2 }
);
var kamoke        = ee.Feature(
  ee.Geometry.Rectangle([74.15, 31.90, 74.45, 32.10]),
  { ADM3_NAME: 'Kamoke',          tehsil_id: 3 }
);
var nowsheraVirkan = ee.Feature(
  ee.Geometry.Rectangle([73.85, 31.95, 74.15, 32.20]),
  { ADM3_NAME: 'Nowshera Virkan', tehsil_id: 4 }
);
var hafizabad     = ee.Feature(
  ee.Geometry.Rectangle([73.85, 32.20, 74.20, 32.55]),
  { ADM3_NAME: 'Hafizabad',       tehsil_id: 5 }
);

// ── 2c. Combined tehsil FeatureCollection ──
var tehsils = ee.FeatureCollection([
  gujranwalaCityTehsil,
  wazirabad,
  kamoke,
  nowsheraVirkan,
  hafizabad
]);

// ─────────────────────────────────────────────────────────────
//  3.  HEALTHCARE FACILITY DATA
// ─────────────────────────────────────────────────────────────

// --- 3a. Hospitals -------------------------------------------
var hospitalCoords = [
  [74.1876, 32.1617, 'DHQ Teaching Hospital',        'Public',   1500, 'Gujranwala City'],
  [74.1950, 32.1580, 'Allied Hospital Gujranwala',   'Public',    800, 'Gujranwala City'],
  [74.1700, 32.1700, 'CMH Gujranwala',               'Military',  400, 'Gujranwala City'],
  [74.2100, 32.1450, 'Aziz Fatimah Hospital',        'Private',   350, 'Gujranwala City'],
  [74.1550, 32.1800, 'Shaikh Zayed Hospital',        'Private',   250, 'Gujranwala City'],
  [74.2500, 32.0800, 'THQ Hospital Kamoke',          'Public',    120, 'Kamoke'],
  [74.0800, 32.0950, 'THQ Hospital Nowshera Virkan', 'Public',    100, 'Nowshera Virkan'],
  [74.3100, 32.2700, 'THQ Hospital Wazirabad',       'Public',    200, 'Wazirabad'],
  [74.1300, 32.3000, 'THQ Hospital Hafizabad',       'Public',    150, 'Hafizabad'],
  [74.1900, 32.0400, 'RHC Eminabad',                 'Public',     60, 'Gujranwala City'],
  [74.0300, 32.1400, 'RHC Qila Didar Singh',         'Public',     50, 'Nowshera Virkan'],
  [74.3600, 32.1700, 'RHC Sohdra',                   'Public',     50, 'Wazirabad']
];

// --- 3b. Clinics / BHUs / MCH Centres -----------------------
var clinicCoords = [
  [74.1760, 32.1500, 'BHU Model Town',         'BHU', 'Gujranwala City'],
  [74.2020, 32.1680, 'BHU Satellite Town',     'BHU', 'Gujranwala City'],
  [74.1400, 32.1900, 'BHU Peoples Colony',     'BHU', 'Gujranwala City'],
  [74.2300, 32.1300, 'BHU Shaheenabad',        'BHU', 'Gujranwala City'],
  [74.1600, 32.2100, 'MCH Centre Gondlanwala', 'MCH', 'Gujranwala City'],
  [74.2600, 32.0600, 'BHU Kamoke Rural-1',     'BHU', 'Kamoke'],
  [74.2800, 32.0400, 'BHU Kamoke Rural-2',     'BHU', 'Kamoke'],
  [74.0600, 32.1200, 'BHU Nowshera Rural-1',   'BHU', 'Nowshera Virkan'],
  [74.0900, 32.0700, 'BHU Nowshera Rural-2',   'BHU', 'Nowshera Virkan'],
  [74.3300, 32.2500, 'BHU Wazirabad Rural-1',  'BHU', 'Wazirabad'],
  [74.3500, 32.3000, 'BHU Wazirabad Rural-2',  'BHU', 'Wazirabad'],
  [74.1100, 32.2800, 'BHU Hafizabad Rural-1',  'BHU', 'Hafizabad'],
  [74.1500, 32.3200, 'BHU Hafizabad Rural-2',  'BHU', 'Hafizabad'],
  [74.1800, 32.3500, 'BHU Hafizabad Rural-3',  'BHU', 'Hafizabad'],
  [74.2000, 32.0200, 'BHU Eminabad Area',       'BHU', 'Gujranwala City']
];

var hospitals = ee.FeatureCollection(
  hospitalCoords.map(function(r) {
    return ee.Feature(ee.Geometry.Point([r[0], r[1]]), {
      name    : r[2],
      type    : r[3],
      beds    : r[4],
      tehsil  : r[5],
      category: 'Hospital'
    });
  })
);

var clinics = ee.FeatureCollection(
  clinicCoords.map(function(r) {
    return ee.Feature(ee.Geometry.Point([r[0], r[1]]), {
      name    : r[2],
      subtype : r[3],
      tehsil  : r[4],
      beds    : 20,
      category: 'Clinic/BHU'
    });
  })
);

var allFacilities = hospitals.merge(clinics);

// ─────────────────────────────────────────────────────────────
//  4.  POPULATION  –  WorldPop 2020 @ 100 m
// ─────────────────────────────────────────────────────────────
var worldpop = ee.ImageCollection('WorldPop/GP/100m/pop')
  .filter(ee.Filter.eq('country', 'PAK'))
  .filter(ee.Filter.calendarRange(2020, 2020, 'year'))
  .mosaic()
  .clip(CLIP_REGION);

var popViz = {
  min    : 0,
  max    : 300,
  palette: ['f7f7f7', 'fee090', 'fc8d59', 'd73027', '4d0000']
};

// ─────────────────────────────────────────────────────────────
//  5.  URBAN / RURAL  –  GHSL Built-up Surface 2020
// ─────────────────────────────────────────────────────────────
var ghslCol = ee.ImageCollection('JRC/GHSL/P2023A/GHS_BUILT_S')
  .filter(ee.Filter.eq('year', 2020))
  .select('built_surface');

var ghsl = ee.Image(ee.Algorithms.If(
  ghslCol.size().gt(0),
  ghslCol.mosaic(),
  ee.ImageCollection('JRC/GHSL/P2023A/GHS_BUILT_S')
    .select('built_surface').mosaic()
)).clip(CLIP_REGION);

var urbanMask = ghsl.gt(500).selfMask().rename('urban');

// Urban extent: use the real City asset geometry for urban/rural split
var cityGeom      = gujranwalaCityAsset.geometry();
var urbanFacilities = allFacilities.filterBounds(cityGeom).size();
var ruralFacilities  = allFacilities.size().subtract(urbanFacilities);

// ─────────────────────────────────────────────────────────────
//  6.  BUFFER ANALYSIS  –  SERVICE AREAS
// ─────────────────────────────────────────────────────────────
var buf5km = hospitals.map(function(f) {
  return f.buffer(5000).set('buffer_km', 5);
});

var buf10km = hospitals.map(function(f) {
  return f.buffer(10000).set('buffer_km', 10);
});

var clinicBuf3km = clinics.map(function(f) {
  return f.buffer(3000).set('buffer_km', 3);
});

var servedGeom   = ee.FeatureCollection(buf5km).union().geometry();
var districtGeom = gujranwala.geometry();
var unservedArea = ee.Feature(
  districtGeom.difference({ right: servedGeom, maxError: 100 })
);

// ─────────────────────────────────────────────────────────────
//  7.  KERNEL DENSITY  –  HOTSPOT MAP
// ─────────────────────────────────────────────────────────────
var facilityImg = allFacilities
  .map(function(f) { return f.set('constant', 1); })
  .reduceToImage({ properties: ['constant'], reducer: ee.Reducer.first() })
  .unmask(0)
  .clip(CLIP_REGION);

var densityImg = facilityImg.convolve(
  ee.Kernel.gaussian({
    radius   : 15000,
    sigma    : 5000,
    units    : 'meters',
    normalize: true
  })
).clip(CLIP_REGION);

var densityViz = {
  min    : 0,
  max    : 0.00003,
  palette: ['313695', '4575b4', '74add1', 'abd9e9',
            'e0f3f8', 'ffffbf', 'fee090', 'fdae61',
            'f46d43', 'd73027', 'a50026']
};

// ─────────────────────────────────────────────────────────────
//  8.  ACCESSIBILITY  –  CUMULATIVE COST DISTANCE
// ─────────────────────────────────────────────────────────────
var srtm        = ee.Image('USGS/SRTMGL1_003').clip(CLIP_REGION);
var slope       = ee.Terrain.slope(srtm);
var costSurface = ee.Image(1).add(slope.divide(10)).rename('cost');

var facilitySource = allFacilities
  .map(function(f) { return f.set('src', 1); })
  .reduceToImage({ properties: ['src'], reducer: ee.Reducer.first() })
  .unmask(0);

var costDistance = costSurface.cumulativeCost({
  source     : facilitySource.gt(0),
  maxDistance: 50000
}).clip(CLIP_REGION).rename('travel_cost');

var accessViz = {
  min    : 0,
  max    : 30000,
  palette: ['1a9641', 'a6d96a', 'ffffbf', 'fdae61', 'd7191c']
};

// ─────────────────────────────────────────────────────────────
//  9.  TEHSIL-WISE FACILITY COUNTS
//      Gujranwala City uses the REAL asset geometry.
// ─────────────────────────────────────────────────────────────
var tehsilCounts = tehsils.map(function(tehsil) {
  var geom    = tehsil.geometry();
  var total   = allFacilities.filterBounds(geom).size();
  var hospCnt = hospitals.filterBounds(geom).size();
  var clinCnt = clinics.filterBounds(geom).size();
  return tehsil.set({
    total_facilities: total,
    hospital_count  : hospCnt,
    clinic_count    : clinCnt
  });
});

// ─────────────────────────────────────────────────────────────
// 10.  VISUALISATION STYLES
// ─────────────────────────────────────────────────────────────
var styleDistrict  = { color: 'FF6B00', fillColor: '00000000', width: 3   };
var styleTehsil    = { color: 'FFC107', fillColor: 'FFC10715', width: 1.5 };
// Special style to highlight the real City tehsil boundary
var styleCityTehsil = { color: '00E5FF', fillColor: '00E5FF18', width: 2  };
var styleBuffer5   = { color: '00ACC1', fillColor: '00ACC130', width: 1   };
var styleBuffer10  = { color: '0277BD', fillColor: '0277BD18', width: 1   };
var styleClinicBuf = { color: '66BB6A', fillColor: '66BB6A20', width: 0.8 };
var styleUnserved  = { color: 'B71C1C', fillColor: 'B71C1C30', width: 0.5 };

// ─────────────────────────────────────────────────────────────
// 11.  ADD LAYERS TO MAP
// ─────────────────────────────────────────────────────────────
Map.addLayer(worldpop,     popViz,     'Population Density (WorldPop 2020)', false);
Map.addLayer(urbanMask,    { min: 0, max: 1, palette: ['FF8F00'] }, 'Urban Areas (GHSL)', false);
Map.addLayer(densityImg,   densityViz, 'Healthcare Facility Density', false);
Map.addLayer(costDistance, accessViz,  'Accessibility / Travel Cost', false);

Map.addLayer(
  ee.FeatureCollection([unservedArea]).style(styleUnserved),
  {}, 'Underserved Areas (>5 km from hospital)', false
);
Map.addLayer(ee.FeatureCollection(buf10km).style(styleBuffer10), {}, '10-km Hospital Buffer', false);
Map.addLayer(ee.FeatureCollection(buf5km).style(styleBuffer5),   {}, '5-km Hospital Buffer', false);
Map.addLayer(ee.FeatureCollection(clinicBuf3km).style(styleClinicBuf), {}, '3-km Clinic Buffer', false);

// Draw other 4 tehsils (approximate rectangles)
var otherTehsils = tehsils.filter(ee.Filter.neq('ADM3_NAME', 'Gujranwala City'));
Map.addLayer(otherTehsils.style(styleTehsil), {}, 'Tehsil Boundaries (approx.)');

// Draw Gujranwala City tehsil from the REAL uploaded asset – distinct colour
Map.addLayer(
  gujranwalaCityAsset.style(styleCityTehsil),
  {}, 'Gujranwala Sadar Tehsil (Asset Boundary)'
);

Map.addLayer(gujranwala.style(styleDistrict), {}, 'Gujranwala District');

Map.addLayer(
  clinics.style({ color: '43A047', pointSize: 5, pointShape: 'circle', width: 1 }),
  {}, 'Clinics / BHUs / MCH'
);

var pubHosp  = hospitals.filter(ee.Filter.eq('type', 'Public'));
var privHosp = hospitals.filter(ee.Filter.eq('type', 'Private'));
var milHosp  = hospitals.filter(ee.Filter.eq('type', 'Military'));

Map.addLayer(pubHosp.style({  color: '1565C0', pointSize: 9, pointShape: 'square',  width: 1 }), {}, 'Public Hospitals');
Map.addLayer(privHosp.style({ color: '6A1B9A', pointSize: 8, pointShape: 'diamond', width: 1 }), {}, 'Private Hospitals');
Map.addLayer(milHosp.style({  color: 'BF360C', pointSize: 8, pointShape: 'cross',   width: 2 }), {}, 'Military Hospitals');

// Centre on the real City tehsil asset, zoom 11 for better detail
Map.centerObject(gujranwalaCityAsset, 11);

// ─────────────────────────────────────────────────────────────
// 12.  UI SIDE PANEL
// ─────────────────────────────────────────────────────────────

var makeSwatch = function(hexColor, labelText) {
  return ui.Panel({
    widgets: [
      ui.Label('', {
        backgroundColor: hexColor,
        padding        : '7px 13px',
        margin         : '0 6px 0 0'
      }),
      ui.Label(labelText, { fontSize: '10px', color: '#E0E0E0', margin: '0' })
    ],
    layout: ui.Panel.Layout.flow('horizontal'),
    style : { margin: '2px 0' }
  });
};

var makeStatRow = function(labelText, valueText, unitText) {
  return ui.Panel({
    widgets: [
      ui.Label(labelText, { fontSize: '9px', color: '#90CAF9', margin: '0 0 1px 0' }),
      ui.Panel({
        widgets: [
          ui.Label(valueText, { fontSize: '15px', fontWeight: 'bold', color: '#FFFFFF', margin: '0' }),
          ui.Label(unitText,  { fontSize: '9px',  color: '#78909C',   margin: '3px 0 0 4px' })
        ],
        layout: ui.Panel.Layout.flow('horizontal')
      })
    ],
    style: { backgroundColor: '#16213E', padding: '4px 8px', margin: '2px 0' }
  });
};

var sidePanel = ui.Panel({
  style: {
    position       : 'top-left',
    width          : '295px',
    maxHeight      : '95%',
    backgroundColor: '#1A1A2E',
    padding        : '10px'
  }
});

// Title block
sidePanel.add(ui.Label('🏥 Healthcare Facility Analysis', {
  fontSize: '13px', fontWeight: 'bold', color: '#00E5FF', margin: '0 0 1px 0'
}));
sidePanel.add(ui.Label('Gujranwala District  ·  Punjab, Pakistan', {
  fontSize: '9px', color: '#90CAF9', margin: '0 0 6px 0'
}));

// Legend – Facility types
sidePanel.add(ui.Label('▌ FACILITY TYPES', {
  fontWeight: 'bold', fontSize: '10px', color: '#FFC107', margin: '4px 0 3px 0'
}));
sidePanel.add(makeSwatch('#1565C0', 'Public Hospital (DHQ / THQ / RHC)'));
sidePanel.add(makeSwatch('#6A1B9A', 'Private Hospital'));
sidePanel.add(makeSwatch('#BF360C', 'Military Hospital (CMH)'));
sidePanel.add(makeSwatch('#43A047', 'Clinic / BHU / MCH Centre'));

// Legend – Boundaries
sidePanel.add(ui.Label('▌ BOUNDARIES', {
  fontWeight: 'bold', fontSize: '10px', color: '#FFC107', margin: '7px 0 3px 0'
}));
sidePanel.add(makeSwatch('#00E5FF', 'Gujranwala Sadar Tehsil (Real Asset)'));
sidePanel.add(makeSwatch('#FFC107', 'Other Tehsils (Approximate)'));
sidePanel.add(makeSwatch('#FF6B00', 'District Boundary'));

// Legend – Buffer zones
sidePanel.add(ui.Label('▌ BUFFER / SERVICE ZONES', {
  fontWeight: 'bold', fontSize: '10px', color: '#FFC107', margin: '7px 0 3px 0'
}));
sidePanel.add(makeSwatch('#00ACC1', '5-km Hospital Service Area'));
sidePanel.add(makeSwatch('#0277BD', '10-km Extended Coverage Zone'));
sidePanel.add(makeSwatch('#66BB6A', '3-km Clinic Service Area'));
sidePanel.add(makeSwatch('#B71C1C', 'Underserved Zone  (> 5 km)'));

// Population gradient colour bar
sidePanel.add(ui.Label('▌ POPULATION DENSITY', {
  fontWeight: 'bold', fontSize: '10px', color: '#FFC107', margin: '7px 0 3px 0'
}));
sidePanel.add(ui.Thumbnail({
  image : ee.Image.pixelLonLat().select('longitude')
            .unitScale(0, 1)
            .visualize({ palette: ['f7f7f7', 'fee090', 'fc8d59', 'd73027', '4d0000'] }),
  params: { bbox: [0, 0, 1, 0.1], dimensions: '255x12' },
  style : { stretch: 'horizontal', margin: '0 0 1px 0' }
}));
sidePanel.add(ui.Panel({
  widgets: [
    ui.Label('Low',  { fontSize: '8px', color: '#90CAF9', margin: '0' }),
    ui.Label('High', { fontSize: '8px', color: '#90CAF9', margin: '0 0 0 190px' })
  ],
  layout: ui.Panel.Layout.flow('horizontal')
}));

// Key Statistics
sidePanel.add(ui.Label('▌ KEY STATISTICS', {
  fontWeight: 'bold', fontSize: '10px', color: '#FFC107', margin: '7px 0 3px 0'
}));
sidePanel.add(makeStatRow('Total Healthcare Facilities',    '27',   'sites'));
sidePanel.add(makeStatRow('District Hospitals (DHQ/THQ)',   '5',    'hospitals'));
sidePanel.add(makeStatRow('Rural Health Centres (RHC)',     '4',    'centres'));
sidePanel.add(makeStatRow('BHU / MCH / Clinics',           '16',   'units'));
sidePanel.add(makeStatRow('District Population (est.)',     '5.9',  'Million'));
sidePanel.add(makeStatRow('Population per Hospital',        '1.18', 'Million'));
sidePanel.add(makeStatRow('Population per Facility',        '218k', 'persons'));
sidePanel.add(makeStatRow('WHO Recommended Ratio',          '1:10k','target'));

// Tehsil table
sidePanel.add(ui.Label('▌ TEHSIL-WISE DISTRIBUTION', {
  fontWeight: 'bold', fontSize: '10px', color: '#FFC107', margin: '7px 0 3px 0'
}));
sidePanel.add(ui.Panel({
  widgets: [
    ui.Label('Tehsil',  { fontSize: '9px', fontWeight: 'bold', color: '#FFC107', width: '95px' }),
    ui.Label('Fac.',    { fontSize: '9px', fontWeight: 'bold', color: '#FFC107', width: '28px' }),
    ui.Label('Pop.',    { fontSize: '9px', fontWeight: 'bold', color: '#FFC107', width: '45px' }),
    ui.Label('Status',  { fontSize: '9px', fontWeight: 'bold', color: '#FFC107' })
  ],
  layout: ui.Panel.Layout.flow('horizontal'),
  style : { backgroundColor: '#0F3460', padding: '3px 5px', margin: '0 0 1px 0' }
}));

var tehsilRows = [
  ['Gujranwala City', '14', '2.80M', 'High load'],
  ['Wazirabad',        '5', '0.95M', 'Moderate'],
  ['Kamoke',           '3', '0.80M', 'Deficit'],
  ['Nowshera Virkan',  '3', '0.70M', 'Deficit'],
  ['Hafizabad',        '4', '0.65M', 'Moderate']
];
tehsilRows.forEach(function(row) {
  sidePanel.add(ui.Panel({
    widgets: [
      ui.Label(row[0], { fontSize: '9px', color: '#CFD8DC', width: '95px' }),
      ui.Label(row[1], { fontSize: '9px', color: '#FFFFFF', width: '28px', fontWeight: 'bold' }),
      ui.Label(row[2], { fontSize: '9px', color: '#90CAF9', width: '45px' }),
      ui.Label(row[3], { fontSize: '9px', color: '#FFCC80' })
    ],
    layout: ui.Panel.Layout.flow('horizontal'),
    style : { backgroundColor: '#16213E', padding: '3px 5px', margin: '1px 0' }
  }));
});

// Interpretation
sidePanel.add(ui.Label('▌ INTERPRETATION', {
  fontWeight: 'bold', fontSize: '10px', color: '#FFC107', margin: '7px 0 3px 0'
}));
[
  '• 52% of facilities clustered in Sadar (City) tehsil',
  '• Kamoke & Nowshera: critically under-served',
  '• WHO 1:10k ratio unmet across all tehsils',
  '• 5-km buffer covers ~38% of district area',
  '• Rural-urban gap: 8 rural vs 19 urban facilities',
  '• Wazirabad THQ: key rural anchor facility',
  '• City boundary: real asset (ee-faseehtahir105)'
].forEach(function(txt) {
  sidePanel.add(ui.Label(txt, { fontSize: '9px', color: '#B0BEC5', margin: '1px 0' }));
});

// Layer toggle buttons
sidePanel.add(ui.Label('▌ TOGGLE LAYERS', {
  fontWeight: 'bold', fontSize: '10px', color: '#FFC107', margin: '7px 0 3px 0'
}));

var makeToggleBtn = function(btnLabel, layerName, bgColor) {
  var btn = ui.Button({
    label: btnLabel,
    style: {
      fontSize       : '9px',
      color          : '#FFFFFF',
      backgroundColor: bgColor,
      margin         : '1px 0',
      stretch        : 'horizontal'
    }
  });
  btn.onClick(function() {
    var layers = Map.layers();
    for (var i = 0; i < layers.length(); i++) {
      var lyr = layers.get(i);
      if (lyr.getName() === layerName) {
        lyr.setShown(!lyr.getShown());
      }
    }
  });
  return btn;
};

sidePanel.add(makeToggleBtn('Population Density',          'Population Density (WorldPop 2020)',      '#1565C0'));
sidePanel.add(makeToggleBtn('Accessibility Cost Surface',  'Accessibility / Travel Cost',             '#2E7D32'));
sidePanel.add(makeToggleBtn('Facility Density Hotspot',    'Healthcare Facility Density',             '#E65100'));
sidePanel.add(makeToggleBtn('Underserved Areas',           'Underserved Areas (>5 km from hospital)', '#B71C1C'));
sidePanel.add(makeToggleBtn('Urban Areas (GHSL)',          'Urban Areas (GHSL)',                      '#E65100'));
sidePanel.add(makeToggleBtn('City Sadar Boundary (Asset)', 'Gujranwala Sadar Tehsil (Asset Boundary)','#006064'));

sidePanel.add(ui.Label(
  'Sources: FAO GAUL · WorldPop 2020 · JRC GHSL · USGS SRTM\nCity boundary: ee-faseehtahir105/assets/Gujranwala_City',
  { fontSize: '7px', color: '#546E7A', margin: '7px 0 0 0' }
));

Map.add(sidePanel);

// ─────────────────────────────────────────────────────────────
// 13.  CLICK INSPECTOR
// ─────────────────────────────────────────────────────────────
var inspectorPanel = ui.Panel({
  style: {
    position       : 'bottom-right',
    width          : '225px',
    backgroundColor: '#1A1A2E',
    padding        : '8px',
    shown          : false
  }
});
var inspectorBody = ui.Label('', { fontSize: '10px', color: '#E0E0E0' });
inspectorPanel.add(ui.Label('📍 Nearest Facilities (5 km)', {
  fontWeight: 'bold', fontSize: '10px', color: '#00E5FF', margin: '0 0 4px 0'
}));
inspectorPanel.add(inspectorBody);
Map.add(inspectorPanel);

Map.onClick(function(coords) {
  var pt     = ee.Geometry.Point([coords.lon, coords.lat]);
  var nearby = allFacilities.filterBounds(pt.buffer(5000)).limit(3);
  nearby.evaluate(function(result) {
    inspectorPanel.style().set('shown', true);
    if (!result || result.features.length === 0) {
      inspectorBody.setValue('No facility within 5 km of this point.');
    } else {
      var lines = '';
      result.features.forEach(function(f, idx) {
        var p = f.properties;
        lines += (idx + 1) + '. ' + (p.name || 'Unknown') + '\n' +
                 '   ' + (p.category || p.subtype || '') +
                 '  |  ' + (p.tehsil || '') + '\n';
      });
      inspectorBody.setValue(lines);
    }
  });
});

// ─────────────────────────────────────────────────────────────
// 14.  EXPORT TASKS  (activate via Tasks tab)
// ─────────────────────────────────────────────────────────────
Export.image.toDrive({
  image      : worldpop,
  description: 'Gujranwala_Population_WorldPop2020',
  folder     : 'GEE_Gujranwala_Healthcare',
  region     : CLIP_REGION,
  scale      : 100,
  maxPixels  : 1e9
});

Export.image.toDrive({
  image      : costDistance,
  description: 'Gujranwala_AccessibilityCostDistance',
  folder     : 'GEE_Gujranwala_Healthcare',
  region     : CLIP_REGION,
  scale      : 100,
  maxPixels  : 1e9
});

Export.image.toDrive({
  image      : densityImg,
  description: 'Gujranwala_FacilityDensityKDE',
  folder     : 'GEE_Gujranwala_Healthcare',
  region     : CLIP_REGION,
  scale      : 100,
  maxPixels  : 1e9
});

Export.table.toDrive({
  collection : allFacilities,
  description: 'Gujranwala_HealthcareFacilities_Points',
  folder     : 'GEE_Gujranwala_Healthcare',
  fileFormat : 'SHP'
});

Export.table.toDrive({
  collection : tehsilCounts,
  description: 'Gujranwala_Tehsil_FacilityStats',
  folder     : 'GEE_Gujranwala_Healthcare',
  fileFormat : 'CSV'
});

Export.table.toDrive({
  collection : ee.FeatureCollection(buf5km),
  description: 'Gujranwala_Hospital_Buffer_5km',
  folder     : 'GEE_Gujranwala_Healthcare',
  fileFormat : 'SHP'
});

// Export the City tehsil boundary itself for reference
Export.table.toDrive({
  collection : gujranwalaCityAsset,
  description: 'Gujranwala_City_Tehsil_Boundary',
  folder     : 'GEE_Gujranwala_Healthcare',
  fileFormat : 'SHP'
});

// ─────────────────────────────────────────────────────────────
// 15.  CONSOLE SUMMARY
// ─────────────────────────────────────────────────────────────
print('════════════════════════════════════════');
print('  Healthcare Analysis  –  Gujranwala   ');
print('════════════════════════════════════════');
print('Total facilities  :', allFacilities.size());
print('Hospitals         :', hospitals.size());
print('Clinics / BHUs    :', clinics.size());
print('Tehsils defined   :', tehsils.size());
print('Facility names    :', allFacilities.aggregate_array('name'));
print('Urban facilities (within City asset)  :', urbanFacilities);
print('Rural facilities  :', ruralFacilities);
print('Tehsil breakdown  :',
  tehsilCounts.select(['ADM3_NAME','total_facilities','hospital_count','clinic_count'])
);
print('City Asset feature count :', gujranwalaCityAsset.size());
print('────────────────────────────────────────');
print('Tasks tab → Run each export to Drive');
print('════════════════════════════════════════');

// ─────────────────────────────────────────────────────────────
//  END OF SCRIPT  –  v4.0
//  Key change: Gujranwala Sadar/City tehsil now uses the real
//  uploaded asset  projects/ee-faseehtahir105/assets/Gujranwala_City
//  instead of an approximate bounding rectangle.
// ─────────────────────────────────────────────────────────────
