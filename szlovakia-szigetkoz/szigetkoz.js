const mappa = new Mappa('MapboxGL', 'pk.eyJ1Ijoicmljc2l3IiwiYSI6ImNsbnZ5bjM1czAxcmEybGxlcm54N2huMDAifQ.qaRqm5vzbvBtEfdgQabbYw');
const latOrigin = 47.77156184;
const lngOrigin = 17.86227096;
const showAmount = 20;
const radius = 6371000;
const radToDeg = (180 / Math.PI);
const degToRad = 1 / radToDeg;
const tableCount = 3;
let timeMultiplier = 1100;
let timeMultiplierStep = 100;
let colors;
let myMap;
let canvas;
let minTick;
let tables;
let paused = false;
let showLegend = true;
let keepBackground = false;
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
  let w = document.documentElement.scrollWidth - 20;
  let h =  document.documentElement.scrollHeight - 20;
//  pg0 = {g: createGraphics(w, h, 'WEBGL'), a: Array(100).fill(0)};
//  pg0 = {g: createGraphics(w, h, 'WEBGL'), a: Array(100).fill(0)};
//  pg0 = {g: createGraphics(w, h, 'WEBGL'), a: Array(100).fill(0)};
  pg0 = createGraphics(w, h, 'WEBGL');
  pg1 = createGraphics(w, h, 'WEBGL');
  pg2 = createGraphics(w, h, 'WEBGL');
  tables.push({data: loadTable('data/export_akima.csv', 'csv'), pg: pg0, counter: 40, enabled: true, name: "akima", trace: 40, bgVisibility: 0.07, toColor:colors[0], fromColor: toTransparent(colors[0])})
  tables.push({data: loadTable('data/exp_akima_movmean31.csv', 'csv'), pg: pg1, counter: 40, enabled: false, name: "akima mean", trace: 40, bgVisibility: 0.07, toColor:colors[1], fromColor: toTransparent(colors[1])})
  tables.push({data: loadTable('data/export_raw.csv', 'csv'), pg: pg2, counter: 8, enabled: false, name: "raw", trace: 8, bgVisibility: 0.13, toColor:colors[2], fromColor: toTransparent(colors[2])})
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
    while (tables[i].data.getRowCount() > tables[i].counter && getTick(tables[i]) <= time) {
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
    text("Press the left and right arrows to control the playback speed. | Press 'm' to hide/show all data points so far.", 50, 60);

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

    if (keepBackground) {
      let c2 = lerpColor(table.fromColor, table.toColor, table.bgVisibility);
      fill(c2);
      for (let i = 0; i < table.counter; i++) {
        var x = Number(table.data.getString(i, 1));
        var y = Number(table.data.getString(i, 2));
        let latLng = convert(x, y);
        let p = myMap.latLngToPixel(latLng[0], latLng[1]);
        ellipse(p.x, p.y, 8, 8);
      }
    }

    for (let i = table.counter - table.trace; i <= table.counter; i++) {
      var x = Number(table.data.getString(i, 1));
      var y = Number(table.data.getString(i, 2));
      let latLng = convert(x, y);
      let p = myMap.latLngToPixel(latLng[0], latLng[1]);

      let c = lerpColor(table.fromColor, table.toColor, Math.pow((i - (table.counter - table.trace)) / table.trace, 3.0));

      //spreadHeatmap(table, lerpColor(table.fromColor, table.toColor, 1), p.x, p.y);

      if (i == table.counter) {
        fill(color(0, 0, 0))
        ellipse(p.x, p.y, 10, 10);
        fill(c);
        ellipse(p.x, p.y, 8, 8);
      }
      else {
        fill(c);
        ellipse(p.x, p.y, 8, 8);
      }
    }
  }
}

function spreadHeatmap(table, c, x, y) {
  //table.pg.loadPixels();
  table.pg.fill(c)
  table.pg.noStroke()
  /*table.pg.set(x, y, 0)
  table.pg.set(x + 1, y, 0)
  table.pg.set(x - 1, y, 0)
  table.pg.set(x, y + 1, 0)
  table.pg.set(x, y - 1, 0)*/
  //table.pg.get(x,y)
  table.pg.rect(x, y, 1, 1);
  table.pg.updatePixels()
  //table.pg.updatePixels();
  image(table.pg, 0, 0)
}

function pixelAt() {

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
      tables[i].counter = tables[i].trace;
      time = 0;
    }
  }
  else if (key == ' ') {
    paused = !paused;
  }
  else if (key == 'l') {
    showLegend = !showLegend;
  }
  else if (key == 'm') {
    keepBackground = !keepBackground;
  }
  else if (keyCode == LEFT_ARROW) {
    print("hohoho")
    timeMultiplier = Math.max(0, timeMultiplier - timeMultiplierStep)
  }
  else if (keyCode == RIGHT_ARROW) {
    timeMultiplier = timeMultiplier + timeMultiplierStep
  }
  for (let i = 0; i < tableCount; i++) {
    if (key == i.toString()) {
      print(i)
      tables[i].enabled = !tables[i].enabled;
    }
  }
}