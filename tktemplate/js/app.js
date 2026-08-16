import { layouts, colors } from './data.js';

class ImageGenerator {
  constructor() {
    this.canvas = document.getElementById('previewCanvas');
    this.ctx = this.canvas.getContext('2d');
    
    this.layoutSelect = document.getElementById('layoutSelect');
    this.colorSelect = document.getElementById('colorSelect');
    this.inputsContainer = document.getElementById('textInputsContainer');
    this.downloadBtn = document.getElementById('downloadBtn');

    // 30箇所のテキスト初期値
    this.textValues = Array.from({ length: 30 }, (_, i) => `Sample ${i + 1}`);

    this.init();
  }

  async init() {
    // Webフォントのロード完了を待機
    await document.fonts.load('18px "Noto Sans JP"');

    this.setupSelectOptions();
    this.setupTextInputs();
    this.attachEvents();
    this.render();
  }

  setupSelectOptions() {
    layouts.forEach((layout, index) => {
      const opt = document.createElement('option');
      opt.value = index;
      opt.textContent = layout.name;
      this.layoutSelect.appendChild(opt);
    });

    colors.forEach((color, index) => {
      const opt = document.createElement('option');
      opt.value = index;
      opt.textContent = color.name;
      this.colorSelect.appendChild(opt);
    });
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
    this.colorSelect.addEventListener('change', () => this.render());
    this.downloadBtn.addEventListener('click', () => this.downloadImage());
  }

  render() {
    const layout = layouts[this.layoutSelect.value];
    const color = colors[this.colorSelect.value];

    // 1. 背景描画
    this.ctx.fillStyle = color.bg;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // 2. テキスト描画 (30箇所)
    this.ctx.fillStyle = color.text;
    this.ctx.font = '18px "Noto Sans JP", sans-serif';

    layout.textPositions.forEach((pos, index) => {
      const text = this.textValues[index] || '';
      this.ctx.textAlign = pos.align || 'left';
      this.ctx.fillText(text, pos.x, pos.y);
    });

    // 3. 丸囲み描画
    this.ctx.strokeStyle = color.circle;
    this.ctx.lineWidth = 3;
    
    layout.circles.forEach(circle => {
      this.ctx.beginPath();
      this.ctx.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2);
      this.ctx.stroke();
    });
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
