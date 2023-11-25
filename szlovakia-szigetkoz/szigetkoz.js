const mappa = new Mappa('MapboxGL', 'pk.eyJ1Ijoicmljc2l3IiwiYSI6ImNsbnZ5bjM1czAxcmEybGxlcm54N2huMDAifQ.qaRqm5vzbvBtEfdgQabbYw');
const latOrigin = 47.77189508;
const lngOrigin = 17.86181482;
const showAmount = 50;
const radius = 6371000;
const radToDeg = (180 / Math.PI);
const degToRad = 1 / radToDeg;
const tableCount = 3;
let timeMultiplier = 9000;
let colors;
let myMap;
let canvas;
let minTick;
let tables;
let paused = false;
let showLegend = true;
var time = 0;

const options = {
  lat: 47.771456,
  lng: 17.861905,
  zoom: 17,
  style: 'mapbox://styles/ricsiw/clp6yh55f00is01pc8bywhgkm',
  pitch: 0,
};

function toTransparent(c) {
  return color(c.levels[0], c.levels[1], c.levels[2], 0)
}

function preload() {
  colors = [
    color(70, 240, 240),//
    color(230, 25, 75),//
    color(230, 200, 25),//
    color(128, 0, 0),
    color(128, 128, 0),
    color(0, 128, 128),
    color(0, 0, 128),
    color(245, 130, 48),
    color(0, 0, 0),
    color(240, 50, 230),
  ];

  tables = new Array();
  tables.push({data: loadTable('data/exp_akima.csv', 'csv'), counter: showAmount, enabled: true, name: "akima", toColor:colors[0], fromColor: toTransparent(colors[0])})
  tables.push({data: loadTable('data/exp_akima_movmean31.csv', 'csv'), counter: showAmount, enabled: false, name: "akima mean", toColor:colors[1], fromColor: toTransparent(colors[1])})
  tables.push({data: loadTable('data/exp_raw.csv', 'csv'), counter: showAmount, enabled: false, name: "raw", toColor:colors[2], fromColor: toTransparent(colors[2])})
}

function getTick(table) {
  return (new Date(table.data.getString(table.counter, 0)).getTime()) - minTick;
}

function setup() {
  minTick = new Date(8640000000000000);
  for (let i = 0; i < tableCount; i++) {
    let tick = new Date(tables[i].data.getString(tables[i].counter, 0)).getTime();
    if (tick < minTick) minTick = tick;
  }

  canvas = createCanvas(document.documentElement.scrollWidth - 20, document.documentElement.scrollHeight - 20);
  myMap = mappa.tileMap(options); 
  myMap.overlay(canvas)

  // Add a color to our ellipse
  fill(200, 100, 100);
}

/*function windowResized() {
  print("helo")
  let pageWidth  = document.documentElement.scrollWidth - 20;
  let pageHeight = document.documentElement.scrollHeight - 20;
  resizeCanvas(pageWidth, pageHeight);
}*/

function convert(x, y) {
  let lat = latOrigin + (y / radius) * radToDeg;
  let lng = lngOrigin + (x / (Math.cos(degToRad * latOrigin) * radius)) * radToDeg;
  return [lat, lng];
}

function draw() {
  let fromColor = color(255, 0, 0, 0);
  let toColor = color(255, 0, 0, 255);
  if (!paused) time += deltaTime * timeMultiplier;

  for (let i = 0; i < tableCount; i++) {
    if (getTick(tables[i]) <= time && tables[i].data.getRowCount() > tables[i].counter) {
      tables[i].counter++;
    }
  }

  clear(); 
  textAlign(LEFT, CENTER);
  textSize(16);
  fill(color(255,255,255));
  text(new Date(Math.floor(time) + minTick).toString(), 10, canvas.height - 50);

  if (showLegend) {
    text("Press num keys 0-" + (tableCount - 1) + " to hide/show an animal. | Press 'a' to hide/show all animals.", 50, 20);
    text("Press 'r' to restart. | Press the 'spacebar' to pause. | Press 'l' to hide/show legend.", 50, 40);
    text("Press the left and right arrows to control the playback speed.", 50, 60);

    strokeWeight(8);
    for (let i = 0; i < tableCount; i++) {
      if (!tables[i].enabled) continue;
      noStroke();
      text(tables[i].name, 10, 150 + i * 20);
      stroke(colors[i]);
      line(110, 150 + i * 20, 125, 150 + i * 20);
    }
    
    noStroke();
    textAlign(RIGHT, CENTER);
    fill("red")
    text(paused ? "paused" : "playback speed: " + timeMultiplier + "x", 830, 20);
  }

  noStroke();
  for (let i = 0; i < tableCount; i++) {
    drawTable(tables[i]);
  }
}

function drawTable(table) {
  if (table.counter >= table.data.getRowCount()) {
    table.counter = table.data.getRowCount() - 1;
  }
  if (table.enabled) { 
    for (let i = table.counter - showAmount; i <= table.counter; i++) {
      let c = lerpColor(table.fromColor, table.toColor, Math.pow((i - (table.counter - showAmount)) / showAmount, 1.2));
      fill(c);
      var x = Number(table.data.getString(i, 1));
      var y = Number(table.data.getString(i, 2));
      let latLng = convert(x, y);
      let p = myMap.latLngToPixel(latLng[0], latLng[1]);
      ellipse(p.x, p.y, 8, 8);
    }
  }
}

function keyPressed() {
  if (key == 'a') {
    let enabledCount = 0;
    for (let i = 0; i < tableCount; i++) {
      if (tables[i].enabled) 
        enabledCount++;
    }
    for (let i = 0; i < tableCount; i++) {
        tables[i].enabled = enabledCount < Math.round(tableCount / 2);
    }
  }
  else if (key == 'r') {
    for (let i = 0; i < tableCount; i++) {
      tables[i].counter = showAmount;
      time = 0;
    }
  }
  else if (key == ' ') {
    paused = !paused;
  }
  else if (key == 'l') {
    showLegend = !showLegend;
  }
  else if (keyCode == LEFT_ARROW) {
    print("hohoho")
    timeMultiplier = Math.max(0, timeMultiplier - 500)
  }
  else if (keyCode == RIGHT_ARROW) {
    timeMultiplier = timeMultiplier + 500
  }
  for (let i = 0; i < tableCount; i++) {
    if (key == i.toString()) {
      print(i)
      tables[i].enabled = !tables[i].enabled;
    }
  }
}