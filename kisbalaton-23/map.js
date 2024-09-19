const mappa = new Mappa('MapboxGL', 'pk.eyJ1Ijoicmljc2l3IiwiYSI6ImNsbnZ5bjM1czAxcmEybGxlcm54N2huMDAifQ.qaRqm5vzbvBtEfdgQabbYw');
const latOrigin = 47.77156184;
const lngOrigin = 17.86227096;
const showAmount = 20;
const radius = 6371000;
const radToDeg = (180 / Math.PI);
const degToRad = 1 / radToDeg;
const tableCount = 6;
let timeMultiplier = 4000;
let timeMultiplierStep = 250;
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
  lat: 46.7068892661239,
  lng: 17.1815387622227,
  zoom: 17,
  style: 'mapbox://styles/ricsiw/clp6yh55f00is01pc8bywhgkm',
  pitch: 0,
};

P5Capture.setDefaultOptions({
  format: "png",
  framerate: 25,
});

function toTransparent(c) {
  return color(c.levels[0], c.levels[1], c.levels[2], 0)
}

function preload() {
  colors = [
    color(70, 240, 240),//
    color(245, 156, 22),//
    color(230, 25, 75),//
    color(43, 217, 37),
    color(199, 199, 4),
    color(123, 16, 230),
    color(33, 81, 255),
    color(245, 130, 48),
    color(0, 0, 0),
    color(240, 50, 230),
  ];

  tables = new Array();
  let w = 800//document.documentElement.scrollWidth - 20;
  let h =  800//document.documentElement.scrollHeight - 20;

  let fileNameTags = ['3', '4','6','7','8','9'];

  for (let i = 0; i < tableCount; i++) {
    let pg = getImgArray(w, h);
    tables.push({data: loadTable('data/exportD' + fileNameTags[i] + '_akima.csv', 'csv', 'header'), img: pg, counter: 40, enabled: true, name: "akima D" + fileNameTags[i], trace: 40, bgVisibility: 0.01, toColor:colors[i], fromColor: toTransparent(colors[i])})
  }
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

function pixelAt(img, x, y) {
  return img.a[Math.floor(y / 3) * img.w + Math.floor(x / 3)];
}

function setPixel(img, x, y, v) {
  img.a[Math.floor(y / 3) * img.w + Math.floor(x / 3)] = v;
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

  canvas = createCanvas(800, 800);//(document.documentElement.scrollWidth - 20, document.documentElement.scrollHeight - 20);
  myMap = mappa.tileMap(options); 
  myMap.overlay(canvas)
}

/*function windowResized() {
  print("helo")
  let pageWidth  = document.documentElement.scrollWidth - 20;
  let pageHeight = document.documentElement.scrollHeight - 20;
  resizeCanvas(pageWidth, pageHeight);
}*/


function getDistanceFromLatLng(lat1,lon1,lat2,lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);  // deg2rad below
  var dLon = deg2rad(lon2-lon1); 
  var a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c * 1000; // Distance in m
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI/180)
}

function convert(x, y) {
  let lat = latOrigin + (y / radius) * radToDeg;
  let lng = lngOrigin + (x / (Math.cos(degToRad * latOrigin) * radius)) * radToDeg;
  return [lat, lng];
}

function latLngFromString(lat, lng) {
  return [Number(lat), Number(lng)];
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

  drawScale();

  noStroke();
  for (let i = 0; i < tableCount; i++) {
    drawTable(tables[i]);
  }
}

function drawScale() {
  let h = canvas.height - 56;
  let l = canvas.width - 160;
  let r = l + 120; 
  let latlng1 = myMap.pixelToLatLng(l, h);
  let latlng2 = myMap.pixelToLatLng(r, h); 
  let dist = getDistanceFromLatLng(latlng1.lat, latlng1.lng, latlng2.lat, latlng2.lng);
  strokeWeight(3);
  stroke(color(255,255,255))
  line(l, h, r, h)
  line (l, h - 5, l, h + 5)
  line (r, h - 5, r, h + 5)
  fill(color(255,255,255))
  noStroke();
  textAlign(CENTER, CENTER);
  text(Math.round(dist) + " m", l + (r-l) / 2, h + 16)
}

function drawTable(table) {
  if (table.counter >= table.data.getRowCount()) {
    table.counter = table.data.getRowCount() - 1;
  }
  if (table.enabled) {

    if (keepBackground) {
      let c2 = lerpColor(table.fromColor, table.toColor, table.bgVisibility);
      c2.setAlpha(2);
      fill(c2);
      for (let i = 0; i < table.counter; i++) {
        let latLng = latLngFromString(table.data.getString(i, 3), table.data.getString(i, 4));
        let p = myMap.latLngToPixel(latLng[0], latLng[1]);
        ellipse(p.x, p.y, 5, 5);
        ellipse(p.x, p.y, 8, 8);
        ellipse(p.x, p.y, 20, 20);
      }
    }

    for (let i = table.counter - table.trace; i <= table.counter; i++) {
      let latLng = latLngFromString(table.data.getString(i, 3), table.data.getString(i, 4));
      let p = myMap.latLngToPixel(latLng[0], latLng[1]);

      let c = lerpColor(table.fromColor, table.toColor, Math.pow((i - (table.counter - table.trace)) / table.trace, 3.0));

      if (i == table.counter) {
        //spreadHeatmap(table, lerpColor(table.fromColor, table.toColor, 1), p.x, p.y);
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
  /*let img = table.img;
  c.setAlpha(1);
  img.g.fill(c)
  for (let yi = -5; yi < 5; yi++) {
    for (let xi = -5; xi < 5; xi++) {
      let v = pixelAt(img, x, y);
      img.g.rect(x + xi * img.d, y + yi * img.d, img.d, img.d);
    }
  }*/
  pg = createGraphics(40, 40);
  pg.noStroke();
  pg.fill(c);
  pg.ellipse(17, 17, 6, 6);
  pg.filter(BLUR, 5);
  table.img.g.image(pg, x - 25, y - 25);
  image(table.img.g, 0, 0);
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
  else if (key == 'c') {
    const capture = P5Capture.getInstance();
    if (capture.state === "idle") {
      capture.start();
    } else {
      capture.stop();
    }
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