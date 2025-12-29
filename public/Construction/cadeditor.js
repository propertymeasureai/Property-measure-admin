const LAYERS_SPECS = {
    turf: {
        label: 'Turf',
        icon: "■",
        color: '#4ade80',
        geometryType: 'Polygon'
    },
    turf30: { label: 'Turf-30', icon: '■', color: '#7ee7a4', geometryType: 'Polygon' },
    turf48: { label: 'Turf-48', icon: '■', color: '#93ebb4', geometryType: 'Polygon' },
    turf60: { label: 'Turf-60', icon: '■', color: '#a9efc3', geometryType: 'Polygon' },
    mulchBeds: {
        label: "Mulch Beds",
        icon: "■",
        color: '#92400e',
        geometryType: 'Polygon'
    },
    softEdge: {
        label: 'Soft Edge',
        color: '#84cc16',
        icon: '╱',
        geometryType: 'LineString'
    },
    hardEdge: {
        label: 'Hard Edge',
        color: '#737373',
        icon: '╱',
        geometryType: 'LineString'
    },
    trimEdge: {
        label: 'Trim Edge',
        color: '#84cc16',
        icon: '╱',
        geometryType: 'LineString'
    },
    flowerBeds: {
        label: 'Flower Beds',
        color: '#f472b6',
        icon: '■',
        geometryType: 'Polygon'
    },
    hedge: {
        label: 'Hedge',
        color: '#22c55e',
        icon: '■',
        geometryType: 'Polygon'
    },
    tree: {
        label: 'Tree',
        color: '#15803d',
        icon: '○',
        geometryType: 'Point'
    },
    palmTree: {
        label: 'Palm Tree',
        color: '#65a30d',
        icon: '○',
        geometryType: 'Point'
    },
    rockBeds: {
        label: 'Rock Beds',
        color: '#78716c',
        icon: '■',
        geometryType: 'Polygon'
    },
    retentionPonds: {
        label: 'Retention Ponds',
        color: '#0ea5e9',
        icon: '■',
        geometryType: 'Polygon'
    },
    waterBody: {
        label: 'Water Body',
        color: '#38bdf8',
        icon: '■',
        geometryType: 'Polygon'
    },
    sidewalks: {
        label: 'All Sidewalks',
        color: '#94a3b8',
        icon: '■',
        geometryType: 'Polygon'
    },
    privateSidewalks: {
        label: 'Private Sidewalks',
        color: '#cbd5e1',
        icon: '■',
        geometryType: 'Polygon'
    },
    parkingLots: {
        label: "Parking Area",
        color: "#FFD700",
        icon: "■",
        geometryType: 'Polygon'
    },
    buildings: {
        label: "Building Footprint",
        color: "#FFA500",
        icon: '■',
        geometryType: 'Polygon'
    },
    roadside: {
        label: "Road Side / Pavement",
        color: "#8c8c8c",
        icon: '■',
        geometryType: 'Polygon'
    },
    publicSidewalks: {
        label: 'Public Sidewalks',
        color: '#e2e8f0',
        icon: '■',
        geometryType: 'Polygon'
    },
    retentionbesin: {
        label: 'Retension Besin',
        color: "#8c8c8c",
        icon: "■",
        geometryType: 'Polygon'
    }
};

let map;
let drawInteraction;
let selectInteraction;
let modifyInteraction;
let vectorLayers = {};
let measurements = {};
let selectedLayer = null;
let deleteModeLayer = null;
let editModeLayer = null;
const scale = { inchToFeet: 10 };
const calibrationFactor = 0.00000650;
let history = [];
let redoStack = [];
let featureCounter = 0;

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

var dataref = firebase.database().ref(reference);

