function getFileName(param) {
  return { path: 'data/export_tr' + param + '_akima.csv', fileType: 'ssv' };
}

function preload() {
  initOrigin(47.77156184, 17.86227096);

  const container = select('#controls');
  initConsts(20, 3, container.width, container.height);
  const fileNameTags = ['0', '1', '3'];
  initMapData(getFileName, fileNameTags);
}

function setup() {
  setupVisualization(/*WEBGL*/);
  Globals.canvas.parent('controls'); // Append the canvas to the controls div
  Globals.canvas.id('p5Canvas'); // Assign an ID to the canvas

  // Get HTML elements
  const startButton = select('#startButton');
  const stopButton = select('#stopButton');
  const speedSlider = select('#speedSlider');
  const textInput = select('#textInput');

  // Add event listeners
  /*startButton.mousePressed(startSketch);
  stopButton.mousePressed(stopSketch);
  speedSlider.input(updateSpeed);
  textInput.input(updateText);*/
}

function windowResized () {
  const container = select('#controls');
  const containerWidth = container.width;
  const containerHeight = container.height;
  resizeCanvas(containerWidth, containerHeight);
}

function draw() {
  drawGraph();
}