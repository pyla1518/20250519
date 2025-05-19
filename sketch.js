let bgImg;
let images = [];
let imgPositions = [];
let dragging = [false, false, false, false, false];
let offset = [];
let symbols = ['ㄎㄞ ㄔㄜ', 'ㄆㄧㄥˊ ㄍㄨㄛˇ', 'ㄇㄠ ㄇㄧ', 'ㄒㄩㄥˊ', 'ㄑㄧㄥ ㄨㄚ'];
let boxPositions = [];
let answer = [1, 3, 4, 0, 2];
let matched = [false, false, false, false, false];
let matchedImg = [false, false, false, false, false];
let initialPositions = [];
let currentLevel = 1;
let fireworks = [];
let showFirework = false;
let startTime, endTime;
let errorCount = 0;
let totalCount = 0;

// 第一關原始對應
const symbols1 = ['ㄆㄧㄥˊ ㄍㄨㄛˇ', 'ㄒㄩㄥˊ', 'ㄑㄧㄥ ㄨㄚ', 'ㄎㄞ ㄔㄜ', 'ㄇㄠ ㄇㄧ'];
// 第三關對應
const symbols3 = ['ㄑㄧˋ ㄜˊ', 'ㄇㄛˊ ㄊㄧㄢ ㄌㄨㄣˊ', 'ㄌㄧㄡˇ ㄔㄥˊ ㄓ', 'ㄨㄤˋ ㄩㄢˇ ㄐㄧㄥˋ', 'ㄉㄧㄠ ㄒㄧㄤˋ'];