function initMap() {
    dataref.once("value", function (snapshot) {
        const data = snapshot.val();
        console.log("Firebase Data:", data);
        if (!data) {
            throw new Error("No data found in Firebase for reference: " + reference);
        }
        if (data.additionalNotes) {
            document.getElementById("addiNotes").innerText = data.additionalNotes;
        }
        var selectedImageFromDb = data.CADImage;
        var layersFromDb = data.layers || [];
        var measurementSettings = data.measurementSettings || { oneInchIntoFeet: 10 };
        var workedGeojson = data.workedGeojson;
        var layerStyles = data.layerStyles || {};
         let customLayers = data.customLayer; 

        if (customLayers) {
            customLayers.forEach(layer => {
                if (!LAYERS_SPECS[layer.label]) {
                    LAYERS_SPECS[layer.label] = {
                        label: layer.label,
                        icon: layer.icon,
                        color: layer.color || getRandomColor(),
                        geometryType: layer.geometryType || 'Polygon'
                    };
                } else {
                    LAYERS_SPECS[layer.label].color = layer.color || getRandomColor();
                }

            })
        }

        // Apply custom colors from Firebase
        Object.entries(layerStyles).forEach(([layerType, style]) => {
            if (LAYERS_SPECS[layerType] && style.color) {
                LAYERS_SPECS[layerType].color = style.color;
            }
        });

        scale.inchToFeet = parseFloat(measurementSettings.oneInchIntoFeet) || 10;
        document.getElementById('scaleDisplay').textContent = `1 inch = ${scale.inchToFeet} feet`;

        const activeLayers = layersFromDb.length > 0 ?
            Object.fromEntries(
                Object.entries(LAYERS_SPECS).filter(([layerType]) => layersFromDb.includes(layerType))
            ) : LAYERS_SPECS;

        const image = new Image();
        image.src = selectedImageFromDb;

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

            if (workedGeojson) {
                try {
                    const geojsonData = typeof workedGeojson === 'string' ? JSON.parse(workedGeojson) : workedGeojson;
                    const format = new ol.format.GeoJSON();
                    const features = format.readFeatures(geojsonData, {
                        featureProjection: projection,
                        dataProjection: projection
                    });

                    featureCounter = features.length;

                    features.forEach((feature) => {
                        const layerType = feature.get('layerType') || 'turf';
                        if (!vectorLayers[layerType]) {
                            console.warn(`Layer ${layerType} not found in active layers, skipping feature.`);
                            return;
                        }

                        const source = vectorLayers[layerType].getSource();
                        const featureId = feature.getId() || `feature_${featureCounter++}`;
                        feature.setId(featureId);
                        feature.set('layerType', layerType);
                        source.addFeature(feature);

                        const spec = LAYERS_SPECS[layerType];
                        const geometry = feature.getGeometry();
                        let measurement = 0;

                        if (spec.geometryType === 'Polygon') {
                            measurement = geometry.getArea() * (scale.inchToFeet ** 2) * calibrationFactor;
                        } else if (spec.geometryType === 'LineString') {
                            measurement = geometry.getLength() * scale.inchToFeet;
                        } else if (spec.geometryType === 'Point') {
                            measurement = 1;
                        }

                        measurements[layerType] = (measurements[layerType] || 0) + measurement;
                        updateMeasurementDisplay(layerType);

                        history.push({ layerType, featureId, action: 'add' });
                    });

                    const allFeaturesExtent = new ol.source.Vector({ features }).getExtent();
                    if (!ol.extent.isEmpty(allFeaturesExtent)) {
                        map.getView().fit(allFeaturesExtent, { padding: [50, 50, 50, 50], maxZoom: 8 });
                    }
                } catch (error) {
                    console.error('Error parsing workedGeojson:', error);
                }
            }

            initLayersList(activeLayers);
            initControls();
            initKeyboardListeners();

            document.getElementById('loader').style.display = 'none';
        };

        image.onerror = (error) => {
            console.error('Error loading image:', error);
            image.src = 'default-image.jpg';
        };
    }).catch(error => {
        console.error('Error fetching data from Firebase:', error);
        document.getElementById('scaleDisplay').textContent = `1 inch = ${scale.inchToFeet} feet`;
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

            document.getElementById('loader').style.display = 'none';
        };
    });
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
                <button class="color-btn" data-layer="${layerType}" title="Change Color">
                    <span class="icon">🎨</span>
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

        const colorButton = layerDiv.querySelector('.color-btn');
        colorButton.addEventListener('click', () => openChangeColorPopup(layerType));

        updateMeasurementDisplay(layerType);
    });
}

function updateMeasurementDisplay(layerType) {
    const spec = LAYERS_SPECS[layerType];
    const measurementEl = document.getElementById(`measurement-${layerType}`);
    if (measurementEl) {
        const value = measurements[layerType] || 0;
        console.log(`Updating display for ${layerType}: ${value.toFixed(2)} ${spec.geometryType === 'Polygon' ? 'sq ft' : spec.geometryType === 'LineString' ? 'ft' : 'N'}`);
        measurementEl.textContent = `${value.toFixed(2)} ${spec.geometryType === 'Polygon' ? 'sq ft' : spec.geometryType === 'LineString' ? 'ft' : 'N'}`;
    } else {
        console.error(`Measurement element for ${layerType} not found`);
    }
}

