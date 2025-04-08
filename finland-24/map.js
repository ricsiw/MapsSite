P5Capture.setDefaultOptions({
  format: "png",
  framerate: 24,
});

function getFileName(param) {
  return { path: 'data/pygmy-owl-pos-data_akima-eet.csv', fileType: 'ssv' };
}

function preload() {
  initOrigin(63.066680, 23.551392, 14);
  initConsts(10, 1, 1100, 1100);
  const fileNameTags = ['0'];
  initMapData(getFileName, fileNameTags);
}

function setup() {
  setupVisualization(/*WEBGL*/);
}

function draw() {
  drawGraph();
}