let allImages = [];
function preload() {
  bgImg = loadImage('注音小學堂 配對頁面.png');
  for (let i = 0; i < 15; i++) {
    allImages[i] = loadImage('img' + (i+1) + '.jpg');
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  // 第一關
  let randomOrder = [];
  for (let i = 0; i < 5; i++) randomOrder.push(i);
  for (let i = randomOrder.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [randomOrder[i], randomOrder[j]] = [randomOrder[j], randomOrder[i]];
  }
  let shuffledImages = [];
  let shuffledSymbols = [];
  let shuffledAnswer = [];
  for (let i = 0; i < 5; i++) {
    shuffledImages[i] = loadImage('img' + (randomOrder[i] + 1) + '.jpg');
    shuffledSymbols[i] = symbols1[i];
  }
  // 重新建立 answer：每個圖片（洗牌後）對應到哪個框
  for (let i = 0; i < 5; i++) {
    // 找出這張圖片原本對應的注音在 shuffledSymbols 的 index
    shuffledAnswer[i] = shuffledSymbols.indexOf(symbols1[randomOrder[i]]);
  }
  images = shuffledImages;
  symbols = shuffledSymbols;
  answer = shuffledAnswer;

  // setup() 及切換關卡時
  const boxWidth = 180;   // 注音框寬
  const imgWidth = 160;   // 圖片寬
  const imgHeight = 160;
  const gap = 220;        // 注音框間距（可微調）
  const offsetX = 60; // 左移一點點

  for (let i = 0; i < 5; i++) {
    boxPositions[i] = createVector(
      width/2 - ((5-1)*gap/2) + i * gap - offsetX,
      580
    );
    imgPositions[i] = createVector(
      boxPositions[i].x + (boxWidth - imgWidth)/2,
      240
    );
    initialPositions[i] = imgPositions[i].copy();
    dragging[i] = false;
    offset[i] = createVector(0, 0);
  }

  
  let boxesDiv = document.getElementById('boxes');
  boxesDiv.innerHTML = '';
  for (let i = 0; i < 5; i++) {
    let box = document.createElement('div');
    box.className = 'symbol-box';
    box.style.left = boxPositions[i].x + 'px';
    box.style.top = boxPositions[i].y + 'px';
    box.innerText = symbols[i];
    box.id = 'box' + i;
    box.style.width = '180px';      // 寬度變小
    box.style.height = '70px';      // 高度變小
    box.style.lineHeight = '70px';  // 垂直置中
    box.style.fontSize = '1.1rem'; // 新增：縮小字體
    boxesDiv.appendChild(box);
  }
  startTime = millis();
}

function draw() {
  // 等比例鋪滿背景
  let bgAspect = bgImg.width / bgImg.height;
  let winAspect = width / height;
  let drawW, drawH;
  if (winAspect > bgAspect) {
    drawW = width;
    drawH = width / bgAspect;
  } else {
    drawH = height;
    drawW = height * bgAspect;
  }
  imageMode(CENTER);
  image(bgImg, width/2, height/2, drawW, drawH);
  imageMode(CORNER); // 還原
  for (let i = 0; i < 5; i++) {
  if (matchedImg[i]) continue;
  if (!images[i] || !images[i].width || !images[i].height) continue; // 圖片未載入完成不畫
  if (dragging[i]) {
    tint(255, 120);
  } else {
    tint(255, 255);
  }
  // 等比例縮放到最大 160x160
  let maxW = 160, maxH = 160;
  let iw = images[i].width;
  let ih = images[i].height;
  let scale = Math.min(maxW / iw, maxH / ih);
  let drawW = iw * scale;
  let drawH = ih * scale;
  // 讓圖片在框內置中
  let drawX = imgPositions[i].x + (maxW - drawW) / 2;
  let drawY = imgPositions[i].y + (maxH - drawH) / 2;
  image(images[i], drawX, drawY, drawW, drawH);
}
noTint();
  // 標示正確配對
  for (let i = 0; i < 5; i++) {
    let box = document.getElementById('box' + i);
    if (box) {
      box.style.background = matched[i] ? 'rgba(0,255,0,0.3)' : 'rgba(255,255,255,0.3)';
    }
  }

  // --- 煙火特效 ---
  if (showFirework) {
    for (let i = fireworks.length - 1; i >= 0; i--) {
      fireworks[i].update();
      fireworks[i].show();
      if (fireworks[i].isDead()) {
        fireworks.splice(i, 1);
      }
    }
    // 持續補充煙火
    if (frameCount % 20 === 0) {
      launchFirework();
    }
  }
}

function mousePressed() {
  for (let i = 0; i < 5; i++) {
    if (
      mouseX > imgPositions[i].x && mouseX < imgPositions[i].x + 160 &&
      mouseY > imgPositions[i].y && mouseY < imgPositions[i].y + 160
    ) {
      dragging[i] = true;
      offset[i] = createVector(mouseX - imgPositions[i].x, mouseY - imgPositions[i].y);
    }
  }
}

function mouseDragged() {
  for (let i = 0; i < 5; i++) {
    if (dragging[i]) {
      imgPositions[i].x = mouseX - offset[i].x;
      imgPositions[i].y = mouseY - offset[i].y;
    }
  }
}

function mouseReleased() {
  for (let i = 0; i < 5; i++) {
    if (dragging[i]) {
      let matchedAny = false;
      for (let j = 0; j < 5; j++) {
        let bx = boxPositions[j].x, by = boxPositions[j].y;
        let imgCenterX = imgPositions[i].x + 80; // 圖片寬160
        let imgCenterY = imgPositions[i].y + 80;
        if (
          imgCenterX > bx && imgCenterX < bx + 120 &&
          imgCenterY > by && imgCenterY < by + 100
        ) {
          if (answer[i] === j) {
            imgPositions[i].x = bx;
            imgPositions[i].y = by;
            matched[j] = true; // 正確配對
            matchedImg[i] = true;
            totalCount++;
          } else {
            imgPositions[i].x = initialPositions[i].x;
            imgPositions[i].y = initialPositions[i].y;
            matched[j] = false;
            errorCount++;
            totalCount++;
            alert('答錯了');
          }
          matchedAny = true;
        }
      }
      // 如果沒放到任何框，也回原位
      if (!matchedAny) {
        imgPositions[i].x = initialPositions[i].x;
        imgPositions[i].y = initialPositions[i].y;
      }
    }
    dragging[i] = false;
  }
  // 新增：全部配對完成提示與按鈕
  if (matched.every(m => m) && !document.getElementById('next-btn')) {
    let btn = document.createElement('button');
    btn.id = 'next-btn';
    // 判斷是否為第三關
    btn.innerText = (currentLevel === 3) ? '挑戰完成' : '繼續挑戰';
    btn.style.position = 'fixed';
    btn.style.right = '2%'; // 靠右且不會變形
    btn.style.top = '88%'; // 再往上一點
    btn.style.transform = '';
    btn.style.fontSize = '2rem';
    btn.style.padding = '8px 24px';
    btn.style.zIndex = 1000;
    document.body.appendChild(btn);

    btn.onclick = function() {
      if (currentLevel >= 3) {
        // 第三關完成，顯示總結與煙火
        endTime = millis();
        let seconds = Math.round((endTime - startTime) / 1000);
        let correctCount = totalCount - errorCount;
        let accuracy = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 100;
        let summary = `花費時間：${seconds} 秒\n\n錯誤次數：${errorCount} 次\n\n配對正確率：${accuracy}%`;

        showFirework = true;
        launchFirework();
        let msg = document.createElement('div');
        msg.innerText = '恭喜你！你完成了注音配對小學堂！\n\n' + summary;
        msg.style.position = 'fixed';
        msg.style.left = '50%';
        msg.style.top = '45%'; // 往上移一些
        msg.style.transform = 'translate(-50%, -50%)'; // 讓總結視窗完全置中
        msg.style.fontSize = '3.2rem';
msg.style.padding = '30px 180px';      // 上下 30px，左右 180px，變寬變扁
msg.style.minWidth = '900px';          // 更寬
        msg.style.background = 'rgba(255,255,255,0.95)';
        msg.style.borderRadius = '20px';
        msg.style.zIndex = 1000;
        msg.style.whiteSpace = 'pre-line';
        document.body.appendChild(msg);
        btn.remove();

        // 只在這裡建立 replayBtn
        let replayBtn = document.createElement('button');
        replayBtn.innerText = '再玩一次';
        replayBtn.style.position = 'fixed';
        replayBtn.style.left = '50%';
        replayBtn.style.top = '80%'; // 讓按鈕再往上一點
        replayBtn.style.transform = 'translate(-50%, -50%)';
        replayBtn.style.fontSize = '1.5rem';
        replayBtn.style.padding = '12px 24px';
        replayBtn.style.zIndex = 1001;
        document.body.appendChild(replayBtn);

        replayBtn.onclick = function() {
          // 重設所有狀態
          currentLevel = 1;
          errorCount = 0;
          totalCount = 0;
          showFirework = false;
          fireworks = [];
          // 回到第一關題目
          symbols = ['ㄆㄧㄥˊ ㄍㄨㄛˇ', 'ㄒㄩㄥˊ', 'ㄑㄧㄥ ㄨㄚ', 'ㄎㄞ ㄔㄜ', 'ㄇㄠ ㄇㄧ'];
          answer = [0, 1, 2, 3, 4]; // 或依你的配對邏輯設定
          for (let i = 0; i < 5; i++) {
            images[i] = allImages[i];
            boxPositions[i] = createVector(width/2 - 560 + i * 280, 580);
            imgPositions[i] = createVector(boxPositions[i].x + 60, 240);
            initialPositions[i] = imgPositions[i].copy();
            dragging[i] = false;
            let box = document.getElementById('box' + i);
            if (box) {
              box.innerText = symbols[i];
              box.style.left = boxPositions[i].x + 'px';
              box.style.top = boxPositions[i].y + 'px';
              box.style.width = '260px';
            }
          }
          // 洗牌圖片
          let randomOrder = [];
          for (let i = 0; i < 5; i++) randomOrder.push(i);
          for (let i = randomOrder.length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * (i + 1));
            [randomOrder[i], randomOrder[j]] = [randomOrder[j], randomOrder[i]];
          }
          let shuffledImages = [];
          let shuffledSymbols = [];
          let shuffledAnswer = [];
          for (let i = 0; i < 5; i++) {
    shuffledImages[i] = allImages[randomOrder[i]]; // 第一關用第1~5張
    shuffledSymbols[i] = symbols1[i];
  }
          for (let i = 0; i < 5; i++) {
            shuffledAnswer[i] = shuffledSymbols.indexOf(symbols1[randomOrder[i]]);
          }
          images = shuffledImages;
          symbols = shuffledSymbols;
          answer = shuffledAnswer;
          // 新增：重設 matched 狀態
          for (let i = 0; i < 5; i++) {
            matched[i] = false;
            matchedImg[i] = false;
          }
          currentLevel = 1;
          startTime = millis();
          // 移除總結與按鈕
          this.remove();
          // 移除總結訊息
          if (msg && msg.parentNode) msg.parentNode.removeChild(msg);
          // 移除「挑戰完成」按鈕（如果還在）
          let nextBtn = document.getElementById('next-btn');
          if (nextBtn) nextBtn.remove();
        };
      } else if (currentLevel === 2) {
        // 切換到第三關
        currentLevel++;
        // 第三關注音內容與答案
        const symbols3 = ['ㄑㄧˋ ㄜˊ', 'ㄇㄛˊ ㄊㄧㄢ ㄌㄨㄣˊ', 'ㄌㄧㄡˇ ㄔㄥˊ ㄓ', 'ㄨㄤˋ ㄩㄢˇ ㄐㄧㄥˋ', 'ㄉㄧㄠ ㄒㄧㄤˋ'];
        symbols = symbols3.slice();

        // 洗牌
        let randomOrder = [];
        for (let i = 0; i < 5; i++) randomOrder.push(i);
        for (let i = randomOrder.length - 1; i > 0; i--) {
          let j = Math.floor(Math.random() * (i + 1));
          [randomOrder[i], randomOrder[j]] = [randomOrder[j], randomOrder[i]];
        }

        let shuffledImages = [];
        let shuffledAnswer = [];
        for (let i = 0; i < 5; i++) {
          shuffledImages[i] = loadImage('img' + (randomOrder[i] + 11) + '.jpg');
          shuffledAnswer[i] = symbols.indexOf(symbols3[randomOrder[i]]);
        }
        images = shuffledImages;
        answer = shuffledAnswer;

        // 重設 matched 狀態
for (let i = 0; i < 5; i++) {
  matched[i] = false;
  matchedImg[i] = false;
}

        // 同步更新畫面上的注音框內容
        for (let i = 0; i < 5; i++) {
          let box = document.getElementById('box' + i);
          if (box) {
            box.innerText = symbols[i];
          }
        }

        // 重設圖片位置
const boxWidth = 180;
const imgWidth = 160;
const imgHeight = 160;
for (let i = 0; i < 5; i++) {
  imgPositions[i] = createVector(boxPositions[i].x + (boxWidth - imgWidth) / 2, 240);
  initialPositions[i] = imgPositions[i].copy();
}

        btn.remove();
      } else {
        // 第一關切換到第二關
        currentLevel++;
        // 第二關注音內容（固定順序）
        const symbols2 = ["ㄧㄢˇ ㄐㄧㄥˋ", "ㄕㄨ ㄅㄠ", "ㄒㄧ ㄍㄨㄚ", "ㄉㄢˋ ㄍㄠ", "ㄌㄠˇ ㄏㄨˇ"];
        symbols = symbols2.slice();

        // 洗牌
        let randomOrder = [];
        for (let i = 0; i < 5; i++) randomOrder.push(i);
        for (let i = randomOrder.length - 1; i > 0; i--) {
          let j = Math.floor(Math.random() * (i + 1));
          [randomOrder[i], randomOrder[j]] = [randomOrder[j], randomOrder[i]];
        }

        let shuffledImages = [];
        let shuffledAnswer = [];
        for (let i = 0; i < 5; i++) {
          shuffledImages[i] = allImages[randomOrder[i] + 5]; // 用預載入的圖
          shuffledAnswer[i] = symbols.indexOf(symbols2[randomOrder[i]]);
        }
        images = shuffledImages;
        answer = shuffledAnswer;

        // 新增：重設 matched 狀態
for (let i = 0; i < 5; i++) {
  matched[i] = false;
  matchedImg[i] = false;
}

        // 新增：同步更新畫面上的注音框內容
        for (let i = 0; i < 5; i++) {
          let box = document.getElementById('box' + i);
          if (box) {
            box.innerText = symbols[i];
          }
        }

        // 新增：重設圖片位置
        const boxWidth = 180;
        const imgWidth = 160;
        const imgHeight = 160;
        for (let i = 0; i < 5; i++) {
          imgPositions[i] = createVector(boxPositions[i].x + (boxWidth - imgWidth) / 2, 240);
          initialPositions[i] = imgPositions[i].copy();
        }

        btn.remove();
      }
    };
  }
}

