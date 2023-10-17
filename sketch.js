let myMap;
let canvas;
let table;
const mappa = new Mappa('Leaflet');
const latOrigin = 47.7878539778665;
const lngOrigin = 18.231478521208;

// Lets put all our map options in a single object
const options = {
  lat: 47.787656,
  lng: 18.230863,
  zoom: 20,
  style: "http://{s}.tile.osm.org/{z}/{x}/{y}.png"
}

function preload() {
  table = loadTable('export.csv', 'csv');
}

function setup(){
  canvas = createCanvas(840,840);
  myMap = mappa.tileMap(options); 
  myMap.overlay(canvas)

  // Add a color to our ellipse
  fill(200, 100, 100);
}

const showAmount = 18;
var time = 0;
var counter = showAmount;

const radius = 6371000;
const radToDeg = (180 / Math.PI);
const degToRad = 1 / radToDeg;

function convert(x, y) {
  let lat = latOrigin + (y / radius) * radToDeg;
  let lng = lngOrigin + (x / (Math.cos(degToRad * latOrigin) * radius)) * radToDeg;
  return [lat, lng];
}

function draw() {
  const fromColor = color(255, 0, 0, 0);
  const toColor = color(255, 0, 0, 255);
  time += deltaTime;
  if (time > 500) {
    time = 0;
    counter++;
  }

  if (counter >= table.getRowCount()) {
    counter = showAmount;
    return;
  }

  clear(); 
  noStroke();

  for (let i = counter - showAmount; i <= counter; i++) {
    let c = lerpColor(fromColor, toColor, (i - counter + showAmount) / showAmount);
    fill(c);
    var x = Number(table.getString(i, 0));
    var y = Number(table.getString(i, 1));
    let latLng = convert(x, y);
    let p = myMap.latLngToPixel(latLng[0], latLng[1]);
    ellipse(p.x, p.y, 8, 8);
  }

  /*for (let i = 0; i < table.getRowCount(); i++) {
    var x = Number(table.getString(i, 0));
    var y = Number(table.getString(i, 1));

    fill(gre);
    noStroke();
    let latLng = convert(x, y);
    let p = myMap.latLngToPixel(latLng[0], latLng[1]);
    ellipse(p.x, p.y, 5, 5);
  }*/
}

function keyPressed() {
  // this will download the first 5 seconds of the animation!
  if (key === 's') {
    saveGif('mySketch', 3);
  }
}