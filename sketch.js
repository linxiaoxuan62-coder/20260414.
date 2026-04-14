let seeds = [];
let weekData = [
  { week: 1, title: "基礎形狀", url: "week1/index.html" },
  { week: 2, title: "變數與迴圈", url: "week2/index.html" }
];
let displayIframe;

function setup() {
  // 建立畫布，預留空間給右側的 iframe
  let cvs = createCanvas(windowWidth, windowHeight);
  cvs.position(0, 0);
  
  // 動態建立 iframe
  displayIframe = select('#myIframe');
  if (!displayIframe) {
    displayIframe = createElement('iframe');
    displayIframe.id('myIframe');
    displayIframe.position(width * 0.4, 50);
    displayIframe.size(width * 0.55, height - 100);
    displayIframe.style('border', 'none');
    displayIframe.style('background', '#fff');
    displayIframe.style('border-radius', '10px');
    displayIframe.style('box-shadow', '0 4px 15px rgba(0,0,0,0.3)');
  }

  // 初始化每一週的種子物件
  for (let i = 0; i < weekData.length; i++) {
    // t 代表在藤蔓上的位置 (0.2 ~ 0.8 之間)
    let t = map(i, 0, weekData.length - 1, 0.8, 0.2);
    seeds.push(new Seed(weekData[i], t));
  }
}

function draw() {
  background(20, 30, 20); // 深色泥土感背景

  drawVine(); // 繪製生長的脈絡

  // 顯示並更新所有節點
  for (let s of seeds) {
    s.update();
    s.display();
  }
}

// 利用 Vertex 繪製動態藤蔓
function drawVine() {
  noFill();
  stroke(76, 175, 80, 150);
  strokeWeight(4);
  
  beginShape();
  for (let y = height; y > 0; y -= 10) {
    // 利用 noise 產生有機的晃動感
    let xOffset = noise(y * 0.01, frameCount * 0.01) * 100 - 50;
    let x = width * 0.2 + xOffset;
    vertex(x, y);
  }
  endShape();
}

// 週次種子類別
class Seed {
  constructor(data, t) {
    this.data = data;
    this.t = t; // 在垂直高度上的比例
    this.size = 20;
    this.interSize = 20;
    this.x = 0;
    this.y = 0;
    this.isHovered = false;
  }

  update() {
    // 根據目前的藤蔓形狀更新種子坐標
    this.y = height * this.t;
    let xOffset = noise(this.y * 0.01, frameCount * 0.01) * 100 - 50;
    this.x = width * 0.2 + xOffset;

    // 偵測滑鼠懸停
    let d = dist(mouseX, mouseY, this.x, this.y);
    if (d < this.size) {
      this.isHovered = true;
      this.interSize = lerp(this.interSize, 40, 0.2); // 放大特效
    } else {
      this.isHovered = false;
      this.interSize = lerp(this.interSize, 20, 0.1);
    }
  }

  display() {
    push();
    translate(this.x, this.y);
    
    // 利用 vertex 繪製花朵瓣片
    fill(this.isHovered ? '#FFD54F' : '#E91E63'); // 懸停時變色
    noStroke();
    let petals = 6;
    beginShape();
    for (let a = 0; a < TWO_PI; a += 0.1) {
      // 花瓣公式：利用極坐標產生波浪狀邊緣
      let r = this.interSize * (0.6 + 0.4 * cos(petals * a));
      let vx = r * cos(a);
      let vy = r * sin(a);
      vertex(vx, vy);
    }
    endShape(CLOSE);
    
    // 繪製花蕊
    fill('#FFEB3B');
    ellipse(0, 0, this.interSize * 0.4);

    // 標註週次文字
    fill(255);
    textAlign(RIGHT, CENTER);
    textSize(14);
    text(`W${this.data.week}: ${this.data.title}`, -20, 0);
    pop();
  }

  clicked() {
    let d = dist(mouseX, mouseY, this.x, this.y);
    if (d < this.size) {
      displayIframe.attribute('src', this.data.url);
    }
  }
}

function mousePressed() {
  for (let s of seeds) {
    s.clicked();
  }
}
