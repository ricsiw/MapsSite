function getFileName(param) {
  return { path: 'data/export_tr' + param + '_akima.csv', fileType: 'ssv' };
}

function preload() {
  initOrigin(47.77156184, 17.86227096);
  initConsts(20, 3, 900, 900);
  const fileNameTags = ['0', '1', '3'];
  initMapData(getFileName, fileNameTags);
}

function setup() {
  setupVisualization(/*WEBGL*/);
}

function draw() {
  drawGraph();
}