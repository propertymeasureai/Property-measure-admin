const LAYERS_SPECS = {
    turf: { label: 'Turf', icon: '■', color: '#4ade80', geometryType: 'Polygon' },
    mulchBeds: { label: 'Mulch Beds', icon: '■', color: '#92400e', geometryType: 'Polygon' },
    softEdge: { label: 'Soft Edge', color: '#84cc16', icon: '╱', geometryType: 'LineString' },
    hardEdge: { label: 'Hard Edge', color: '#737373', icon: '╱', geometryType: 'LineString' },
    trimEdge: { label: 'Trim Edge', color: '#84cc16', icon: '╱', geometryType: 'LineString' },
    flowerBeds: { label: 'Flower Beds', color: '#f472b6', icon: '■', geometryType: 'Polygon' },
    hedge: { label: 'Hedge', color: '#22c55e', icon: '■', geometryType: 'Polygon' },
    tree: { label: 'Tree', color: '#15803d', icon: '○', geometryType: 'Point' },
    palmTree: { label: 'Palm Tree', color: '#65a30d', icon: '○', geometryType: 'Point' },
    rockBeds: { label: 'Rock Beds', color: '#78716c', icon: '■', geometryType: 'Polygon' },
    retentionPonds: { label: 'Retention Ponds', color: '#0ea5e9', icon: '■', geometryType: 'Polygon' },
    waterBody: { label: 'Water Body', color: '#38bdf8', icon: '■', geometryType: 'Polygon' },
    sidewalks: { label: 'All Sidewalks', color: '#94a3b8', icon: '■', geometryType: 'Polygon' },
    privateSidewalks: { label: 'Private Sidewalks', color: '#cbd5e1', icon: '■', geometryType: 'Polygon' },
    parkingLots: { label: 'Parking Area', color: '#FFD700', icon: '■', geometryType: 'Polygon' },
    buildings: { label: 'Building Footprint', color: '#FFA500', icon: '■', geometryType: 'Polygon' },
    roadside: { label: 'Road Side / Pavement', color: '#8c8c8c', icon: '■', geometryType: 'Polygon' },
    publicSidewalks: { label: 'Public Sidewalks', color: '#e2e8f0', icon: '■', geometryType: 'Polygon' },
    retentionbesin: { label: 'Retension Besin', color: '#8c8c8c', icon: '■', geometryType: 'Polygon' }
};

let map;
let drawInteraction;
let vectorLayers = {};
let measurements = {};
let selectedLayer = null;
const scale = { ratio: 100, inchToFeet: 10 }; // Default value, will be updated from Firebase
let history = []; // Undo stack
let redoStack = []; // Redo stack

function getCookie(name) {
    let cookies = document.cookie.split("; ");
    for (let cookie of cookies) {
        let [key, value] = cookie.split("=");
        if (key === name) return decodeURIComponent(value);
    }
    return null;
}
let reference = getCookie("reference");
console.log(reference); // Output: user123/orders/order456 

var dataref = firebase.database().ref(reference);

