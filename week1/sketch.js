let seaweeds = [];
let bubbles = [];
let popSound;
let soundEnabled = true; // 預設開啟音效

function preload() {
  popSound = loadSound('pop.mp3');
}

function setup() {
  let cnv = createCanvas(windowWidth, windowHeight);
  cnv.style('position', 'absolute');
  cnv.style('top', '0');
  cnv.style('left', '0');
  cnv.style('pointer-events', 'none'); // 讓滑鼠事件穿透畫布，以便操作 iframe
  cnv.style('z-index', '1'); // 畫布在最上層
  noStroke();

  // 建立全螢幕 iframe
  let iframe = createElement('iframe');
  iframe.attribute('src', 'https://www.et.tku.edu.tw');
  iframe.style('position', 'absolute');
  iframe.style('top', '0');
  iframe.style('left', '0');
  iframe.style('width', '100%');
  iframe.style('height', '100%');
  iframe.style('border', 'none');
  iframe.style('z-index', '0'); // iframe 在下層

  let colors = ['#9b5de5', '#f15bb5', '#fee440', '#00bbf9', '#00f5d4'];

  // 產生 80 條水草
  for (let i = 0; i < 80; i++) {
    seaweeds.push({
      x: random(width),               // 位置 (Position)
      hRatio: random(0.2, 0.45),      // 高度比例 (Height)
      thickness: random(40, 50),      // 粗細 (Thickness)
      colorCode: random(colors),      // 顏色 (Color)
      swayFreq: random(0.005, 0.02),  // 搖晃頻率 (Sway Frequency)
      noiseOffset: random(1000)       // 雜訊偏移
    });
  }
}

function draw() {
  clear(); // 清除畫布，確保透明度正確
  background(187, 222, 251, 255 * 0.3); // 背景色 #bbdefb，透明度 0.3
  blendMode(BLEND); // 設定混合模式，配合透明度產生重疊效果
  noStroke();
  
  for (let s of seaweeds) {
    // 將 Hex 字串轉為顏色物件並加入透明度
    let c = color(s.colorCode);
    c.setAlpha(150); // 設定透明度 (0-255)
    fill(c);
    
    let weedHeight = height * s.hRatio;
    let segments = 30;
    let radius = s.thickness / 2; // 因為 map 計算的是半寬，所以除以 2

    beginShape();

    // 左側
    for (let i = 0; i <= segments; i++) {
      let t = i / segments;
      let y = height - (t * weedHeight);
      let noiseVal = noise(t * 0.5 + s.noiseOffset, frameCount * s.swayFreq);
      let xOffset = map(noiseVal, 0, 1, -80, 80) * t;
      let w = map(t, 0, 1, radius, 0);
      curveVertex(s.x + xOffset - w, y);
    }

    // 右側
    for (let i = segments; i >= 0; i--) {
      let t = i / segments;
      let y = height - (t * weedHeight);
      let noiseVal = noise(t * 0.5 + s.noiseOffset, frameCount * s.swayFreq);
      let xOffset = map(noiseVal, 0, 1, -80, 80) * t;
      let w = map(t, 0, 1, radius, 0);
      curveVertex(s.x + xOffset + w, y);
    }

    endShape(CLOSE);
  }

  // --- 氣泡邏輯 ---
  // 隨機產生新氣泡
  if (random() < 0.05) { 
    bubbles.push({
      x: random(width),
      y: height + 10,
      size: random(10, 25),
      speed: random(1, 3),
      popY: random(height * 0.2, height * 0.8), // 設定一個隨機的破掉高度
      popped: false,
      popTimer: 0
    });
  }

  for (let i = bubbles.length - 1; i >= 0; i--) {
    let b = bubbles[i];
    
    if (!b.popped) {
      b.y -= b.speed; // 氣泡上升
      
      // 繪製氣泡本體 (白色，透明度 0.5 -> 127)
      noStroke();
      fill(255, 127);
      circle(b.x, b.y, b.size);
      
      // 繪製左上角亮點 (白色，透明度 0.8 -> 204)
      fill(255, 204);
      circle(b.x - b.size * 0.25, b.y - b.size * 0.25, b.size * 0.3);
      
      // 檢查是否到達破掉的高度
      if (b.y < b.popY) {
        b.popped = true;
        if (soundEnabled) {
          popSound.play();
        }
      }
    } else {
      // 破掉的效果：畫一個變大且變淡的圓框
      b.popTimer++;
      noFill();
      stroke(255, map(b.popTimer, 0, 10, 255, 0)); // 透明度隨時間遞減
      strokeWeight(2);
      circle(b.x, b.y, b.size + b.popTimer * 2); // 圓圈擴大
      
      // 動畫結束後從陣列移除
      if (b.popTimer > 10) {
        bubbles.splice(i, 1);
      }
    }
  }
}

function mousePressed() {
  soundEnabled = !soundEnabled; // 切換開關
  userStartAudio(); // 確保瀏覽器音訊環境已啟動
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
