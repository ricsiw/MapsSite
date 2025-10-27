function drawGraph() {
    if (!Globals.paused) Globals.time += deltaTime * Consts.timeMultiplier;
    
    for (let i = 0; i < Consts.tableCount; i++) {
      while (Globals.tables[i].data.getRowCount() > Globals.tables[i].counter && getTick(Globals.tables[i]) <= Globals.time) {
        Globals.tables[i].counter++;
      }
    }
  
    clear(); 
    textAlign(LEFT, CENTER);
    textSize(16);
    fill(color(255,255,255));
    text(new Date(Math.floor(Globals.time) + Globals.minTick).toString(), 10, Globals.canvas.height - 50);
  
    if (Globals.showLegend) {
      text("Press num keys 0-9 and letters a-f (HEX) to hide/show an animal. | Press 'h' to hide/show all animals.", 50, 20);
      text("Press 'r' to restart. | Press the 'spacebar' to pause. | Press 'l' to hide/show legend.", 50, 40);
      text("Press the left and right arrows to control the playback speed. | Press 'm' to hide/show all data points so far.", 50, 60);
  
      strokeWeight(8);
      for (let i = 0; i < Consts.tableCount; i++) {
        if (!Globals.tables[i].enabled) continue;
        noStroke();
        text(Globals.tables[i].name, 10, 150 + i * 20);
        stroke(Globals.colors[i]);
        line(110, 150 + i * 20, 125, 150 + i * 20);
      }
      
      noStroke();
      textAlign(RIGHT, CENTER);
      fill("red")
      text(Globals.paused ? "paused" : "playback speed: " + Consts.timeMultiplier + "x", 830, 20);
    }
  
    drawScale();
  
    noStroke();
    for (let i = 0; i < Consts.tableCount; i++) {
      drawTable(Globals.tables[i]);
    }
  }
  
  function drawScale() {
    let h = Globals.canvas.height - 56;
    let l = Globals.canvas.width - 160;
    let r = l + 120; 
    let latlng1 = Globals.map.pixelToLatLng(l, h);
    let latlng2 = Globals.map.pixelToLatLng(r, h); 
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
  
      let firstRowTick = new Date(table.data.getString(0, 0)).getTime() - Globals.minTick;
      if (Globals.time < firstRowTick) {
        return; // Skip drawing this table until its start time
      }

      //blendMode(ADD);
      if (Globals.keepBackground) {
        let c2 = lerpColor(table.fromColor, table.toColor, table.bgVisibility);
        c2.setAlpha(1);
        fill(c2);
        for (let i = 0; i < table.counter; i++) {
          let latLng = latLngFromString(table.data.getString(i, 3), table.data.getString(i, 4));
          let p = Globals.map.latLngToPixel(latLng[0], latLng[1]);
          ellipse(p.x, p.y, 5, 5);
          ellipse(p.x, p.y, 8, 8);
          ellipse(p.x, p.y, 20, 20);
        }
      }
      //blendMode(BLEND);

      let lastRowTick = new Date(table.data.getString(table.data.getRowCount() - 1, 0)).getTime() - Globals.minTick;
      if (Globals.time > lastRowTick) {
        // Draw an X at the last position
        let latLng = latLngFromString(table.data.getString(table.data.getRowCount() - 1, 3), table.data.getString(table.data.getRowCount() - 1, 4));
        let p = Globals.map.latLngToPixel(latLng[0], latLng[1]);
        
        stroke(table.toColor);
        strokeWeight(2);
        var crossSize = 5;
        line(p.x - crossSize, p.y - crossSize, p.x + crossSize, p.y + crossSize);
        line(p.x - crossSize, p.y + crossSize, p.x + crossSize, p.y - crossSize);
        noStroke();
        return;
      }

      let realValue = table.data.columns.length < 6  || (table.data.columns.length >= 6 && (table.data.getString(table.counter, 5) === 'True'));
      let fromColor = realValue ? table.fromColor : color(255, 0, 0, 63);
      let toColor = realValue ? table.toColor : toTransparent(fromColor);
      for (let i = table.counter - table.trace; i <= table.counter; i += Math.min(Math.max(table.counter - i, 1), table.traceStep)) {
        let latLng = latLngFromString(table.data.getString(i, 3), table.data.getString(i, 4));
        let p = Globals.map.latLngToPixel(latLng[0], latLng[1]);
  
        let c = lerpColor(fromColor, toColor, Math.pow((i - (table.counter - table.trace)) / table.trace, 3.0));
  
        if (i == table.counter && realValue) {
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
  
  function keyPressed() {
    if (key == 'h') {
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
      for (let i = 0; i < Consts.tableCount; i++) {
        Globals.tables[i].counter = Globals.tables[i].trace;
        Globals.time = 0;
      }
    }
    else if (key == ' ') {
        Globals.paused = !Globals.paused;
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
      let hexKey = i < 10 ? i.toString() : String.fromCharCode(87 + i); // 10->'a', 11->'b', etc.
      if (key.toLowerCase() === hexKey) {
        print(i)
        Globals.tables[i].enabled = !Globals.tables[i].enabled;
      }
    }
  }