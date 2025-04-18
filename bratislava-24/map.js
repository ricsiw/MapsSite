P5Capture.setDefaultOptions({
  format: "png",
  framerate: 24,
});

function getFileName(param) {
  return { path: 'data/export_tr' + param + '_akima.csv', fileType: 'ssv' };
}

function preload() {
  initOrigin(47.77156184, 17.86227096);
  initConsts(20, 3, 1100, 1100);
  const fileNameTags = ['0', '1', '3'];
  initMapData(getFileName, fileNameTags);
}

function setup() {
  setupVisualization(/*WEBGL*/);
}

function draw() {
  drawGraph();
}