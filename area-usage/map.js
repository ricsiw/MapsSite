function getFileName(param) {
  return 'data/exportD' + param + '_raw.csv';
}

function preload() {
  initOrigin(47.77156184, 47.77156184);
  initConsts(20, 6, 900, 900);
  const fileNameTags = ['3', '4', '6', '7', '8', '9'];
  initMapData(getFileName, fileNameTags);

}

function setup() {
  setupVisualization(WEBGL);
  loadGraphShader('../libraries/shader.frag', '../libraries/shader.vert');
}

function draw() {
  drawGraph();
}