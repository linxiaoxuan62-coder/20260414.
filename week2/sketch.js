let topPoints = [];
let bottomPoints = [];
let gameState = "START"; // START, PLAYING, WIN, LOST
let numPoints = 10; // 增加到 10 個點
let level = 1;      // 用於追蹤難度

function setup() {
  createCanvas(windowWidth, windowHeight); // 使用全螢幕
  generatePath();
}

function draw() {
  background(240);

  if (gameState === "START") {
    drawPath();
    fill(0, 200, 0);
    rect(0, topPoints[0].y, 40, bottomPoints[0].y - topPoints[0].y);
    fill(0);
    textSize(20);
    textAlign(CENTER);
    text("等級 " + level + "：點擊左側綠色區域開始", width / 2, height / 2);
    
    if (mouseIsPressed && mouseX < 40 && mouseY > topPoints[0].y && mouseY < bottomPoints[0].y) {
      gameState = "PLAYING";
    }
  } else if (gameState === "PLAYING") {
    drawPath();
    checkCollision();
    
    // 繪製結束區域
    fill(255, 200, 0);
    rect(width - 40, topPoints[numPoints - 1].y, 40, bottomPoints[numPoints - 1].y - topPoints[numPoints - 1].y);
    
    // 檢查是否到達終點
    if (mouseX > width - 40) {
      level++; // 過關後增加難度
      gameState = "WIN";
    }
  } else if (gameState === "WIN") {
    fill(0, 150, 0);
    textSize(32);
    textAlign(CENTER);
    text("恭喜過關！目前等級：" + level, width / 2, height / 2);
    textSize(16);
    text("點擊滑鼠挑戰下一關", width / 2, height / 2 + 40);
    if (mouseIsPressed) resetGame();
  } else if (gameState === "LOST") {
    fill(200, 0, 0);
    textSize(32);
    textAlign(CENTER);
    text("失敗了！", width / 2, height / 2);
    textSize(16);
    text("點擊滑鼠重新挑戰本關", width / 2, height / 2 + 40);
    if (mouseIsPressed) {
      gameState = "START";
      generatePath();
    }
  }
}

function generatePath() {
  topPoints = [];
  bottomPoints = [];
  let spacing = width / (numPoints - 1);
  
  for (let i = 0; i < numPoints; i++) {
    let x = i * spacing;
    let y = random(height * 0.1, height * 0.6);
    
    // 初始寬度設定在 50 到 85 之間，隨等級增加變窄
    let minGap = max(15, 50 - (level - 1) * 5);
    let maxGap = max(20, 85 - (level - 1) * 5);
    let gap = random(minGap, maxGap);
    
    topPoints.push(createVector(x, y));
    bottomPoints.push(createVector(x, y + gap));
  }
}

function drawPath() {
  noFill();
  stroke(0);
  strokeWeight(2);
  
  // 繪製上邊界曲線
  beginShape();
  if (topPoints.length > 0) curveVertex(topPoints[0].x, topPoints[0].y);
  for (let p of topPoints) {
    curveVertex(p.x, p.y);
  }
  if (topPoints.length > 0) curveVertex(topPoints[topPoints.length - 1].x, topPoints[topPoints.length - 1].y);
  endShape();
  
  // 繪製下邊界曲線
  beginShape();
  if (bottomPoints.length > 0) curveVertex(bottomPoints[0].x, bottomPoints[0].y);
  for (let p of bottomPoints) {
    curveVertex(p.x, p.y);
  }
  if (bottomPoints.length > 0) curveVertex(bottomPoints[bottomPoints.length - 1].x, bottomPoints[bottomPoints.length - 1].y);
  endShape();
}

function checkCollision() {
  // 尋找目前滑鼠所在的線段
  let spacing = width / (numPoints - 1);
  let index = floor(mouseX / spacing);
  
  if (index >= 0 && index < numPoints - 1) {
    // 取得曲線計算所需的四個點 (Catmull-Rom 需要前後控制點)
    let p0y = topPoints[max(0, index - 1)].y;
    let p1y = topPoints[index].y;
    let p2y = topPoints[index + 1].y;
    let p3y = topPoints[min(numPoints - 1, index + 2)].y;
    
    let b0y = bottomPoints[max(0, index - 1)].y;
    let b1y = bottomPoints[index].y;
    let b2y = bottomPoints[index + 1].y;
    let b3y = bottomPoints[min(numPoints - 1, index + 2)].y;
    
    let t = (mouseX - (index * spacing)) / spacing;
    
    // 使用 curvePoint 取得精確的 Y 座標
    let currentTopY = curvePoint(p0y, p1y, p2y, p3y, t);
    let currentBottomY = curvePoint(b0y, b1y, b2y, b3y, t);
    
    if (mouseY <= currentTopY || mouseY >= currentBottomY) {
      gameState = "LOST";
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  generatePath();
}

function resetGame() {
  generatePath();
  gameState = "START";
}