function calculateMeasurement(feature, spec) {
    const geometry = feature.getGeometry();
    let measurement = 0;
    if (spec.geometryType === 'Polygon') {
        measurement = geometry.getArea() * (scale.inchToFeet ** 2) * calibrationFactor;
    } else if (spec.geometryType === 'LineString') {
        measurement = geometry.getLength() * scale.inchToFeet;
    } else if (spec.geometryType === 'Point') {
        measurement = 1;
    }
    return measurement;
}

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
            closeChangeColorPopup();
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
    console.log('Editing canceled');
}

function openChangeColorPopup(layerType) {
    const popup = document.getElementById('changeColorPopup');
    const overlay = document.getElementById('popupOverlay');
    const colorInput = document.getElementById('newLayerColor');
    const confirmButton = document.getElementById('confirmColorChange');

    colorInput.value = LAYERS_SPECS[layerType].color;
    popup.dataset.layerType = layerType;
    popup.style.display = 'block';
    overlay.style.display = 'block';
}

function closeChangeColorPopup() {
    const popup = document.getElementById('changeColorPopup');
    const overlay = document.getElementById('popupOverlay');
    popup.style.display = 'none';
    overlay.style.display = 'none';
    popup.dataset.layerType = '';
}

function changeLayerColor() {
    const popup = document.getElementById('changeColorPopup');
    const layerType = popup.dataset.layerType;
    const newColor = document.getElementById('newLayerColor').value;

    if (!layerType || !newColor) {
        alert('Invalid layer or color.');
        return;
    }

    // Update LAYERS_SPECS
    LAYERS_SPECS[layerType].color = newColor;

    // Update vector layer style
    const vectorLayer = vectorLayers[layerType];
    if (vectorLayer) {
        vectorLayer.setStyle(new ol.style.Style({
            fill: new ol.style.Fill({ color: newColor + '40' }),
            stroke: new ol.style.Stroke({ color: newColor, width: 2 }),
            image: new ol.style.Circle({
                radius: 6,
                fill: new ol.style.Fill({ color: newColor }),
                stroke: new ol.style.Stroke({ color: '#ffffff', width: 2 })
            })
        }));
    }

    // Update Firebase
    dataref.once('value').then(snapshot => {
        const data = snapshot.val();
        const layersFromDb = data.layers || [];
        if (layersFromDb.includes(layerType)) {
            dataref.child('layerStyles').child(layerType).update({
                color: newColor
            }).catch(err => {
                console.error('Error updating layer color in Firebase:', err);
                alert('Failed to save new color to database.');
            });
        }
    }).catch(err => {
        console.error('Error fetching layers from Firebase:', err);
        alert('Failed to save new color to database.');
    });

    // Refresh layers list to update icon color
    const activeLayers = Object.fromEntries(
        Object.entries(LAYERS_SPECS).filter(([layerType]) => vectorLayers[layerType])
    );
    initLayersList(activeLayers);

    // Show notification
    const notification = document.getElementById('drawingNotification');
    notification.textContent = `Color for layer "${LAYERS_SPECS[layerType].label}" updated.`;
    notification.classList.add('visible');
    setTimeout(() => {
        notification.classList.remove('visible');
    }, 3000);

    closeChangeColorPopup();
}

function startDrawing(layerType) {
    if (!map || !vectorLayers[layerType]) return;

    if (drawInteraction) {
        map.removeInteraction(drawInteraction);
    }
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
            measurement = geometry.getArea() * (scale.inchToFeet ** 2) * calibrationFactor;
        } else if (spec.geometryType === 'LineString') {
            measurement = geometry.getLength() * scale.inchToFeet;
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

    if (selectInteraction) {
        map.removeInteraction(selectInteraction);
        selectInteraction = null;
    }
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
    const spec = LAYERS_SPECS[layerType];

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
            const measurement = calculateMeasurement(feature, spec);

            console.log(`Deleting feature ${featureId} from ${layerType}, measurement: ${measurement}`);

            source.removeFeature(feature);
            measurements[layerType] = (measurements[layerType] || 0) - measurement;
            if (measurements[layerType] <= 0) {
                measurements[layerType] = 0;
            }
            console.log(`Updated measurements[${layerType}]: ${measurements[layerType]}`);
            updateMeasurementDisplay(layerType);

            history.push({ layerType, featureId, action: 'delete', feature: feature.clone(), measurement });
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
    console.log(`Delete mode activated for ${layerType}`);
}

