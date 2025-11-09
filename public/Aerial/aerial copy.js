const LAYERS_SPECS = {
    turf: {
        label: 'Turf',
        icon: "■",
        color: '#4ade80',
        geometryType: 'Polygon'  // Added
    },
    turf30: { label: 'Turf-30', icon: '■', color: '#7ee7a4', geometryType: 'Polygon' },
    turf48: { label: 'Turf-48', icon: '■', color: '#93ebb4', geometryType: 'Polygon' },
    turf60: { label: 'Turf-60', icon: '■', color: '#a9efc3', geometryType: 'Polygon' },
    mulchBeds: {
        label: "Mulch Beds",
        icon: "■",
        color: '#92400e',
        geometryType: 'Polygon'  // Added
    },
    softEdge: {
        label: 'Soft Edge',
        color: '#84cc16',
        icon: '╱',
        geometryType: 'LineString'  // Added
    },
    hardEdge: {
        label: 'Hard Edge',
        color: '#737373',
        icon: '╱',
        geometryType: 'LineString'  // Added
    },
    trimEdge: {
        label: 'Trim Edge',
        color: '#84cc16',
        icon: '╱',
        geometryType: 'LineString'  // Added
    },
    flowerBeds: {
        label: 'Flower Beds',
        color: '#f472b6',
        icon: '■',
        geometryType: 'Polygon'  // Added
    },
    hedge: {
        label: 'Hedge',
        color: '#22c55e',
        icon: '■',
        geometryType: 'Polygon'  // Added
    },
    tree: {
        label: 'Tree',
        color: '#15803d',
        icon: '○',
        geometryType: 'Point'  // Added
    },
    palmTree: {
        label: 'Palm Tree',
        color: '#65a30d',
        icon: '○',
        geometryType: 'Point'  // Added
    },
    rockBeds: {
        label: 'Rock Beds',
        color: '#78716c',
        icon: '■',
        geometryType: 'Polygon'  // Added
    },
    retentionPonds: {
        label: 'Retention Ponds',
        color: '#0ea5e9',
        icon: '■',
        geometryType: 'Polygon'  // Added
    },
    waterBody: {
        label: 'Water Body',
        color: '#38bdf8',
        icon: '■',
        geometryType: 'Polygon'  // Added
    },
    sidewalks: {
        label: 'All Sidewalks',
        color: '#94a3b8',
        icon: '■',
        geometryType: 'Polygon'  // Added
    },
    privateSidewalks: {
        label: 'Private Sidewalks',
        color: '#cbd5e1',
        icon: '■',
        geometryType: 'Polygon'  // Added
    },
    parkingLots: {
        label: "Parking Area",
        color: "#FFD700",
        icon: "■",
        geometryType: 'Polygon'  // Added
    },
    buildings: {
        label: "Building Footprint",
        color: "#FFA500",
        icon: '■',
        geometryType: 'Polygon'  // Added
    },
    roadside: {
        label: "Road Side / Pavement",
        color: "#8c8c8c",
        icon: '■',
        geometryType: 'Polygon'  // Added

    },
    publicSidewalks: {
        label: 'Public Sidewalks',
        color: '#e2e8f0',
        icon: '■',
        geometryType: 'Polygon'  // Added
    },
    retentionbesin: {
        label: 'Retension Besin',
        color: "#8c8c8c",
        icon: "■",
        geometryType: 'Polygon'  // Added

    }
};

const OVERPASS_LAYER_MAPPING = {
    turf: { type: 'way', tag: 'landuse', value: 'grass' },
    mulchBeds: { type: 'way', tag: 'natural', value: 'scrub' },
    softEdge: { type: 'way', tag: 'highway', value: 'path' },
    hardEdge: { type: 'way', tag: 'highway', value: 'track' },
    trimEdge: { type: 'way', tag: 'highway', value: 'path' },
    flowerBeds: { type: 'way', tag: 'landuse', value: 'flowerbed' },
    hedge: { type: 'way', tag: 'natural', value: 'hedge' },
    tree: { type: 'node', tag: 'natural', value: 'tree' },
    palmTree: { type: 'node', tag: 'natural', value: 'tree' },
    rockBeds: { type: 'way', tag: 'landuse', value: 'rock' },
    retentionPonds: { type: 'way', tag: 'natural', value: 'water' },
    waterBody: { type: 'way', tag: 'natural', value: 'water' },
    sidewalks: { type: 'way', tag: 'area:highway', value: 'footway' },
    privateSidewalks: { type: 'way', tag: 'area:highway', value: 'footway' },
    parkingLots: { type: 'way', tag: 'amenity', value: 'parking' },
    buildings: { type: 'way', tag: 'building', value: '*' },
    roadside: { type: 'way', tag: 'area:highway', value: 'yes' },
    publicSidewalks: { type: 'way', tag: 'highway', value: 'footway' }
};

let map, drawInteraction, selectInteraction, modifyInteraction, vectorLayers = {}, measurements = {}, selectedLayer = null, deleteModeLayer = null, editModeLayer = null;
let history = [], redoStack = [], featureCounter = 0;

function getCookie(name) {
    let cookies = document.cookie.split("; ");
    for (let cookie of cookies) {
        let [key, value] = cookie.split("=");
        if (key === name) return decodeURIComponent(value);
    }
    return null;
}

let reference = getCookie("reference");
if (!reference) {
    alert("Select A Project And Come Back!");
    window.location.assign("index.html");
}

let dataref = firebase.database().ref(reference);