class FireworkParticle {
  constructor(x, y, color) {
    this.pos = createVector(x, y);
    let angle = random(TWO_PI);
    let speed = random(2, 6);
    this.vel = p5.Vector.fromAngle(angle).mult(speed);
    this.acc = createVector(0, 0.05);
    this.lifetime = 255;
    this.color = color;
  }
  update() {
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.lifetime -= 4;
  }
  show() {
    noStroke();
    fill(this.color.levels[0], this.color.levels[1], this.color.levels[2], this.lifetime);
    ellipse(this.pos.x, this.pos.y, 8);
  }
  isDead() {
    return this.lifetime < 0;
  }
}

function launchFirework() {
  for (let i = 0; i < 80; i++) {
    let x = random(width * 0.3, width * 0.7);
    let y = random(height * 0.2, height * 0.5);
    let c = color(random(200,255), random(100,255), random(100,255));
    fireworks.push(new FireworkParticle(x, y, c));
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);

  const boxWidth = 180;
  const imgWidth = 160;
  const gap = 220;
  const offsetX = 60; // 左移一點點
  for (let i = 0; i < 5; i++) {
    boxPositions[i].x = width/2 - ((5-1)*gap/2) + i * gap - offsetX;
    boxPositions[i].y = 580;
    let box = document.getElementById('box' + i);
    if (box) {
      box.style.left = boxPositions[i].x + 'px';
      box.style.top = boxPositions[i].y + 'px';
    }
    imgPositions[i].x = boxPositions[i].x + (boxWidth - imgWidth)/2;
    imgPositions[i].y = 240;
    initialPositions[i] = imgPositions[i].copy();
  }
}

console.log(images.map(img => img && img.width));