function startEditing(layerType) {
    if (!map || !vectorLayers[layerType]) {
        console.error(`Cannot start editing: map or layer ${layerType} not found`);
        return;
    }

    if (modifyInteraction) {
        map.removeInteraction(modifyInteraction);
        modifyInteraction = null;
    }
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
    const spec = LAYERS_SPECS[layerType];

    let oldFeature = null;

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

    modify.on('modifystart', (event) => {
        const features = event.features.getArray();
        if (features.length > 0) {
            oldFeature = features[0].clone();
            console.log(`Started editing feature ${features[0].getId()} in ${layerType}`);
        }
    });

    modify.on('modifyend', (event) => {
        const features = event.features.getArray();
        if (features.length > 0 && oldFeature) {
            const feature = features[0];
            const featureId = feature.getId();

            const oldMeasurement = calculateMeasurement(oldFeature, spec);
            const newMeasurement = calculateMeasurement(feature, spec);

            console.log(`Editing feature ${featureId} in ${layerType}: old measurement = ${oldMeasurement}, new measurement = ${newMeasurement}`);

            measurements[layerType] = (measurements[layerType] || 0) - oldMeasurement + newMeasurement;
            if (measurements[layerType] <= 0) {
                measurements[layerType] = 0;
            }
            console.log(`Updated measurements[${layerType}]: ${measurements[layerType]}`);
            updateMeasurementDisplay(layerType);

            history.push({
                layerType,
                featureId,
                action: 'edit',
                oldFeature: oldFeature.clone(),
                newFeature: feature.clone(),
                oldMeasurement,
                newMeasurement
            });
            redoStack = [];

            feature.setStyle(new ol.style.Style({
                fill: new ol.style.Fill({ color: spec.color + '40' }),
                stroke: new ol.style.Stroke({ color: spec.color, width: 2 }),
                image: new ol.style.Circle({
                    radius: 6,
                    fill: new ol.style.Fill({ color: spec.color }),
                    stroke: new ol.style.Stroke({ color: '#ffffff', width: 2 })
                })
            }));

            oldFeature = null;
        } else {
            console.warn(`No oldFeature captured for editing in ${layerType}`);
        }
    });

    map.addInteraction(modify);
    modifyInteraction = modify;
    editModeLayer = layerType;
    const notification = document.getElementById('drawingNotification');
    notification.textContent = "Click and drag to edit a feature. Press ESC to cancel.";
    notification.classList.add('visible');
    console.log(`Edit mode activated for ${layerType}`);
}

function undo() {
    if (history.length === 0) return;

    const lastAction = history.pop();
    const { layerType, featureId, action, feature, oldFeature, newFeature, oldMeasurement, newMeasurement, measurement } = lastAction;
    const source = vectorLayers[layerType].getSource();
    const spec = LAYERS_SPECS[layerType];

    if (action === 'add' && source.getFeatureById(featureId)) {
        const feature = source.getFeatureById(featureId);
        const measurementValue = measurement || calculateMeasurement(feature, spec);

        console.log(`Undoing add for feature ${featureId} in ${layerType}, measurement: ${measurementValue}`);

        source.removeFeature(feature);
        redoStack.push({ layerType, feature: feature.clone(), featureId, action: 'add', measurement: measurementValue });

        measurements[layerType] = (measurements[layerType] || 0) - measurementValue;
        if (measurements[layerType] <= 0) measurements[layerType] = 0;
        console.log(`Undo - Updated measurements[${layerType}]: ${measurements[layerType]}`);
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

        const measurementValue = measurement || calculateMeasurement(newFeature, spec);
        console.log(`Undoing delete for feature ${featureId} in ${layerType}, measurement: ${measurementValue}`);

        measurements[layerType] = (measurements[layerType] || 0) + measurementValue;
        console.log(`Undo - Updated measurements[${layerType}]: ${measurements[layerType]}`);
        updateMeasurementDisplay(layerType);

        redoStack.push({ layerType, featureId, action: 'delete', feature: newFeature.clone(), measurement: measurementValue });
    } else if (action === 'edit') {
        const feature = source.getFeatureById(featureId);
        if (feature) {
            console.log(`Undoing edit for feature ${featureId} in ${layerType}: oldMeasurement = ${oldMeasurement}, newMeasurement = ${newMeasurement}`);

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

            measurements[layerType] = (measurements[layerType] || 0) - newMeasurement + oldMeasurement;
            if (measurements[layerType] <= 0) measurements[layerType] = 0;
            console.log(`Undo - Updated measurements[${layerType}]: ${measurements[layerType]}`);
            updateMeasurementDisplay(layerType);

            redoStack.push({ layerType, featureId, action: 'edit', oldFeature: newFeature.clone(), newFeature: feature.clone(), oldMeasurement: newMeasurement, newMeasurement: oldMeasurement });
        }
    }
}

