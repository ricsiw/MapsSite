P5Capture.setDefaultOptions({
  format: "png",
  framerate: 24,
});

function getFileName(key) {
  // Map of unique keys to file names
  const fileMap = {
    "0": 'export_tr0_akima.csv',
    "1_05_01_14": 'export_tr1_05_01_14_akima.csv',
    "1": 'export_tr1_akima.csv',
    "2": 'export_tr2_akima.csv',
    "3_04_29_18": 'export_tr3_04_29_18_akima.csv',
    "3": 'export_tr3_akima.csv',
    "4": 'export_tr4_akima.csv',
    "5_04_29_18": 'export_tr5_04_29_18_akima.csv',
    "5": 'export_tr5_akima.csv',
    "6_04_30_20": 'export_tr6_04_30_20_akima.csv',
    "6_05_01_14": 'export_tr6_05_01_14_akima.csv',
    "6": 'export_tr6_akima.csv',
    "8_05_01_14": 'export_tr8_05_01_14_akima.csv',
    "8": 'export_tr8_akima.csv'
  };
  if (fileMap.hasOwnProperty(key)) {
    const filePath = 'data/' + fileMap[key];
    // Check if file exists using p5.js httpGet (async)
    httpGet(filePath, 'text',
      () => {}, // success, do nothing
      () => { console.log('File does not exist:', filePath); } // error
    );
    return { path: filePath, fileType: 'ssv' };
  } else {
    console.log('Key not found in fileMap:', key);
    return null;
  }
}

function preload() {
  initOrigin(45.804372, 18.478223, 14);
  // Update fileNameTags to use the keys from the map above
  const fileNameTags = [
    "0", "1_05_01_14", "1", "2", "3_04_29_18", "3", "4",
    "5_04_29_18", "5", "6_04_30_20", "6_05_01_14", "6", "8_05_01_14", "8"
  ];
  initConsts(5, fileNameTags.length, 1100, 1100);
  initMapData(getFileName, fileNameTags);
}

function setup() {
  setupVisualization();
}

function draw() {
  drawGraph();
}