// Initialize map
function initMap() {
    dataref.once("value", function (snapshot) {
        const data = snapshot.val();
        console.log(data);
        var selectedImageFromDb = data.CADImage; // Base64 image from Firebase
        var layersFromDb = data.layers || []; // Layers array from Firebase
        var measurementSettings = data.measurementSettings || { oneInchIntoFeet: 10 }; // Measurement settings from Firebase

        // Update scale.inchToFeet from Firebase
        scale.inchToFeet = parseFloat(measurementSettings.oneInchIntoFeet) || 10;

        // Filter LAYERS_SPECS to only include layers from Firebase
        const activeLayers = layersFromDb.length > 0 ?
            Object.fromEntries(
                Object.entries(LAYERS_SPECS).filter(([layerType]) => layersFromDb.includes(layerType))
            ) : LAYERS_SPECS;

        // Use the base64 image directly
        const image = new Image();
        image.src = selectedImageFromDb; // Set base64 string as image source

        image.onload = () => {
            const extent = [0, 0, image.width, image.height];
            const projection = new ol.proj.Projection({
                code: 'image',
                units: 'pixels',
                extent: extent
            });

            const imageLayer = new ol.layer.Image({
                source: new ol.source.ImageStatic({
                    url: image.src,
                    projection: projection,
                    imageExtent: extent
                })
            });

            // Initialize vector layers for active layers only
            Object.entries(activeLayers).forEach(([layerType, spec]) => {
                const source = new ol.source.Vector({ projection });
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

            map = new ol.Map({
                target: 'map',
                layers: [imageLayer, ...Object.values(vectorLayers)],
                view: new ol.View({
                    projection: projection,
                    center: ol.extent.getCenter(extent),
                    zoom: 1,
                    maxZoom: 8
                })
            });

            initLayersList(activeLayers);
            initControls();
            initKeyboardListeners();
        };

        image.onerror = (error) => {
            console.error('Error loading image:', error);
            // Fallback to default image if base64 is invalid
            image.src = 'default-image.jpg';
        };
    }).catch(error => {
        console.error('Error fetching data from Firebase:', error);
        // Fallback to default image and all layers if Firebase fetch fails
        const image = new Image();
        image.src = 'default-image.jpg';
        image.onload = () => {
            const extent = [0, 0, image.width, image.height];
            const projection = new ol.proj.Projection({
                code: 'image',
                units: 'pixels',
                extent: extent
            });

            const imageLayer = new ol.layer.Image({
                source: new ol.source.ImageStatic({
                    url: image.src,
                    projection: projection,
                    imageExtent: extent
                })
            });

            Object.entries(LAYERS_SPECS).forEach(([layerType, spec]) => {
                const source = new ol.source.Vector({ projection });
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

            map = new ol.Map({
                target: 'map',
                layers: [imageLayer, ...Object.values(vectorLayers)],
                view: new ol.View({
                    projection: projection,
                    center: ol.extent.getCenter(extent),
                    zoom: 1,
                    maxZoom: 8
                })
            });

            initLayersList(LAYERS_SPECS);
            initControls();
            initKeyboardListeners();
        };
    });
}

// Initialize layers list
function initLayersList(activeLayers) {
    const layersList = document.getElementById('layersList');
    layersList.innerHTML = ''; // Clear existing list
    Object.entries(activeLayers).forEach(([layerType, spec]) => {
        const button = document.createElement('button');
        button.className = 'layer-btn';
        button.dataset.layer = layerType; // Add data attribute for easier selection
        button.innerHTML = `
            <span class="icon" style="color: ${spec.color}">${spec.icon}</span>
            <span class="label">${spec.label}</span>
            <span class="measurement" id="measurement-${layerType}"></span>
        `;
        button.addEventListener('click', () => startDrawing(layerType));
        layersList.appendChild(button);
    });
}

// Start drawing interaction
function startDrawing(layerType) {
    if (!map || !vectorLayers[layerType]) return;

    if (drawInteraction) {
        map.removeInteraction(drawInteraction);
    }

    document.querySelectorAll('.layer-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`button[data-layer="${layerType}"]`).classList.add('active');

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
        const geometry = feature.getGeometry();

        let measurement = 0;
        if (spec.geometryType === 'Polygon') {
            measurement = ol.sphere.getArea(geometry) * (scale.inchToFeet / scale.ratio) ** 2;
        } else if (spec.geometryType === 'LineString') {
            measurement = ol.sphere.getLength(geometry) * (scale.inchToFeet / scale.ratio);
        }

        measurements[layerType] = (measurements[layerType] || 0) + measurement;
        updateMeasurementDisplay(layerType);

        // Add to history
        history.push({ layerType, feature: feature.clone(), action: 'add' });
        redoStack = []; // Clear redo stack on new action
    });

    map.addInteraction(draw);
    drawInteraction = draw;
    selectedLayer = layerType;
}

// Update measurement display
function updateMeasurementDisplay(layerType) {
    const spec = LAYERS_SPECS[layerType];
    const measurementEl = document.getElementById(`measurement-${layerType}`);
    if (measurementEl && measurements[layerType]) {
        measurementEl.textContent = `${measurements[layerType].toFixed(2)} ${spec.geometryType === 'Polygon' ? 'sq ft' : 'ft'}`;
    }
}

// Initialize map controls
function initControls() {
    document.getElementById('undo').addEventListener('click', undo);
    document.getElementById('redo').addEventListener('click', redo);
    document.getElementById('zoomIn').addEventListener('click', () => {
        const view = map.getView();
        view.setZoom((view.getZoom() || 1) + 0.5);
    });
    document.getElementById('zoomOut').addEventListener('click', () => {
        const view = map.getView();
        view.setZoom(Math.max(1, (view.getZoom() || 1) - 0.5));
    });
    document.getElementById('rotate').addEventListener('click', () => {
        const view = map.getView();
        view.setRotation(view.getRotation() + Math.PI / 2);
    });
    document.getElementById('saveButton').addEventListener('click', handleSave);
}

// Initialize keyboard listeners
function initKeyboardListeners() {
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            cancelDrawing();
        }
    });
}