function redo() {
    if (redoStack.length === 0) return;

    const nextAction = redoStack.pop();
    const { layerType, feature, featureId, action, oldFeature, newFeature, oldMeasurement, newMeasurement, measurement } = nextAction;
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

        const measurementValue = measurement || calculateMeasurement(newFeature, spec);
        console.log(`Redoing add for feature ${featureId} in ${layerType}, measurement: ${measurementValue}`);

        measurements[layerType] = (measurements[layerType] || 0) + measurementValue;
        console.log(`Redo - Updated measurements[${layerType}]: ${measurements[layerType]}`);
        updateMeasurementDisplay(layerType);

        history.push({ layerType, featureId, action: 'add', measurement: measurementValue });
    } else if (action === 'delete') {
        const featureToDelete = source.getFeatureById(featureId);
        if (featureToDelete) {
            const measurementValue = measurement || calculateMeasurement(featureToDelete, spec);
            console.log(`Redoing delete for feature ${featureId} in ${layerType}, measurement: ${measurementValue}`);

            source.removeFeature(featureToDelete);
            measurements[layerType] = (measurements[layerType] || 0) - measurementValue;
            if (measurements[layerType] <= 0) measurements[layerType] = 0;
            console.log(`Redo - Updated measurements[${layerType}]: ${measurements[layerType]}`);
            updateMeasurementDisplay(layerType);

            history.push({ layerType, featureId, action: 'delete', feature: featureToDelete.clone(), measurement: measurementValue });
        }
    } else if (action === 'edit') {
        const feature = source.getFeatureById(featureId);
        if (feature) {
            console.log(`Redoing edit for feature ${featureId} in ${layerType}: oldMeasurement = ${oldMeasurement}, newMeasurement = ${newMeasurement}`);

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

            measurements[layerType] = (measurements[layerType] || 0) - oldMeasurement + newMeasurement;
            if (measurements[layerType] <= 0) measurements[layerType] = 0;
            console.log(`Redo - Updated measurements[${layerType}]: ${measurements[layerType]}`);
            updateMeasurementDisplay(layerType);

            history.push({ layerType, featureId, action: 'edit', oldFeature: feature.clone(), newFeature: newFeature.clone(), oldMeasurement, newMeasurement });
        }
    }
}

function handleSave() {
    const features = [];
    Object.entries(vectorLayers).forEach(([layerType, layer]) => {
        const source = layer.getSource();
        if (!source) return;

        source.getFeatures().forEach(feature => {
            const clone = feature.clone();
            const spec = LAYERS_SPECS[layerType];
            clone.setProperties({
                layerType,
                style: LAYERS_SPECS[layerType]
            });
            const geometry = feature.getGeometry();
            let measurement = 0;
            if (spec.geometryType === 'Polygon') {
                measurement = geometry.getArea() * (scale.inchToFeet ** 2) * calibrationFactor;
                clone.setProperties({ measurement: `${measurement.toFixed(2)} sqft` });
            } else if (spec.geometryType === 'LineString') {
                measurement = geometry.getLength() * scale.inchToFeet;
                clone.setProperties({ measurement: `${measurement.toFixed(2)} ft` });
            } else if (spec.geometryType === 'Point') {
                measurement = 1;
                clone.setProperties({ measurement: '1 N' });
            }
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

    if (confirm("Are you sure you have completed the data correctly?")) {
        dataref.update({
            status: "Completed",
            workedGeojson: JSON.parse(geoJSON)
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

    let baseLayerName = layerName;
    let suffix = 1;
    while (LAYERS_SPECS[layerName]) {
        layerName = `${baseLayerName}_${suffix}`;
        suffix++;
    }

    const icon = layerType === 'Point' ? '○' : layerType === 'LineString' ? '╱' : '■';
    LAYERS_SPECS[layerName] = {
        label: layerName,
        icon: icon,
        color: layerColor,
        geometryType: layerType
    };

    const projection = map.getView().getProjection();
    const source = new ol.source.Vector({ projection });
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

    const activeLayers = Object.fromEntries(
        Object.entries(LAYERS_SPECS).filter(([layerType]) => vectorLayers[layerType])
    );
    initLayersList(activeLayers);

    closeAddLayerPopup();

    const notification = document.getElementById('drawingNotification');
    notification.textContent = `Layer "${layerName}" added. Select to start drawing.`;
    notification.classList.add('visible');
    setTimeout(() => {
        notification.classList.remove('visible');
    }, 3000);
}

initMap();