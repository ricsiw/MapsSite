let lastLatLng = {lat: 0, lng: 0};
let changeTime = 0;
let iterLims = [];
let refresh = true;
let animate = false;
let increment = 12;
let colorLims = {min: 1, max: 10, incr: 1, alpha: 10};// default 1 20 4

function drawGraph() {
    let newLatLng = Globals.map.pixelToLatLng(0, 0);
    if (refresh) {
        refresh = false;
        changeTime = 0;
        lastLatLng = newLatLng;
        clear(); 
        noStroke();
        for (let i = 0; i < Consts.tableCount; i++) {
          if (Globals.tables[i].enabled)
            drawTable(Globals.tables[i], 0, Globals.tables[i].data.getRowCount());
        }
    } else if (animate && !Globals.paused) {
      for (let i = 0; i < Consts.tableCount; i++) {
        if (iterLims.length <= i) {
          iterLims.push({min: 0, max: increment});
        }
        if (iterLims[i].max < Globals.tables[i].data.getRowCount() - increment - 1) {
          drawTable(Globals.tables[i], iterLims[i].min, iterLims[i].max);
          iterLims[i].max+=increment;
          iterLims[i].min+=increment;
        }
      }
    } 
    if (newLatLng !== lastLatLng) {
        changeTime += deltaTime;
    }
}

function adjustPixel(p) {
    return Consts.graphicsMode == P2D ? p : {x: p.x - Consts.windowWidth / 2, y: p.y - Consts.windowHeight / 2};
}

function drawTable(table, iterMin, iterMax) {
    let c = lerpColor(table.fromColor, table.toColor, table.bgVisibility);
    c.setAlpha(2);
    fill(c);
    //const rowCount = table.data.getRowCount();

    blendMode(ADD);
    for (let i = iterMin; i < iterMax; i++) {
        let latLng = latLngFromString(table.data.getString(i, 3), table.data.getString(i, 4));
        let p = adjustPixel(Globals.map.latLngToPixel(latLng[0], latLng[1]));

        //fill(color(255,255,255,32));
        ///ellipse(p.x, p.y, 3, 3);
        c.setAlpha(colorLims.alpha);//(12 - Math.floor(j / 5)) / 2);
        fill(c);
        for (let j = colorLims.min; j < colorLims.max; j+=colorLims.incr) {
            ellipse(p.x, p.y, j, j);
        }
    }
    blendMode(BLEND);
    /*let pixLatLng;
    const maxDist = Math.pow(50, 2);
    let maxSum = 0;
    for (let y = 3; y < Consts.windowWidth; y+= 5) {
        for (let x = 3; x < Consts.windowHeight; x+= 5) {
            pixLatLng = Globals.map.pixelToLatLng(x, y);
            let sum = 0;
            for (let i = 0; i < rowCount; i++) {
                
                let latLng = latLngFromString(table.data.getString(i, 3), table.data.getString(i, 4));
                //let p = Globals.map.latLngToPixel(latLng[0], latLng[1]);
                let d = Math.min(pow(getDistanceFromLatLng(pixLatLng.lat, pixLatLng.lng, latLng[0], latLng[1]), 2), maxDist);
                sum += (maxDist - d) / maxDist;
            }
            color.setAlpha(min(sum / rowCount * 1000, 255));
            fill(color);
            rect(x - 3, y - 3, 5, 5);
            if (sum > maxSum) {
                maxSum = sum;
            }
        }
    }*/
}

function keyPressed() {
    if (key == 'e') {
      let enabledCount = 0;
      for (let i = 0; i < Consts.tableCount; i++) {
        if (Globals.tables[i].enabled) 
          enabledCount++;
      }
      for (let i = 0; i < Consts.tableCount; i++) {
        Globals.tables[i].enabled = enabledCount < Math.round(Consts.tableCount / 2);
      }
    }
    else if (key == 'r') {
        refresh = true;
    }
    else if (key == ' ') {
        Globals.paused = !Globals.paused;
    }
    else if (key == 'a') {
        if (!animate) {
          clear();
          for (let i = 0; i < iterLims.length; i++) {
              iterLims[i] = {min: 0, max: increment};
          }
          animate = true;
          iterMin = 0;
          iterMax = 1;
        } else {
          animate = false;
          iterMin = 0;
          iterMax = Globals.tables[0].data.getRowCount();
        }
    }
    else if (key == 'l') {
        Globals.showLegend = !Globals.showLegend;
    }
    else if (key == 'm') {
        Globals.keepBackground = !Globals.keepBackground;
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
      Consts.timeMultiplier = Math.max(0, Consts.timeMultiplier - Consts.timeMultiplierStep)
    }
    else if (keyCode == RIGHT_ARROW) {
        Consts.timeMultiplier = Consts.timeMultiplier + Consts.timeMultiplierStep
    }
    for (let i = 0; i < Consts.tableCount; i++) {
      if (key == i.toString()) {
        print(i)
        Globals.tables[i].enabled = !Globals.tables[i].enabled;
        refresh = true;
      }
    }
  }