// Cancel drawing
function cancelDrawing() {
    if (drawInteraction) {
        map.removeInteraction(drawInteraction);
        drawInteraction = null;
    }
    if (selectedLayer) {
        document.querySelector(`button[data-layer="${selectedLayer}"]`).classList.remove('active');
        selectedLayer = null;
    }
}

// Undo action
function undo() {
    if (history.length === 0) return;

    const lastAction = history.pop();
    const { layerType, feature, action } = lastAction;
    const source = vectorLayers[layerType].getSource();

    if (action === 'add') {
        source.removeFeature(source.getFeatureById(feature.getId()) || feature);
        redoStack.push({ layerType, feature: feature.clone(), action: 'add' });

        // Update measurements
        let measurement = 0;
        const spec = LAYERS_SPECS[layerType];
        const geometry = feature.getGeometry();
        if (spec.geometryType === 'Polygon') {
            measurement = ol.sphere.getArea(geometry) * (scale.inchToFeet / scale.ratio) ** 2;
        } else if (spec.geometryType === 'LineString') {
            measurement = ol.sphere.getLength(geometry) * (scale.inchToFeet / scale.ratio);
        }
        measurements[layerType] -= measurement;
        if (measurements[layerType] <= 0) delete measurements[layerType];
        updateMeasurementDisplay(layerType);
    }
}

// Redo action
function redo() {
    if (redoStack.length === 0) return;

    const nextAction = redoStack.pop();
    const { layerType, feature, action } = nextAction;
    const source = vectorLayers[layerType].getSource();

    if (action === 'add') {
        source.addFeature(feature);
        history.push({ layerType, feature: feature.clone(), action: 'add' });

        // Update measurements
        let measurement = 0;
        const spec = LAYERS_SPECS[layerType];
        const geometry = feature.getGeometry();
        if (spec.geometryType === 'Polygon') {
            measurement = ol.sphere.getArea(geometry) * (scale.inchToFeet / scale.ratio) ** 2;
        } else if (spec.geometryType === 'LineString') {
            measurement = ol.sphere.getLength(geometry) * (scale.inchToFeet / scale.ratio);
        }
        measurements[layerType] = (measurements[layerType] || 0) + measurement;
        updateMeasurementDisplay(layerType);
    }
}

// Handle save functionality
function handleSave() {
    const features = [];
    Object.entries(vectorLayers).forEach(([layerType, layer]) => {
        const source = layer.getSource();
        if (!source) return;

        source.getFeatures().forEach(feature => {
            const clone = feature.clone();
            clone.setProperties({
                layerType,
                style: LAYERS_SPECS[layerType]
            });
            features.push(clone);
        });
    });

    if (features.length === 0) {
        console.warn('No features to save.');
        return;
    }

    const geoJSON = new ol.format.GeoJSON().writeFeatures(features, {
        dataProjection: map.getView().getProjection(),
        featureProjection: map.getView().getProjection()
    });
    console.log(geoJSON)
    
    const blob = new Blob([geoJSON], { type: 'application/json' });
    console.log(blob)
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'map-features.geojson';
    link.click();
    URL.revokeObjectURL(url);
    function submitDataFinal() {
        if (confirm("Are you sure you have completed the data correctly?")) {
            const GetGeoJson = showCompleteGeoJson();
            dataref.update({ status: "Completed", workedGeojson: GetGeoJson })
                .then(() => {
                    document.cookie = ""
                    alert("Data Submitted Successfully");
                })
                .catch((err) => {
                    alert(err);
                });
        } else {
            alert("Submission canceled.");
        }
    }
}

// Start the application
initMap();