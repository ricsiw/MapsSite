// -------------------------------------------------------- VARIABLES -------------------------------------------------------

const Consts = {
    radToDeg: (180 / Math.PI),
    degToRad: 1 / (180 / Math.PI),
    mappa: new Mappa('MapboxGL', 'pk.eyJ1Ijoicmljc2l3IiwiYSI6ImNsbnZ5bjM1czAxcmEybGxlcm54N2huMDAifQ.qaRqm5vzbvBtEfdgQabbYw'),
    latOrigin: 47.77156184,
    lngOrigin: 17.86227096,
    showAmount: 20,
    radius: 6371000,
    tableCount: 6,
    timeMultiplier: 4000,
    timeMultiplierStep: 250,
    windowWidth: null,
    windowHeight: null,
    graphicsMode: null,
    options: {
        lat: 46.7068892661239,
        lng: 17.1815387622227,
        zoom: 17,
        style: 'mapbox://styles/ricsiw/clp6yh55f00is01pc8bywhgkm',
        pitch: 0,
    }
};

const Globals = {
    colors: null,
    map: null,
    canvas: null,
    minTick: null,
    tables: null,
    paused: false,
    showLegend: true,
    keepBackground: false,
    time: 0
};

let initDone = false;

// ---------------------------------------------------------- INIT ----------------------------------------------------------

function initVisualizationData() {
    if (initDone) return;
    initDone = true;
    Globals.colors = [
        color(70, 240, 240),
        color(245, 156, 22),
        color(230, 25, 75),
        color(43, 217, 37),
        color(199, 199, 4),
        color(123, 16, 230),
        color(33, 81, 255),
        color(245, 130, 48),
        color(0, 0, 0),
        color(240, 50, 230),
    ];

    if (Consts.windowWidth == null)Consts.windowWidth = document.documentElement.scrollWidth - 20;
    if (Consts.windowHeight == null)Consts.windowHeight = document.documentElement.scrollHeight - 20;
}

function initOrigin(lat, lng, zoom = 17) {
    if (!initDone) initVisualizationData();
    Consts.latOrigin = lat;
    Consts.lngOrigin = lng;
    Consts.options.lat = lat;
    Consts.options.lng = lng;
    Consts.options.zoom = zoom;
}

function initConsts(showAmount, tableCount, windowWidth = document.documentElement.scrollWidth - 20, windowHeight = document.documentElement.scrollHeight - 20) {
    if (!initDone) initVisualizationData();
    Consts.showAmount = showAmount;
    Consts.tableCount = tableCount;
    Consts.windowWidth = Math.min(windowWidth, document.documentElement.scrollWidth - 20);
    Consts.windowHeight = Math.min(windowHeight, document.documentElement.scrollHeight - 20);
}

function initMapData(fileNameFunc, fileNameTags) {
    Globals.tables = new Array();

    for (let i = 0; i < Consts.tableCount; i++) {
      let pg = getImgArray(Consts.windowWidth, Consts.windowHeight);
      let fileName = fileNameFunc(fileNameTags[i]);
      Globals.tables.push({data: loadTable(fileName.path, 'fileType' in fileName ? fileName.fileType : 'csv', 'header'), img: pg, counter: 0, enabled: true, name: "tr" + fileNameTags[i], trace: 30, traceStep: 2, bgVisibility: 0.005, toColor: Globals.colors[i], fromColor: toTransparent(Globals.colors[i])})
      Globals.tables[i].counter = Globals.tables[i].trace;
    }
}

P5Capture.setDefaultOptions({
    format: "png",
    framerate: 25,
});

function setupVisualization(mode = P2D) {
    Globals.minTick = new Date(8640000000000000);

    for (let i = 0; i < Consts.tableCount; i++) {
      let tick = new Date(Globals.tables[i].data.getString(Globals.tables[i].counter, 0)).getTime();
      if (tick < Globals.minTick) Globals.minTick = tick;
    }
  
    Consts.graphicsMode = mode;
    Globals.canvas = createCanvas(Consts.windowWidth, Consts.windowHeight, mode);
    Globals.map = Consts.mappa.tileMap(Consts.options); 
    Globals.map.overlay(Globals.canvas)
}

//---------------------------------------------------------- HELPERS ----------------------------------------------------------

function toTransparent(c) {
    return color(c.levels[0], c.levels[1], c.levels[2], 0)
}

function getImgArray(w, h) {
    let size = Math.floor(w / 3) * Math.floor(h / 3);
    let img = {g: createGraphics(w, h, 'WEBGL'), a: Array(size).fill(0), w: w, h: h, d: 3};
    img.g.noStroke();
    return img;
}

function clearImgArray(a) {
    a.fill(0);
}

function pixel(px, py) {
    return {x: px, y: py};
}

function pixelAt(img, x, y) {
    return img.a[Math.floor(y / 3) * img.w + Math.floor(x / 3)];
}

function setPixel(img, x, y, v) {
    img.a[Math.floor(y / 3) * img.w + Math.floor(x / 3)] = v;
}

function getTick(table) {
    return (new Date(table.data.getString(table.counter, 0)).getTime()) - Globals.minTick;
}

function getDistanceFromLatLng(lat1, lon1, lat2, lon2) {
    let dLat = deg2rad(lat2 - lat1);  // deg2rad below
    let dLon = deg2rad(lon2 - lon1); 
    let a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
        Math.sin(dLon / 2) * Math.sin(dLon / 2)
        ; 
    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
    let d = Consts.radius * c; // Distance in m
    return d;
}
  
function deg2rad(deg) {
    return deg * (Math.PI / 180)
}

function convert(x, y) {
    let lat = Consts.latOrigin + (y / Consts.radius) * Consts.radToDeg;
    let lng = Consts.lngOrigin + (x / (Math.cos(Consts.degToRad * Consts.latOrigin) * Consts.radius)) * Consts.radToDeg;
    return [lat, lng];
}

function latLngFromString(lat, lng) {
    return [Number(lat), Number(lng)];
}


//---------------------------------------------------------- SYS FUNCS ----------------------------------------------------------

/*function windowResized() {
    let pageWidth  = document.documentElement.scrollWidth - 20;
    let pageHeight = document.documentElement.scrollHeight - 20;
    resizeCanvas(pageWidth, pageHeight);
}*/