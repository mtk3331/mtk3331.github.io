import { layouts } from './data.js';

class ImageGenerator {
  constructor() {
    this.canvas = document.getElementById('previewCanvas');
    this.ctx = this.canvas.getContext('2d');
    
    this.layoutSelect = document.getElementById('layoutSelect');
    this.inputsContainer = document.getElementById('textInputsContainer');
    this.downloadBtn = document.getElementById('downloadBtn');

    // 画像キャッシュ用
    this.imageCache = {};
    this.textValues = Array.from({ length: 30 }, (_, i) => `Sample ${i + 1}`);

    this.init();
  }

  async init() {
    await document.fonts.load('18px "Noto Sans JP"');

    this.setupSelectOptions();
    this.setupTextInputs();
    this.attachEvents();
    
    // 初回描画
    await this.render();
  }

  setupSelectOptions() {
    layouts.forEach((layout, index) => {
      const opt = document.createElement('option');
      opt.value = index;
      opt.textContent = layout.name;
      this.layoutSelect.appendChild(opt);
    });
    
    // カラー選択のセレクトボックスがHTMLに残っている場合は非表示にするか削除します
    const colorSelectLabel = document.querySelector('label[for="colorSelect"]');
    const colorSelect = document.getElementById('colorSelect');
    if (colorSelectLabel) colorSelectLabel.style.display = 'none';
    if (colorSelect) colorSelect.style.display = 'none';
  }

  setupTextInputs() {
    this.inputsContainer.innerHTML = '';
    this.textValues.forEach((val, index) => {
      const input = document.createElement('input');
      input.type = 'text';
      input.value = val;
      input.placeholder = `テキスト ${index + 1}`;
      input.dataset.index = index;
      input.addEventListener('input', (e) => {
        this.textValues[e.target.dataset.index] = e.target.value;
        this.render();
      });
      this.inputsContainer.appendChild(input);
    });
  }

  attachEvents() {
    this.layoutSelect.addEventListener('change', () => this.render());
    this.downloadBtn.addEventListener('click', () => this.downloadImage());
  }

  // 画像をロードするヘルパー関数
  loadImage(src) {
    if (this.imageCache[src]) {
      return Promise.resolve(this.imageCache[src]);
    }
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.imageCache[src] = img;
        resolve(img);
      };
      img.onerror = reject;
      img.src = src;
    });
  }

  async render() {
    const layout = layouts[this.layoutSelect.value];

    try {
      // 1. 背景画像の読み込みと描画
      const img = await this.loadImage(layout.imagePath);
      
      // 画像サイズに合わせてCanvasの幅・高さを自動調整（固定したい場合はここを変更）
      this.canvas.width = img.naturalWidth || 800;
      this.canvas.height = img.naturalHeight || 600;

      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.drawImage(img, 0, 0);

      // 2. テキスト描画 (30箇所)
      this.ctx.font = '18px "Noto Sans JP", sans-serif';

      layout.textPositions.forEach((pos, index) => {
        const text = this.textValues[index] || '';
        this.ctx.fillStyle = pos.color || '#000000';
        this.ctx.textAlign = pos.align || 'left';
        this.ctx.fillText(text, pos.x, pos.y);
      });

      // 3. 丸囲み描画
      this.ctx.lineWidth = 3;
      layout.circles.forEach(circle => {
        this.ctx.strokeStyle = circle.color || '#FF0000';
        this.ctx.beginPath();
        this.ctx.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2);
        this.ctx.stroke();
      });
    } catch (error) {
      console.error('画像の読み込みに失敗しました:', error);
    }
  }

  downloadImage() {
    const link = document.createElement('a');
    link.download = `generated_image.png`;
    link.href = this.canvas.toDataURL('image/png');
    link.click();
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new ImageGenerator();
});