// Validate GeoJSON geometry
function isValidPolygon(coordinates) {
    if (!coordinates || !Array.isArray(coordinates) || coordinates.length === 0) return false;
    const ring = coordinates[0]; // Outer ring of the polygon
    return ring && Array.isArray(ring) && ring.length >= 4 && // At least 4 points
        ring[0][0] === ring[ring.length - 1][0] && ring[0][1] === ring[ring.length - 1][1]; // Closed ring
}

function initMap() {
    dataref.once("value").then(async function (snapshot) {
        const data = snapshot.val();
        console.log("Firebase Data:", data); // Debug Firebase data
        if (!data) {
            throw new Error("No data found in Firebase for reference: " + reference);
        }
        if (data.AdditionalNotes) {
            document.getElementById("addiNotes").innerText = data.AdditionalNotes;
        }
        const layersFromDb = data.layers || [];
        const workedGeojson = data.workedGeojson;
        const boundary = data.boundary;

        // Step 1: Identify unique layer types from workedGeojson
        const dynamicLayerTypes = new Set();
        if (workedGeojson && workedGeojson.features) {
            workedGeojson.features.forEach(feature => {
                const layerType = feature.properties?.layerType || 'turf';
                dynamicLayerTypes.add(layerType);
            });
        }

        // Step 2: Add missing layers to LAYERS_SPECS with default properties
        dynamicLayerTypes.forEach(layerType => {
            if (!LAYERS_SPECS[layerType]) {
                const feature = workedGeojson.features.find(f => f.properties.layerType === layerType);
                const geometryType = feature?.geometry.type || 'Polygon';
                LAYERS_SPECS[layerType] = {
                    label: layerType, // Use layerType directly as label
                    icon: geometryType === 'Point' ? '○' : geometryType === 'LineString' ? '╱' : '■',
                    color: feature?.properties?.style?.color || getRandomColor(),
                    geometryType: geometryType
                };
            }
        });

        // Step 3: Use layers from DB if provided, otherwise use all layers from LAYERS_SPECS
        const activeLayers = layersFromDb.length > 0 ?
            Object.fromEntries(Object.entries(LAYERS_SPECS).filter(([layerType]) => layersFromDb.includes(layerType))) :
            Object.fromEntries(Object.entries(LAYERS_SPECS));

        // Step 4: Initialize tile layer
        const tileLayer = new ol.layer.Tile({
            source: new ol.source.XYZ({
                url: 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}&key=AIzaSyC7bnAjn09Bn71fjaM1ZWP7Q2cWU7LSSdk',
                attributions: ['© Google Maps']
            })
        });

        // Step 5: Initialize vector layers for active layers
        Object.entries(activeLayers).forEach(([layerType, spec]) => {
            const source = new ol.source.Vector();
            const vectorLayer = new ol.layer.Vector({
                source,
                style: new ol.style.Style({
                    fill: new ol.style.Fill({ color: spec.color + '40' }),
                    stroke: new ol.style.Stroke({ color: spec.color, width: 2 }),
                    image: new ol.style.Circle({
                        radius: 6,
                        fill: new ol.style.Fill({ color: spec.color }),
                        stroke: new ol.style.Stroke({ color: '#ffffff', width: 2 })
                    })
                })
            });
            vectorLayers[layerType] = vectorLayer;
        });

        // Step 6: Initialize map
        map = new ol.Map({
            target: 'map',
            layers: [tileLayer, ...Object.values(vectorLayers)],
            view: new ol.View({
                center: ol.proj.fromLonLat([-82.9988, 39.9612]), // Example: Columbus, OH
                zoom: 15
            })
        });

        // Step 7: Load boundary
        if (boundary) {
            try {
                if (boundary.type === 'Polygon' && !isValidPolygon(boundary.coordinates)) {
                    console.warn("Invalid boundary polygon, skipping:", boundary);
                } else {
                    const format = new ol.format.GeoJSON();
                    const feature = format.readFeature(boundary, { dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857' });
                    feature.set('layerType', 'boundary');
                    vectorLayers['boundary'] = new ol.layer.Vector({
                        source: new ol.source.Vector({ features: [feature] }),
                        style: new ol.style.Style({
                            stroke: new ol.style.Stroke({ color: '#ff0000', width: 3 })
                        })
                    });
                    map.addLayer(vectorLayers['boundary']);
                    map.getView().fit(feature.getGeometry(), { padding: [50, 50, 50, 50], maxZoom: 14 });
                }
            } catch (error) {
                console.error("Error processing boundary:", error, boundary);
            }
        }

        // Step 8: Load workedGeojson
        if (workedGeojson) {
            try {
                const format = new ol.format.GeoJSON();
                const features = format.readFeatures(workedGeojson, { dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857' });
                featureCounter = features.length;
                features.forEach((feature) => {
                    const layerType = feature.get('layerType') || 'turf';
                    if (!vectorLayers[layerType]) {
                        console.warn(`Layer ${layerType} not found, skipping feature.`);
                        return;
                    }
                    const source = vectorLayers[layerType].getSource();
                    const featureId = feature.getId() || `feature_${featureCounter++}`;
                    feature.setId(featureId);
                    const geometry = feature.getGeometry();
                    if (geometry.getType() === 'Polygon' && !isValidPolygon(new ol.format.GeoJSON().writeGeometryObject(geometry).coordinates)) {
                        console.warn(`Invalid polygon feature in workedGeojson, skipping:`, feature.getProperties());
                        return;
                    }
                    source.addFeature(feature);
                    const spec = LAYERS_SPECS[layerType];
                    let measurement = 0;
                    if (spec && spec.geometryType === 'Polygon') {
                        const coords = geometry.getCoordinates()[0].map(c => ol.proj.toLonLat(c));
                        measurement = turf.area(turf.polygon([coords])) * 10.7639; // sq ft
                    } else if (spec && spec.geometryType === 'LineString') {
                        const coords = geometry.getCoordinates().map(c => ol.proj.toLonLat(c));
                        measurement = turf.length(turf.lineString(coords), { units: 'meters' }) * 3.28084; // ft
                    } else if (spec && spec.geometryType === 'Point') {
                        measurement = 1;
                    }
                    measurements[layerType] = (measurements[layerType] || 0) + measurement;
                    updateMeasurementDisplay(layerType);
                    history.push({ layerType, featureId, action: 'add' });
                });
            } catch (error) {
                console.error("Error processing workedGeojson:", error, workedGeojson);
            }
        }

        // Step 9: Fetch Overpass data if status is Pending
        if (data.status === 'Pending' && boundary) {
            try {
                const bbox = turf.bbox(boundary);
                const bboxFormatted = `${bbox[1]},${bbox[0]},${bbox[3]},${bbox[2]}`;
                let queryBody = '';
                layersFromDb.forEach(layer => {
                    const mapping = OVERPASS_LAYER_MAPPING[layer];
                    if (mapping) {
                        queryBody += mapping.value === '*' ?
                            `${mapping.type}["${mapping.tag}"](${bboxFormatted});\n` :
                            `${mapping.type}["${mapping.tag}"="${mapping.value}"](${bboxFormatted});\n`;
                    }
                });
                const query = `[out:json][timeout:25];(${queryBody});out body;>;out skel qt;`;
                const response = await fetch('https://overpass-api.de/api/interpreter', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: `data=${encodeURIComponent(query)}`
                });
                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
                const overpassData = await response.json();
                console.log("Overpass Data:", overpassData); // Debug Overpass data
                const geojsonData = overpassToGeoJSON(overpassData);
                addOverpassDataToMap(geojsonData);
                Object.entries(geojsonData.features).forEach(([index, feature]) => {
                    const layerType = feature.properties.featureType;
                    if (!vectorLayers[layerType]) {
                        console.warn(`Layer ${layerType} not found for Overpass feature, skipping.`);
                        return;
                    }
                    if (feature.geometry.type === 'Polygon' && !isValidPolygon(feature.geometry.coordinates)) {
                        console.warn(`Invalid polygon in Overpass data, skipping:`, feature);
                        return;
                    }
                    const source = vectorLayers[layerType].getSource();
                    const olFeature = new ol.format.GeoJSON().readFeature(feature, { dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857' });
                    const featureId = `feature_${featureCounter++}`;
                    olFeature.setId(featureId);
                    olFeature.set('layerType', layerType);
                    source.addFeature(olFeature);
                    const spec = LAYERS_SPECS[layerType];
                    const geometry = olFeature.getGeometry();
                    let measurement = 0;
                    if (spec.geometryType === 'Polygon') {
                        const coords = geometry.getCoordinates()[0].map(c => ol.proj.toLonLat(c));
                        measurement = turf.area(turf.polygon([coords])) * 10.7639; // sq ft
                    } else if (spec.geometryType === 'LineString') {
                        const coords = geometry.getCoordinates().map(c => ol.proj.toLonLat(c));
                        measurement = turf.length(turf.lineString(coords), { units: 'meters' }) * 3.28084; // ft
                    } else if (spec.geometryType === 'Point') {
                        measurement = 1;
                    }
                    measurements[layerType] = (measurements[layerType] || 0) + measurement;
                    updateMeasurementDisplay(layerType);
                });
            } catch (error) {
                console.error('Error fetching or processing Overpass API data:', error);
            }
        }

        // Step 10: Initialize layers list
        initLayersList(activeLayers);
        initControls();
        initKeyboardListeners();
    }).catch(error => {
        console.error('Error in initMap:', error);
        initLayersList(LAYERS_SPECS);
        initControls();
        initKeyboardListeners();
    }).finally(() => {
        document.getElementById('loader').style.display = 'none';
    });
}

// Helper function to generate a random color
function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function overpassToGeoJSON(overpassData) {
    const geojson = { type: 'FeatureCollection', features: [] };
    const nodes = {};
    const ways = [];
    overpassData.elements.forEach(element => {
        if (element.type === 'node') {
            nodes[element.id] = [element.lon, element.lat];
        } else if (element.type === 'way') {
            ways.push(element);
        }
    });
    overpassData.elements.forEach(element => {
        let layerName = null;
        for (const [key, spec] of Object.entries(OVERPASS_LAYER_MAPPING)) {
            if (spec.value === '*' && element.tags?.[spec.tag]) {
                layerName = key;
                break;
            } else if (element.tags?.[spec.tag] === spec.value) {
                layerName = key;
                break;
            }
        }
        if (layerName) {
            const featureType = layerName === 'buildings' ? 'building' : layerName === 'parkingLots' ? 'parking' : layerName;
            const style = LAYERS_SPECS[layerName];
            if (element.type === 'node') {
                geojson.features.push({
                    type: 'Feature',
                    geometry: { type: 'Point', coordinates: [element.lon, element.lat] },
                    properties: { featureType, stroke: style.color, 'stroke-width': 2, 'stroke-opacity': 1, fill: style.color, 'fill-opacity': 0.4 }
                });
            } else if (element.type === 'way') {
                const coordinates = element.nodes.map(nodeId => nodes[nodeId]).filter(Boolean);
                if (coordinates.length >= 4 && coordinates[0][0] === coordinates[coordinates.length - 1][0] && coordinates[0][1] === coordinates[coordinates.length - 1][1]) {
                    geojson.features.push({
                        type: 'Feature',
                        geometry: { type: 'Polygon', coordinates: [coordinates] },
                        properties: { featureType, stroke: style.color, 'stroke-width': 2, 'stroke-opacity': 1, fill: style.color, 'fill-opacity': 0.4 }
                    });
                } else if (coordinates.length >= 2) {
                    geojson.features.push({
                        type: 'Feature',
                        geometry: { type: 'LineString', coordinates },
                        properties: { featureType, stroke: style.color, 'stroke-width': 2, 'stroke-opacity': 1 }
                    });
                }
            }
        }
    });
    return geojson;
}

function addOverpassDataToMap(geojsonData) {
    window.MainGeoJsonData = geojsonData;
}

function initLayersList(activeLayers) {
    const layersList = document.getElementById('layersList');
    layersList.innerHTML = '';
    Object.entries(activeLayers).forEach(([layerType, spec]) => {
        const layerDiv = document.createElement('div');
        layerDiv.className = 'layer-item';
        layerDiv.innerHTML = `
          <div class="layer-header">
            <button class="layer-btn" data-layer="${layerType}">
              <span class="icon" style="color: ${spec.color}">${spec.icon}</span>
              <span class="label">${spec.label}</span>
              <span class="measurement" id="measurement-${layerType}"></span>
            </button>
            <button class="edit-btn" data-layer="${layerType}" title="Edit Features">
              <span class="icon">✏️</span>
            </button>
            <button class="delete-btn" data-layer="${layerType}" title="Delete Features">
              <span class="icon">🗑️</span>
            </button>
          </div>
        `;
        layersList.appendChild(layerDiv);
        const drawButton = layerDiv.querySelector('.layer-btn');
        drawButton.addEventListener('click', () => startDrawing(layerType));
        const editButton = layerDiv.querySelector('.edit-btn');
        editButton.addEventListener('click', () => startEditing(layerType));
        const deleteButton = layerDiv.querySelector('.delete-btn');
        deleteButton.addEventListener('click', () => startDeleting(layerType));
        updateMeasurementDisplay(layerType);
    });
}

function updateMeasurementDisplay(layerType) {
    const spec = LAYERS_SPECS[layerType];
    const measurementEl = document.getElementById(`measurement-${layerType}`);
    if (measurementEl && measurements[layerType]) {
        measurementEl.textContent = `${measurements[layerType].toFixed(2)} ${spec.geometryType === 'Polygon' ? 'sq ft' : spec.geometryType === 'LineString' ? 'ft' : 'N'}`;
    } else if (measurementEl && !measurements[layerType]) {
        measurementEl.textContent = '';
    }
}

function initControls() {
    document.getElementById('undo').addEventListener('click', undo);
    document.getElementById('redo').addEventListener('click', redo);
    document.getElementById('zoomIn').addEventListener('click', () => {
        const view = map.getView();
        view.setZoom((view.getZoom() || 15) + 0.5);
    });
    document.getElementById('zoomOut').addEventListener('click', () => {
        const view = map.getView();
        view.setZoom(Math.max(1, (view.getZoom() || 15) - 0.5));
    });
    document.getElementById('rotate').addEventListener('click', () => {
        const view = map.getView();
        view.setRotation(view.getRotation() + Math.PI / 2);
    });
    document.getElementById('saveButton').addEventListener('click', handleSave);
    document.getElementById('info').addEventListener('click', () => {
        document.getElementById('infopopup2').classList.toggle('show');
        document.getElementById('popup2overlay2').classList.toggle('show');
    });
    document.getElementById('closepopup2').addEventListener('click', () => {
        document.getElementById('infopopup2').classList.remove('show');
        document.getElementById('popup2overlay2').classList.remove('show');
    });
    document.getElementById('popup2overlay2').addEventListener('click', () => {
        document.getElementById('infopopup2').classList.remove('show');
        document.getElementById('popup2overlay2').classList.remove('show');
    });
}

function initKeyboardListeners() {
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            cancelDrawing();
            cancelDeleting();
            cancelEditing();
        }
    });
}

function cancelDrawing() {
    if (drawInteraction) {
        map.removeInteraction(drawInteraction);
        drawInteraction = null;
    }
    if (selectedLayer) {
        document.querySelector(`button.layer-btn[data-layer="${selectedLayer}"]`).classList.remove('active');
        selectedLayer = null;
    }
    document.getElementById('drawingNotification').classList.remove('visible');
}

function cancelDeleting() {
    if (selectInteraction) {
        map.removeInteraction(selectInteraction);
        selectInteraction = null;
    }
    if (deleteModeLayer) {
        document.querySelector(`button.delete-btn[data-layer="${deleteModeLayer}"]`).classList.remove('active');
        deleteModeLayer = null;
    }
    document.getElementById('drawingNotification').classList.remove('visible');
}

function cancelEditing() {
    if (modifyInteraction) {
        map.removeInteraction(modifyInteraction);
        modifyInteraction = null;
    }
    if (editModeLayer) {
        document.querySelector(`button.edit-btn[data-layer="${editModeLayer}"]`).classList.remove('active');
        editModeLayer = null;
    }
    document.getElementById('drawingNotification').classList.remove('visible');
}

function startDrawing(layerType) {
    if (!map || !vectorLayers[layerType]) return;
    if (drawInteraction) map.removeInteraction(drawInteraction);
    if (selectInteraction) {
        map.removeInteraction(selectInteraction);
        selectInteraction = null;
        if (deleteModeLayer) {
            document.querySelector(`button.delete-btn[data-layer="${deleteModeLayer}"]`).classList.remove('active');
            deleteModeLayer = null;
        }
    }
    if (modifyInteraction) {
        map.removeInteraction(modifyInteraction);
        modifyInteraction = null;
        if (editModeLayer) {
            document.querySelector(`button.edit-btn[data-layer="${editModeLayer}"]`).classList.remove('active');
            editModeLayer = null;
        }
    }
    document.querySelectorAll('.layer-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`button.layer-btn[data-layer="${layerType}"]`).classList.add('active');
    const spec = LAYERS_SPECS[layerType];
    const source = vectorLayers[layerType].getSource();
    const draw = new ol.interaction.Draw({
        source: source,
        type: spec.geometryType,
        style: new ol.style.Style({
            fill: new ol.style.Fill({ color: spec.color + '40' }),
            stroke: new ol.style.Stroke({ color: spec.color, width: 2 }),
            image: new ol.style.Circle({
                radius: 6,
                fill: new ol.style.Fill({ color: spec.color }),
                stroke: new ol.style.Stroke({ color: '#ffffff', width: 2 })
            })
        })
    });
    draw.on('drawend', (event) => {
        const feature = event.feature;
        const featureId = `feature_${featureCounter++}`;
        feature.setId(featureId);
        feature.set('layerType', layerType);
        const geometry = feature.getGeometry();
        let measurement = 0;
        if (spec.geometryType === 'Polygon') {
            const coords = geometry.getCoordinates()[0].map(c => ol.proj.toLonLat(c));
            if (!isValidPolygon([coords])) {
                console.warn("Drawn polygon is invalid, removing:", coords);
                source.removeFeature(feature);
                return;
            }
            measurement = turf.area(turf.polygon([coords])) * 10.7639; // sq ft
        } else if (spec.geometryType === 'LineString') {
            const coords = geometry.getCoordinates().map(c => ol.proj.toLonLat(c));
            measurement = turf.length(turf.lineString(coords), { units: 'meters' }) * 3.28084; // ft
        } else if (spec.geometryType === 'Point') {
            measurement = 1;
        }
        measurements[layerType] = (measurements[layerType] || 0) + measurement;
        updateMeasurementDisplay(layerType);
        history.push({ layerType, featureId, action: 'add' });
        redoStack = [];
        document.getElementById('drawingNotification').classList.remove('visible');
    });
    map.addInteraction(draw);
    drawInteraction = draw;
    selectedLayer = layerType;
    const notification = document.getElementById('drawingNotification');
    notification.textContent = "Press ESC to cancel drawing";
    notification.classList.add('visible');
}

function startDeleting(layerType) {
    if (!map || !vectorLayers[layerType]) return;
    if (selectInteraction) map.removeInteraction(selectInteraction);
    if (drawInteraction) {
        map.removeInteraction(drawInteraction);
        drawInteraction = null;
        if (selectedLayer) {
            document.querySelector(`button.layer-btn[data-layer="${selectedLayer}"]`).classList.remove('active');
            selectedLayer = null;
        }
    }
    if (modifyInteraction) {
        map.removeInteraction(modifyInteraction);
        modifyInteraction = null;
        if (editModeLayer) {
            document.querySelector(`button.edit-btn[data-layer="${editModeLayer}"]`).classList.remove('active');
            editModeLayer = null;
        }
    }
    document.querySelectorAll('.delete-btn').forEach(btn => btn.classList.remove('active'));
    const deleteButton = document.querySelector(`button.delete-btn[data-layer="${layerType}"]`);
    if (deleteModeLayer === layerType) {
        cancelDeleting();
        return;
    }
    deleteButton.classList.add('active');
    const source = vectorLayers[layerType].getSource();
    const select = new ol.interaction.Select({
        layers: [vectorLayers[layerType]],
        style: new ol.style.Style({
            fill: new ol.style.Fill({ color: '#ff000040' }),
            stroke: new ol.style.Stroke({ color: '#ff0000', width: 2 }),
            image: new ol.style.Circle({
                radius: 6,
                fill: new ol.style.Fill({ color: '#ff0000' }),
                stroke: new ol.style.Stroke({ color: '#ffffff', width: 2 })
            })
        })
    });
    select.on('select', (event) => {
        const selectedFeatures = event.selected;
        if (selectedFeatures.length > 0) {
            const feature = selectedFeatures[0];
            const featureId = feature.getId();
            const spec = LAYERS_SPECS[layerType];
            const geometry = feature.getGeometry();
            let measurement = 0;
            if (spec.geometryType === 'Polygon') {
                const coords = geometry.getCoordinates()[0].map(c => ol.proj.toLonLat(c));
                measurement = turf.area(turf.polygon([coords])) * 10.7639; // sq ft
            } else if (spec.geometryType === 'LineString') {
                const coords = geometry.getCoordinates().map(c => ol.proj.toLonLat(c));
                measurement = turf.length(turf.lineString(coords), { units: 'meters' }) * 3.28084; // ft
            } else if (spec.geometryType === 'Point') {
                measurement = 1;
            }
            source.removeFeature(feature);
            measurements[layerType] = (measurements[layerType] || 0) - measurement;
            if (measurements[layerType] <= 0) delete measurements[layerType];
            updateMeasurementDisplay(layerType);
            history.push({ layerType, featureId, action: 'delete', feature: feature.clone() });
            redoStack = [];
            select.getFeatures().clear();
        }
    });
    map.addInteraction(select);
    selectInteraction = select;
    deleteModeLayer = layerType;
    const notification = document.getElementById('drawingNotification');
    notification.textContent = "Click a feature to delete. Press ESC to cancel.";
    notification.classList.add('visible');
}

function startEditing(layerType) {
    if (!map || !vectorLayers[layerType]) return;
    if (modifyInteraction) map.removeInteraction(modifyInteraction);
    if (drawInteraction) {
        map.removeInteraction(drawInteraction);
        drawInteraction = null;
        if (selectedLayer) {
            document.querySelector(`button.layer-btn[data-layer="${selectedLayer}"]`).classList.remove('active');
            selectedLayer = null;
        }
    }
    if (selectInteraction) {
        map.removeInteraction(selectInteraction);
        selectInteraction = null;
        if (deleteModeLayer) {
            document.querySelector(`button.delete-btn[data-layer="${deleteModeLayer}"]`).classList.remove('active');
            deleteModeLayer = null;
        }
    }
    document.querySelectorAll('.edit-btn').forEach(btn => btn.classList.remove('active'));
    const editButton = document.querySelector(`button.edit-btn[data-layer="${layerType}"]`);
    if (editModeLayer === layerType) {
        cancelEditing();
        return;
    }
    editButton.classList.add('active');
    const source = vectorLayers[layerType].getSource();
    const modify = new ol.interaction.Modify({
        source: source,
        style: new ol.style.Style({
            fill: new ol.style.Fill({ color: '#00ff0040' }),
            stroke: new ol.style.Stroke({ color: '#00ff00', width: 2 }),
            image: new ol.style.Circle({
                radius: 6,
                fill: new ol.style.Fill({ color: '#00ff00' }),
                stroke: new ol.style.Stroke({ color: '#ffffff', width: 2 })
            })
        })
    });
    modify.on('modifyend', (event) => {
        const features = event.features.getArray();
        if (features.length > 0) {
            const feature = features[0];
            const featureId = feature.getId();
            const spec = LAYERS_SPECS[layerType];
            const geometry = feature.getGeometry();
            let newMeasurement = 0;
            if (spec.geometryType === 'Polygon') {
                const coords = geometry.getCoordinates()[0].map(c => ol.proj.toLonLat(c));
                if (!isValidPolygon([coords])) {
                    console.warn("Modified polygon is invalid, reverting:", coords);
                    source.removeFeature(feature);
                    history.push({ layerType, featureId, action: 'delete', feature: feature.clone() });
                    return;
                }
                newMeasurement = turf.area(turf.polygon([coords])) * 10.7639; // sq ft
            } else if (spec.geometryType === 'LineString') {
                const coords = geometry.getCoordinates().map(c => ol.proj.toLonLat(c));
                newMeasurement = turf.length(turf.lineString(coords), { units: 'meters' }) * 3.28084; // ft
            } else if (spec.geometryType === 'Point') {
                newMeasurement = 1;
            }
            // Update measurements
            const oldFeature = feature.clone();
            oldFeature.setGeometry(feature.getGeometry().clone());
            const oldMeasurement = calculateMeasurement(oldFeature, spec);
            measurements[layerType] = (measurements[layerType] || 0) - oldMeasurement + newMeasurement;
            updateMeasurementDisplay(layerType);
            history.push({
                layerType,
                featureId,
                action: 'edit',
                oldFeature: oldFeature,
                newFeature: feature.clone()
            });
            redoStack = [];
            // Reset feature style to layer default
            feature.setStyle(new ol.style.Style({
                fill: new ol.style.Fill({ color: spec.color + '40' }),
                stroke: new ol.style.Stroke({ color: spec.color, width: 2 }),
                image: new ol.style.Circle({
                    radius: 6,
                    fill: new ol.style.Fill({ color: spec.color }),
                    stroke: new ol.style.Stroke({ color: '#ffffff', width: 2 })
                })
            }));
        }
    });
    map.addInteraction(modify);
    modifyInteraction = modify;
    editModeLayer = layerType;
    const notification = document.getElementById('drawingNotification');
    notification.textContent = "Click and drag to edit a feature. Press ESC to cancel.";
    notification.classList.add('visible');
}

function calculateMeasurement(feature, spec) {
    const geometry = feature.getGeometry();
    let measurement = 0;
    if (spec.geometryType === 'Polygon') {
        const coords = geometry.getCoordinates()[0].map(c => ol.proj.toLonLat(c));
        measurement = turf.area(turf.polygon([coords])) * 10.7639; // sq ft
    } else if (spec.geometryType === 'LineString') {
        const coords = geometry.getCoordinates().map(c => ol.proj.toLonLat(c));
        measurement = turf.length(turf.lineString(coords), { units: 'meters' }) * 3.28084; // ft
    } else if (spec.geometryType === 'Point') {
        measurement = 1;
    }
    return measurement;
}

function undo() {
    if (history.length === 0) return;
    const lastAction = history.pop();
    const { layerType, featureId, action, feature, oldFeature, newFeature } = lastAction;
    const source = vectorLayers[layerType].getSource();
    const spec = LAYERS_SPECS[layerType];
    if (action === 'add' && source.getFeatureById(featureId)) {
        const feature = source.getFeatureById(featureId);
        const geometry = feature.getGeometry();
        let measurement = 0;
        if (spec.geometryType === 'Polygon') {
            const coords = geometry.getCoordinates()[0].map(c => ol.proj.toLonLat(c));
            measurement = turf.area(turf.polygon([coords])) * 10.7639; // sq ft
        } else if (spec.geometryType === 'LineString') {
            const coords = geometry.getCoordinates().map(c => ol.proj.toLonLat(c));
            measurement = turf.length(turf.lineString(coords), { units: 'meters' }) * 3.28084; // ft
        } else if (spec.geometryType === 'Point') {
            measurement = 1;
        }
        source.removeFeature(feature);
        redoStack.push({ layerType, feature: feature.clone(), featureId, action: 'add' });
        measurements[layerType] = (measurements[layerType] || 0) - measurement;
        if (measurements[layerType] <= 0) delete measurements[layerType];
        updateMeasurementDisplay(layerType);
    } else if (action === 'delete') {
        const newFeature = feature.clone();
        newFeature.setId(featureId);
        newFeature.setStyle(new ol.style.Style({
            fill: new ol.style.Fill({ color: spec.color + '40' }),
            stroke: new ol.style.Stroke({ color: spec.color, width: 2 }),
            image: new ol.style.Circle({
                radius: 6,
                fill: new ol.style.Fill({ color: spec.color }),
                stroke: new ol.style.Stroke({ color: '#ffffff', width: 2 })
            })
        }));
        source.addFeature(newFeature);
        const geometry = newFeature.getGeometry();
        let measurement = 0;
        if (spec.geometryType === 'Polygon') {
            const coords = geometry.getCoordinates()[0].map(c => ol.proj.toLonLat(c));
            measurement = turf.area(turf.polygon([coords])) * 10.7639; // sq ft
        } else if (spec.geometryType === 'LineString') {
            const coords = geometry.getCoordinates().map(c => ol.proj.toLonLat(c));
            measurement = turf.length(turf.lineString(coords), { units: 'meters' }) * 3.28084; // ft
        } else if (spec.geometryType === 'Point') {
            measurement = 1;
        }
        measurements[layerType] = (measurements[layerType] || 0) + measurement;
        updateMeasurementDisplay(layerType);
        redoStack.push({ layerType, featureId, action: 'delete', feature: newFeature.clone() });
    } else if (action === 'edit') {
        const feature = source.getFeatureById(featureId);
        if (feature) {
            const currentMeasurement = calculateMeasurement(feature, spec);
            feature.setGeometry(oldFeature.getGeometry().clone());
            feature.setStyle(new ol.style.Style({
                fill: new ol.style.Fill({ color: spec.color + '40' }),
                stroke: new ol.style.Stroke({ color: spec.color, width: 2 }),
                image: new ol.style.Circle({
                    radius: 6,
                    fill: new ol.style.Fill({ color: spec.color }),
                    stroke: new ol.style.Stroke({ color: '#ffffff', width: 2 })
                })
            }));
            const oldMeasurement = calculateMeasurement(oldFeature, spec);
            measurements[layerType] = (measurements[layerType] || 0) - currentMeasurement + oldMeasurement;
            updateMeasurementDisplay(layerType);
            redoStack.push({ layerType, featureId, action: 'edit', oldFeature: newFeature.clone(), newFeature: feature.clone() });
        }
    }
}

function redo() {
    if (redoStack.length === 0) return;
    const nextAction = redoStack.pop();
    const { layerType, feature, featureId, action, oldFeature, newFeature } = nextAction;
    const source = vectorLayers[layerType].getSource();
    const spec = LAYERS_SPECS[layerType];
    if (action === 'add') {
        const newFeature = feature.clone();
        newFeature.setId(featureId);
        newFeature.setStyle(new ol.style.Style({
            fill: new ol.style.Fill({ color: spec.color + '40' }),
            stroke: new ol.style.Stroke({ color: spec.color, width: 2 }),
            image: new ol.style.Circle({
                radius: 6,
                fill: new ol.style.Fill({ color: spec.color }),
                stroke: new ol.style.Stroke({ color: '#ffffff', width: 2 })
            })
        }));
        source.addFeature(newFeature);
        const geometry = newFeature.getGeometry();
        let measurement = 0;
        if (spec.geometryType === 'Polygon') {
            const coords = geometry.getCoordinates()[0].map(c => ol.proj.toLonLat(c));
            measurement = turf.area(turf.polygon([coords])) * 10.7639; // sq ft
        } else if (spec.geometryType === 'LineString') {
            const coords = geometry.getCoordinates().map(c => ol.proj.toLonLat(c));
            measurement = turf.length(turf.lineString(coords), { units: 'meters' }) * 3.28084; // ft
        } else if (spec.geometryType === 'Point') {
            measurement = 1;
        }
        history.push({ layerType, featureId, action: 'add' });
        measurements[layerType] = (measurements[layerType] || 0) + measurement;
        updateMeasurementDisplay(layerType);
    } else if (action === 'delete') {
        const featureToDelete = source.getFeatureById(featureId);
        if (featureToDelete) {
            const geometry = featureToDelete.getGeometry();
            let measurement = 0;
            if (spec.geometryType === 'Polygon') {
                const coords = geometry.getCoordinates()[0].map(c => ol.proj.toLonLat(c));
                measurement = turf.area(turf.polygon([coords])) * 10.7639; // sq ft
            } else if (spec.geometryType === 'LineString') {
                const coords = geometry.getCoordinates().map(c => ol.proj.toLonLat(c));
                measurement = turf.length(turf.lineString(coords), { units: 'meters' }) * 3.28084; // ft
            } else if (spec.geometryType === 'Point') {
                measurement = 1;
            }
            source.removeFeature(featureToDelete);
            measurements[layerType] = (measurements[layerType] || 0) - measurement;
            if (measurements[layerType] <= 0) delete measurements[layerType];
            updateMeasurementDisplay(layerType);
            history.push({ layerType, featureId, action: 'delete', feature: featureToDelete.clone() });
        }
    } else if (action === 'edit') {
        const feature = source.getFeatureById(featureId);
        if (feature) {
            const currentMeasurement = calculateMeasurement(feature, spec);
            feature.setGeometry(newFeature.getGeometry().clone());
            feature.setStyle(new ol.style.Style({
                fill: new ol.style.Fill({ color: spec.color + '40' }),
                stroke: new ol.style.Stroke({ color: spec.color, width: 2 }),
                image: new ol.style.Circle({
                    radius: 6,
                    fill: new ol.style.Fill({ color: spec.color }),
                    stroke: new ol.style.Stroke({ color: '#ffffff', width: 2 })
                })
            }));
            const newMeasurement = calculateMeasurement(newFeature, spec);
            measurements[layerType] = (measurements[layerType] || 0) - currentMeasurement + newMeasurement;
            updateMeasurementDisplay(layerType);
            history.push({ layerType, featureId, action: 'edit', oldFeature: feature.clone(), newFeature: newFeature.clone() });
        }
    }
}

function handleSave() {
    const features = [];
    const layerIds = Object.keys(vectorLayers).filter(id => id !== 'boundary');
    Object.entries(vectorLayers).forEach(([layerType, layer]) => {
        if (layerType === 'boundary') return; // Skip boundary layer
        const source = layer.getSource();
        if (!source) return;
        source.getFeatures().forEach(feature => {
            const clone = feature.clone();
            clone.setProperties({ layerType, style: LAYERS_SPECS[layerType] });
            const geometry = feature.getGeometry();
            let measurement = 0;
            if (LAYERS_SPECS[layerType].geometryType === 'Polygon') {
                const coords = geometry.getCoordinates()[0].map(c => ol.proj.toLonLat(c));
                measurement = turf.area(turf.polygon([coords])) * 10.7639; // sq ft
            } else if (LAYERS_SPECS[layerType].geometryType === 'LineString') {
                const coords = geometry.getCoordinates().map(c => ol.proj.toLonLat(c));
                measurement = turf.length(turf.lineString(coords), { units: 'meters' }) * 3.28084; // ft
            } else if (LAYERS_SPECS[layerType].geometryType === 'Point') {
                measurement = 1;
            }
            clone.setProperties({ measurement: measurement.toFixed(2) + (LAYERS_SPECS[layerType].geometryType === 'Polygon' ? ' sqft' : LAYERS_SPECS[layerType].geometryType === 'LineString' ? ' ft' : ' N') });
            features.push(clone);
        });
    });
    if (features.length === 0) {
        console.warn('No features to save.');
        return;
    }
    const geoJSON = new ol.format.GeoJSON().writeFeatures(features, { dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857' });
    if (confirm("Are you sure you have completed the data correctly?")) {
        dataref.update({
            status: "Completed",
            workedGeojson: JSON.parse(geoJSON),
            layers: layerIds,
            totalAreaBoundaryMeasurement: { acres: Object.entries(measurements).reduce((sum, [layerType, m]) => sum + (LAYERS_SPECS[layerType]?.geometryType === 'Polygon' ? m / 43560 : 0), 0).toFixed(2) }
        }).then(() => {
            document.cookie = "";
            alert("Data Submitted Successfully");
        }).catch((err) => {
            alert(err);
        });
    } else {
        alert("Submission canceled.");
    }
}

function openAddLayerPopup() {
    document.getElementById('popupOverlay').style.display = 'block';
    document.getElementById('addLayerPopup').style.display = 'block';
}

function closeAddLayerPopup() {
    document.getElementById('popupOverlay').style.display = 'none';
    document.getElementById('addLayerPopup').style.display = 'none';
    document.getElementById('layerName').value = '';
    document.getElementById('layerType').value = 'Polygon';
    document.getElementById('layerColor').value = '#000000';
}

function addCustomLayer() {
    let layerName = document.getElementById('layerName').value.trim();
    const layerType = document.getElementById('layerType').value;
    const layerColor = document.getElementById('layerColor').value;
    if (!layerName) {
        alert('Layer name is required.');
        return;
    }
    // Ensure unique layer name
    let baseLayerName = layerName;
    let suffix = 1;
    while (LAYERS_SPECS[layerName]) {
        layerName = `${baseLayerName}_${suffix}`;
        suffix++;
    }
    const icon = layerType === 'Point' ? '○' : layerType === 'LineString' ? '╱' : '■';
    LAYERS_SPECS[layerName] = { label: layerName, icon, color: layerColor, geometryType: layerType };
    const source = new ol.source.Vector();
    const vectorLayer = new ol.layer.Vector({
        source,
        style: new ol.style.Style({
            fill: new ol.style.Fill({ color: layerColor + '40' }),
            stroke: new ol.style.Stroke({ color: layerColor, width: 2 }),
            image: new ol.style.Circle({
                radius: 6,
                fill: new ol.style.Fill({ color: layerColor }),
                stroke: new ol.style.Stroke({ color: '#ffffff', width: 2 })
            })
        })
    });
    vectorLayers[layerName] = vectorLayer;
    map.addLayer(vectorLayer);
    // Update Firebase with the new layer
    dataref.once('value').then(snapshot => {
        const data = snapshot.val();
        const layersFromDb = data.layers || [];
        if (!layersFromDb.includes(layerName)) {
            layersFromDb.push(layerName);
            dataref.update({ layers: layersFromDb }).catch(err => {
                console.error('Error updating layers in Firebase:', err);
                alert('Failed to save new layer to database.');
            });
        }
    }).catch(err => {
        console.error('Error fetching layers from Firebase:', err);
        alert('Failed to save new layer to database.');
    });
    const activeLayers = Object.fromEntries(Object.entries(LAYERS_SPECS).filter(([layerType]) => vectorLayers[layerType]));
    initLayersList(activeLayers);
    closeAddLayerPopup();
    const notification = document.getElementById('drawingNotification');
    notification.textContent = `Layer "${layerName}" added. Select to start drawing.`;
    notification.classList.add('visible');
    setTimeout(() => notification.classList.remove('visible'), 3000);
}

initMap();