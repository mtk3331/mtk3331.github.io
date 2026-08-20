import { layouts, availableFonts, defaultP1Labels } from './data.js';

class ImageGenerator {
  constructor() {
    this.canvas = document.getElementById('previewCanvas');
    this.ctx = this.canvas.getContext('2d');
    
    this.layoutSelect = document.getElementById('layoutSelect');
    this.designSelect = document.getElementById('designSelect');
    
    this.inputsContainer = document.getElementById('textInputsContainer');
    this.p1Container = document.getElementById('pattern1Container');
    this.p2Container = document.getElementById('pattern2Container');
    this.p4Container = document.getElementById('pattern4Container');
    
    this.markColorInput = document.getElementById('markColorInput');
    this.baseFontSelect = document.getElementById('baseFontSelect'); // 全体フォント用UI
    
    this.userImageLabel = document.getElementById('userImageLabel');
    this.userImageInput = document.getElementById('userImageInput');
    this.userImageScaleInput = document.getElementById('userImageScaleInput');

    // キャッシュ保存用UI
    this.saveNameInput = document.getElementById('saveNameInput');
    this.saveDataBtn = document.getElementById('saveDataBtn');
    this.savedDataSelect = document.getElementById('savedDataSelect');
    this.loadDataBtn = document.getElementById('loadDataBtn');
    this.overwriteBtn = document.getElementById('overwriteBtn');
    this.deleteBtn = document.getElementById('deleteBtn');

    // 説明ダイアログ用UI
    this.helpDialog = document.getElementById('helpDialog');
    this.openHelpBtn = document.getElementById('openHelpBtn');
    this.closeHelpBtn = document.getElementById('closeHelpBtn');
    this.closeHelpBtnTop = document.getElementById('closeHelpBtnTop');
    
    this.downloadBtn = document.getElementById('downloadBtn');
    this.exportCoordsBtn = document.getElementById('exportCoordsBtn');

    // 位置調整用UI要素
    this.posControlPanel = document.getElementById('positionControlPanel');
    this.posXInput = document.getElementById('posXInput');
    this.posYInput = document.getElementById('posYInput');
    this.btnUp = document.getElementById('btnUp');
    this.btnDown = document.getElementById('btnDown');
    this.btnLeft = document.getElementById('btnLeft');
    this.btnRight = document.getElementById('btnRight');

    this.imageCache = {};
    this.storageKey = 'image_generator_saved_data';
    
    this.markColor = this.markColorInput ? this.markColorInput.value : '#000000';
    this.baseFont = availableFonts[0]?.value || '"Noto Sans JP", sans-serif'; // 全体フォント初期値
    
    this.uploadedImage = null;
    this.uploadedImageDataUrl = null;
    this.userImageScale = this.userImageScaleInput ? parseInt(this.userImageScaleInput.value, 10) : 100;
    this.baseImageWidth = 200;
    this.baseImageHeight = 200;
    this.uploadedImagePos = { x: 50, y: 50, width: 200, height: 200 };

    this.textValues = [];
    this.p1States = Array(25).fill(false);
    this.p2Values = [50, 50, 50, 50];
    
    const initialP4Len = layouts[0]?.p4Positions?.length || 6;
    this.p4Values = Array(initialP4Len).fill('');

    this.isDragging = false;
    this.dragTarget = null;
    this.selectedTarget = null;
    this.dragOffsetX = 0;
    this.dragOffsetY = 0;

    this.init();
  }

  async init() {
    await Promise.all([
      document.fonts.load('18px "Noto Sans JP"'),
      document.fonts.load('18px "Zen Kaku Gothic New"'),
      document.fonts.load('18px "M PLUS Rounded 1c"'),
      document.fonts.load('18px "Dela Gothic One"'),
      document.fonts.load('18px "Kiwi Maru"')
    ]).catch(() => {});

    this.setupSelectOptions();
    this.setupBaseFontSelect(); // 全体フォント選択肢の生成
    this.setupDesignOptions();
    this.setupLayoutConfig();
    this.setupTextInputs();
    this.setupPattern1UI();
    this.setupPattern2UI();
    this.setupPattern4UI();
    this.refreshSavedDataSelect();
    
    this.attachEvents();
    this.attachDragEvents();
    
    await this.render();
  }

  setupSelectOptions() {
    if (!this.layoutSelect) return;
    this.layoutSelect.innerHTML = '';
    layouts.forEach((layout, index) => {
      const opt = document.createElement('option');
      opt.value = index;
      opt.textContent = layout.name;
      this.layoutSelect.appendChild(opt);
    });
  }

  // 全体フォントドロップダウンの初期化
  setupBaseFontSelect() {
    if (!this.baseFontSelect) return;
    this.baseFontSelect.innerHTML = '';
    availableFonts.forEach(f => {
      const opt = document.createElement('option');
      opt.value = f.value;
      opt.textContent = f.name;
      if (f.value === this.baseFont) opt.selected = true;
      this.baseFontSelect.appendChild(opt);
    });
  }

  setupDesignOptions() {
    if (!this.designSelect) return;

    const layout = layouts[this.layoutSelect.value];
    const availableDesigns = layout?.designs || [];

    this.designSelect.innerHTML = '';
    if (availableDesigns.length === 0) {
      const opt = document.createElement('option');
      opt.value = 0;
      opt.textContent = '標準デザイン';
      this.designSelect.appendChild(opt);
    } else {
      availableDesigns.forEach((design, index) => {
        const opt = document.createElement('option');
        opt.value = index;
        opt.textContent = design.name;
        this.designSelect.appendChild(opt);
      });
    }

    const selectedDesign = availableDesigns[this.designSelect.value] || availableDesigns[0];
    if (selectedDesign?.defaultMarkColor && this.markColorInput) {
      this.markColor = selectedDesign.defaultMarkColor;
      this.markColorInput.value = selectedDesign.defaultMarkColor;
    }
  }

  setupLayoutConfig() {
    const layout = layouts[this.layoutSelect.value];
    if (this.userImageLabel && layout?.userImageLabel) {
      this.userImageLabel.textContent = layout.userImageLabel;
    }
  }

  // テキスト入力フォーム（初期値 data.js 連動・個別フォント切替）
  setupTextInputs() {
    this.inputsContainer.innerHTML = '';
    const layout = layouts[this.layoutSelect.value];
    const positions = layout?.textPositions || [];

    // レイアウトの初期値（defaultValue）を考慮して textValues を初期化
    if (this.textValues.length !== positions.length) {
      this.textValues = positions.map((pos, i) => {
        if (this.textValues[i] !== undefined) return this.textValues[i];
        return pos.defaultValue !== undefined ? pos.defaultValue : `Sample ${i + 1}`;
      });
    }

    positions.forEach((pos, index) => {
      const val = this.textValues[index] !== undefined ? this.textValues[index] : (pos.defaultValue || `Sample ${index + 1}`);

      const block = document.createElement('div');
      block.className = 'text-input-block';

      const labelElement = document.createElement('div');
      labelElement.className = 'label-title';
      labelElement.textContent = pos.label || `テキスト ${index + 1}`;

      const textArea = document.createElement('textarea');
      textArea.value = val;
      textArea.rows = 2;
      textArea.placeholder = 'テキストを入力（改行可）';
      textArea.addEventListener('input', (e) => {
        this.textValues[index] = e.target.value;
        this.render();
      });

      const controls = document.createElement('div');
      controls.className = 'text-input-controls';

      // 1. 個別色グループ
      const colorGroup = document.createElement('div');
      colorGroup.style.display = 'flex';
      colorGroup.style.alignItems = 'center';
      colorGroup.style.gap = '0.3rem';

      const useColorCheckbox = document.createElement('input');
      useColorCheckbox.type = 'checkbox';
      useColorCheckbox.checked = !!pos.useCustomColor;
      useColorCheckbox.title = '個別色を指定する';

      const colorInput = document.createElement('input');
      colorInput.type = 'color';
      colorInput.value = pos.color || this.markColor;
      colorInput.disabled = !pos.useCustomColor;
      colorInput.title = '文字色';

      useColorCheckbox.addEventListener('change', (e) => {
        pos.useCustomColor = e.target.checked;
        colorInput.disabled = !pos.useCustomColor;
        this.render();
      });

      colorInput.addEventListener('input', (e) => {
        pos.color = e.target.value;
        this.render();
      });

      colorGroup.appendChild(useColorCheckbox);
      colorGroup.appendChild(colorInput);

      // 2. 文字サイズ
      const sizeInput = document.createElement('input');
      sizeInput.type = 'number';
      sizeInput.value = pos.fontSize || 36;
      sizeInput.min = 8;
      sizeInput.max = 200;
      sizeInput.title = '文字サイズ(px)';
      sizeInput.addEventListener('input', (e) => {
        pos.fontSize = parseInt(e.target.value, 10) || 12;
        this.render();
      });

      // 3. 個別フォントグループ
      const fontGroup = document.createElement('div');
      fontGroup.style.display = 'flex';
      fontGroup.style.alignItems = 'center';
      fontGroup.style.gap = '0.3rem';

      const useFontCheckbox = document.createElement('input');
      useFontCheckbox.type = 'checkbox';
      useFontCheckbox.checked = !!pos.useCustomFont;
      useFontCheckbox.title = '個別フォントを指定する';

      const fontSelect = document.createElement('select');
      fontSelect.disabled = !pos.useCustomFont;
      fontSelect.title = 'フォント';

      availableFonts.forEach(f => {
        const opt = document.createElement('option');
        opt.value = f.value;
        opt.textContent = f.name;
        if (f.value === (pos.fontFamily || this.baseFont)) opt.selected = true;
        fontSelect.appendChild(opt);
      });

      useFontCheckbox.addEventListener('change', (e) => {
        pos.useCustomFont = e.target.checked;
        fontSelect.disabled = !pos.useCustomFont;
        this.render();
      });

      fontSelect.addEventListener('change', (e) => {
        pos.fontFamily = e.target.value;
        this.render();
      });

      fontGroup.appendChild(useFontCheckbox);
      fontGroup.appendChild(fontSelect);

      // 4. 揃え位置
      const alignSelect = document.createElement('select');
      alignSelect.title = '揃え位置';
      const alignOptions = [
        { name: '左寄せ', value: 'left' },
        { name: '中央揃え', value: 'center' },
        { name: '右寄せ', value: 'right' }
      ];
      alignOptions.forEach(opt => {
        const option = document.createElement('option');
        option.value = opt.value;
        option.textContent = opt.name;
        if (opt.value === (pos.align || 'left')) option.selected = true;
        alignSelect.appendChild(option);
      });
      alignSelect.addEventListener('change', (e) => {
        pos.align = e.target.value;
        this.render();
      });

      controls.appendChild(sizeInput);
      controls.appendChild(colorGroup);
      controls.appendChild(fontGroup);
      controls.appendChild(alignSelect);

      block.appendChild(labelElement);
      block.appendChild(textArea);
      block.appendChild(controls);
      this.inputsContainer.appendChild(block);
    });
  }

setupPattern1UI() {
    if (!this.p1Container) return;
    this.p1Container.innerHTML = '';

    const layout = layouts[this.layoutSelect.value];

    // p1Positions や p1Labels が非存在、または空かどうか判定
    const hasPositions = layout?.p1Positions && layout.p1Positions.length > 0;
    const hasLabels = layout?.p1Labels && (
      (layout.p1Labels.cols && layout.p1Labels.cols.length > 0) ||
      (layout.p1Labels.rows && layout.p1Labels.rows.length > 0)
    );

    // いずれかが空・未定義の場合は非表示にして処理を抜ける
    if (!hasPositions || !hasLabels) {
      this.p1Container.style.display = 'none';
      return;
    }

    // データが存在する場合は再表示
    this.p1Container.style.display = '';

    const labels = layout.p1Labels;

    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    
    headerRow.appendChild(document.createElement('th'));
    (labels?.cols || []).forEach(colName => {
      const th = document.createElement('th');
      th.textContent = colName;
      th.style.textAlign = 'center';
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    for (let r = 0; r < 5; r++) {
      const tr = document.createElement('tr');
      const rowHeader = document.createElement('th');
      rowHeader.textContent = labels?.rows?.[r] || `行${r + 1}`;
      rowHeader.style.verticalAlign = 'middle';
      tr.appendChild(rowHeader);

      for (let c = 0; c < 5; c++) {
        const idx = r * 5 + c;
        const td = document.createElement('td');
        td.style.textAlign = 'center';
        
        const input = document.createElement('input');
        input.type = 'checkbox';
        input.checked = this.p1States[idx];
        input.addEventListener('change', (e) => {
          this.p1States[idx] = e.target.checked;
          this.render();
        });
        
        td.appendChild(input);
        tr.appendChild(td);
      }
      tbody.appendChild(tr);
    }
    table.appendChild(tbody);
    this.p1Container.appendChild(table);
  }

  setupPattern2UI() {
    if (!this.p2Container) return;
    this.p2Container.innerHTML = '';

    const layout = layouts[this.layoutSelect.value];
    const positions = layout?.p2Positions || [];

    if (this.p2Values.length !== positions.length) {
      this.p2Values = Array(positions.length).fill(50);
    }

    positions.forEach((pos, i) => {
      const wrapper = document.createElement('div');
      wrapper.className = 'text-input-controls';
      wrapper.style.marginBottom = '0.5rem';

      const label = document.createElement('label');
      label.textContent = pos.label || `項目 ${i + 1}`;

      const slider = document.createElement('input');
      slider.type = 'range';
      slider.min = '0';
      slider.max = '100';
      slider.value = this.p2Values[i] !== undefined ? this.p2Values[i] : 50;
      slider.addEventListener('input', (e) => {
        this.p2Values[i] = parseInt(e.target.value, 10);
        this.render();
      });

      wrapper.appendChild(label);
      wrapper.appendChild(slider);
      this.p2Container.appendChild(wrapper);
    });
  }

  setupPattern4UI() {
    if (!this.p4Container) return;
    this.p4Container.innerHTML = '';

    const layout = layouts[this.layoutSelect.value];
    const positions = layout?.p4Positions || [];

    if (this.p4Values.length !== positions.length) {
      this.p4Values = Array(positions.length).fill('');
    }

    const sectionsMap = new Map();
    positions.forEach((pos, globalIndex) => {
      const sectionName = pos.section || 'セクション';
      if (!sectionsMap.has(sectionName)) {
        sectionsMap.set(sectionName, []);
      }
      sectionsMap.get(sectionName).push({ pos, globalIndex });
    });

    const options = ['', '〇', '△', '×', '✓'];

    sectionsMap.forEach((items, sectionName) => {
      const details = document.createElement('details');
      details.className = 'p4-details';

      const summary = document.createElement('summary');
      summary.textContent = sectionName;
      details.appendChild(summary);

      items.forEach(({ pos, globalIndex }) => {
        const wrapper = document.createElement('div');
        wrapper.className = 'text-input-controls';
        wrapper.style.marginBottom = '0.5rem';

        const label = document.createElement('label');
        label.textContent = pos.label || `項目 ${globalIndex + 1}`;
        label.style.minWidth = '80px';

        const select = document.createElement('select');
        options.forEach(opt => {
          const option = document.createElement('option');
          option.value = opt;
          option.textContent = opt || '-- 未選択 --';
          if (opt === this.p4Values[globalIndex]) option.selected = true;
          select.appendChild(option);
        });

        select.addEventListener('change', (e) => {
          this.p4Values[globalIndex] = e.target.value;
          this.render();
        });

        wrapper.appendChild(label);
        wrapper.appendChild(select);
        details.appendChild(wrapper);
      });

      this.p4Container.appendChild(details);
    });
  }

  getSavedStore() {
    try {
      const json = localStorage.getItem(this.storageKey);
      return json ? JSON.parse(json) : {};
    } catch (e) {
      console.error('LocalStorage読み込みエラー:', e);
      return {};
    }
  }

  setSavedStore(store) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(store));
    } catch (e) {
      console.error('LocalStorage保存エラー:', e);
      alert('保存容量の上限に達したか、ブラウザの制限により保存に失敗しました。');
    }
  }

  refreshSavedDataSelect() {
    if (!this.savedDataSelect) return;
    const store = this.getSavedStore();
    const keys = Object.keys(store);

    this.savedDataSelect.innerHTML = '<option value="">-- 保存済みデータを選択 --</option>';
    keys.forEach(key => {
      const opt = document.createElement('option');
      opt.value = key;
      opt.textContent = key;
      this.savedDataSelect.appendChild(opt);
    });
  }

  getCurrentState() {
    const layout = layouts[this.layoutSelect.value];
    return {
      layoutIndex: parseInt(this.layoutSelect.value, 10),
      designIndex: parseInt(this.designSelect ? this.designSelect.value : 0, 10),
      markColor: this.markColor,
      baseFont: this.baseFont, // 全体フォントを保存
      textValues: [...this.textValues],
      p1States: [...this.p1States],
      p2Values: [...this.p2Values],
      p4Values: [...this.p4Values],
      textPositions: JSON.parse(JSON.stringify(layout.textPositions || [])),
      p1Positions: JSON.parse(JSON.stringify(layout.p1Positions || [])),
      p2Positions: JSON.parse(JSON.stringify(layout.p2Positions || [])),
      p4Positions: JSON.parse(JSON.stringify(layout.p4Positions || [])),
      userImageScale: this.userImageScale,
      uploadedImagePos: { ...this.uploadedImagePos },
      baseImageWidth: this.baseImageWidth,
      baseImageHeight: this.baseImageHeight
    };
  }

  saveData(name, isOverwrite = false) {
    if (!name || name.trim() === '') {
      alert('保存名を入力してください。');
      return;
    }

    const store = this.getSavedStore();
    if (!isOverwrite && store[name]) {
      alert(`「${name}」は既に存在します。上書きする場合は「上書き」ボタンを押してください。`);
      return;
    }

    store[name] = this.getCurrentState();
    this.setSavedStore(store);
    this.refreshSavedDataSelect();
    
    if (this.savedDataSelect) {
      this.savedDataSelect.value = name;
    }
    alert(`「${name}」を保存しました。`);
  }

  loadData(name) {
    if (!name) {
      alert('呼び出すデータを選択してください。');
      return;
    }

    const store = this.getSavedStore();
    const data = store[name];
    if (!data) {
      alert('データが見つかりませんでした。');
      return;
    }

    this.layoutSelect.value = data.layoutIndex || 0;
    this.setupDesignOptions();
    if (this.designSelect) {
      this.designSelect.value = data.designIndex || 0;
    }

    this.setupLayoutConfig();

    this.markColor = data.markColor || '#000000';
    if (this.markColorInput) this.markColorInput.value = this.markColor;

    this.baseFont = data.baseFont || availableFonts[0]?.value;
    if (this.baseFontSelect) this.baseFontSelect.value = this.baseFont;

    this.textValues = data.textValues || [];
    this.p1States = data.p1States || [];
    this.p2Values = data.p2Values || [];
    this.p4Values = data.p4Values || [];

    const layout = layouts[this.layoutSelect.value];
    if (data.textPositions) layout.textPositions = data.textPositions;
    if (data.p1Positions) layout.p1Positions = data.p1Positions;
    if (data.p2Positions) layout.p2Positions = data.p2Positions;
    if (data.p4Positions) layout.p4Positions = data.p4Positions;

    this.userImageScale = data.userImageScale || 100;
    if (this.userImageScaleInput) this.userImageScaleInput.value = this.userImageScale;

    this.baseImageWidth = data.baseImageWidth || 200;
    this.baseImageHeight = data.baseImageHeight || 200;
    if (data.uploadedImagePos) {
      this.uploadedImagePos = data.uploadedImagePos;
    }

    this.setupTextInputs();
    this.setupPattern1UI();
    this.setupPattern2UI();
    this.setupPattern4UI();
    this.render();

    alert(`「${name}」のデータ（座標・設定）を読み込みました。`);
  }

  deleteData(name) {
    if (!name) {
      alert('削除するデータを選択してください。');
      return;
    }

    if (!confirm(`「${name}」を削除してもよろしいですか？`)) return;

    const store = this.getSavedStore();
    delete store[name];
    this.setSavedStore(store);
    this.refreshSavedDataSelect();
    alert(`「${name}」を削除しました。`);
  }

  updateUploadedImageSize() {
    if (!this.uploadedImage) return;
    const scale = (this.userImageScale || 100) / 100;
    this.uploadedImagePos.width = Math.round(this.baseImageWidth * scale);
    this.uploadedImagePos.height = Math.round(this.baseImageHeight * scale);
  }

  handleImageUpload(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const layout = layouts[this.layoutSelect.value];
    const initialPos = layout?.defaultUserImagePos || { x: 50, y: 50 };

    const reader = new FileReader();
    reader.onload = (event) => {
      this.uploadedImageDataUrl = event.target.result;
      const img = new Image();
      img.onload = () => {
        this.uploadedImage = img;
        
        this.baseImageWidth = 200;
        const aspect = img.naturalHeight / (img.naturalWidth || 1);
        this.baseImageHeight = Math.round(this.baseImageWidth * aspect);

        this.uploadedImagePos = {
          x: initialPos.x,
          y: initialPos.y,
          width: this.baseImageWidth,
          height: this.baseImageHeight
        };

        this.updateUploadedImageSize();
        this.render();
      };
      img.src = this.uploadedImageDataUrl;
    };
    reader.readAsDataURL(file);
  }

  // 選択中の要素の現在座標を取得
getSelectedPosition() {
    if (!this.selectedTarget) return null;
    const layout = layouts[this.layoutSelect.value];
    const { type, index } = this.selectedTarget;

    if (type === 'userImage') {
      return { x: this.uploadedImagePos.x, y: this.uploadedImagePos.y };
    } else if (type === 'text' && layout.textPositions[index]) {
      return { x: layout.textPositions[index].x, y: layout.textPositions[index].y };
    } else if (type === 'p1' && layout.p1Positions[index]) {
      return { x: layout.p1Positions[index].x, y: layout.p1Positions[index].y };
    } else if (type === 'p2' && layout.p2Positions[index]) {
      return { x: layout.p2Positions[index].xMin, y: layout.p2Positions[index].y };
    } else if (type === 'p4' && layout.p4Positions[index]) {
      return { x: layout.p4Positions[index].x, y: layout.p4Positions[index].y };
    }
    return null;
  }

  updateSelectedPosition(x, y) {
    if (!this.selectedTarget) return;
    const layout = layouts[this.layoutSelect.value];
    const { type, index } = this.selectedTarget;

    if (type === 'userImage') {
      if (x !== null) this.uploadedImagePos.x = x;
      if (y !== null) this.uploadedImagePos.y = y;
    } else if (type === 'text' && layout.textPositions[index]) {
      if (x !== null) layout.textPositions[index].x = x;
      if (y !== null) layout.textPositions[index].y = y;
    } else if (type === 'p1' && layout.p1Positions[index]) {
      if (x !== null) layout.p1Positions[index].x = x;
      if (y !== null) layout.p1Positions[index].y = y;
    } else if (type === 'p2' && layout.p2Positions[index]) {
      if (x !== null) {
        const width = layout.p2Positions[index].xMax - layout.p2Positions[index].xMin;
        layout.p2Positions[index].xMin = x;
        layout.p2Positions[index].xMax = x + width;
      }
      if (y !== null) layout.p2Positions[index].y = y;
    } else if (type === 'p4' && layout.p4Positions[index]) {
      if (x !== null) layout.p4Positions[index].x = x;
      if (y !== null) layout.p4Positions[index].y = y;
    }
  }

// 位置調整パネルの数値反映と状態切り替え
  updatePosControlUI() {
    if (!this.posControlPanel) return;
    const pos = this.getSelectedPosition();
    const dpadButtons = [this.btnUp, this.btnDown, this.btnLeft, this.btnRight];
    
    if (pos) {
      // 選択されている場合：入力欄・ボタンを有効化して数値を反映
      if (this.posXInput) {
        this.posXInput.disabled = false;
        if (document.activeElement !== this.posXInput) this.posXInput.value = pos.x;
      }
      if (this.posYInput) {
        this.posYInput.disabled = false;
        if (document.activeElement !== this.posYInput) this.posYInput.value = pos.y;
      }
      dpadButtons.forEach(btn => { if(btn) btn.disabled = false; });
    } else {
      // 選択されていない場合：空欄にして無効化
      if (this.posXInput) {
        this.posXInput.value = '';
        this.posXInput.disabled = true;
      }
      if (this.posYInput) {
        this.posYInput.value = '';
        this.posYInput.disabled = true;
      }
      dpadButtons.forEach(btn => { if(btn) btn.disabled = true; });
    }
  }

  moveSelected(dx, dy) {
    const pos = this.getSelectedPosition();
    if (!pos) return;
    this.updateSelectedPosition(pos.x + dx, pos.y + dy);
    this.updatePosControlUI();
    this.render();
  }

  setPosSelected(x, y) {
    const pos = this.getSelectedPosition();
    if (!pos) return;
    const newX = x !== null && !isNaN(x) ? x : pos.x;
    const newY = y !== null && !isNaN(y) ? y : pos.y;
    this.updateSelectedPosition(newX, newY);
    this.updatePosControlUI();
    this.render();
  }

  attachEvents() {
    this.layoutSelect?.addEventListener('change', () => {
      this.selectedTarget = null;
      this.textValues = []; // レイアウト変更時にテキスト保持状態をリセット
      this.updatePosControlUI();
      this.setupDesignOptions();
      this.setupLayoutConfig();
      this.setupTextInputs();
      this.setupPattern1UI();
      this.setupPattern2UI();
      this.setupPattern4UI();
      this.render();
    });

    this.designSelect?.addEventListener('change', () => {
      const layout = layouts[this.layoutSelect.value];
      const design = layout?.designs?.[this.designSelect.value];
      if (design?.defaultMarkColor && this.markColorInput) {
        this.markColor = design.defaultMarkColor;
        this.markColorInput.value = design.defaultMarkColor;
      }
      this.render();
    });

    this.markColorInput?.addEventListener('input', (e) => {
      this.markColor = e.target.value;
      this.render();
    });

    // 全体フォントの変更イベント
    this.baseFontSelect?.addEventListener('change', (e) => {
      this.baseFont = e.target.value;
      this.render();
    });

    this.userImageInput?.addEventListener('change', (e) => {
      this.handleImageUpload(e);
    });

    this.userImageScaleInput?.addEventListener('input', (e) => {
      this.userImageScale = parseInt(e.target.value, 10) || 100;
      this.updateUploadedImageSize();
      this.render();
    });

    this.saveDataBtn?.addEventListener('click', () => {
      const name = this.saveNameInput?.value;
      this.saveData(name, false);
    });

    this.loadDataBtn?.addEventListener('click', () => {
      const name = this.savedDataSelect?.value;
      this.loadData(name);
    });

    this.overwriteBtn?.addEventListener('click', () => {
      const name = this.savedDataSelect?.value || this.saveNameInput?.value;
      if (!name) {
        alert('上書き対象の保存名を入力するか、選択してください。');
        return;
      }
      this.saveData(name, true);
    });

    this.deleteBtn?.addEventListener('click', () => {
      const name = this.savedDataSelect?.value;
      this.deleteData(name);
    });

    this.openHelpBtn?.addEventListener('click', () => {
      this.helpDialog?.showModal();
    });

    const closeHelp = () => {
      this.helpDialog?.close();
    };

    this.closeHelpBtn?.addEventListener('click', closeHelp);
    this.closeHelpBtnTop?.addEventListener('click', closeHelp);

    this.helpDialog?.addEventListener('click', (e) => {
      if (e.target === this.helpDialog) {
        this.helpDialog.close();
      }
    });

    this.downloadBtn?.addEventListener('click', () => {
      this.downloadImage();
    });

    this.exportCoordsBtn?.addEventListener('click', () => {
      this.exportCoordinates();
    });
    let moveInterval = null;
    let moveTimeout = null;

    const startMove = (dx, dy, e) => {
      if (e && e.type === 'touchstart') e.preventDefault(); 
      const multiplier = (e && e.shiftKey) ? 10 : 1;
      this.moveSelected(dx * multiplier, dy * multiplier);

      moveTimeout = setTimeout(() => {
        moveInterval = setInterval(() => {
          this.moveSelected(dx * multiplier, dy * multiplier);
        }, 50);
      }, 300);
    };

    const stopMove = () => {
      clearTimeout(moveTimeout);
      clearInterval(moveInterval);
    };

    const attachDpadEvent = (btn, dx, dy) => {
      if (!btn) return;
      btn.addEventListener('mousedown', (e) => startMove(dx, dy, e));
      btn.addEventListener('mouseup', stopMove);
      btn.addEventListener('mouseleave', stopMove);
      btn.addEventListener('touchstart', (e) => startMove(dx, dy, e), { passive: false });
      btn.addEventListener('touchend', stopMove);
      btn.addEventListener('touchcancel', stopMove);
      btn.addEventListener('contextmenu', (e) => e.preventDefault()); 
    };

    attachDpadEvent(this.btnUp, 0, -1);
    attachDpadEvent(this.btnDown, 0, 1);
    attachDpadEvent(this.btnLeft, -1, 0);
    attachDpadEvent(this.btnRight, 1, 0);

    this.posXInput?.addEventListener('input', (e) => this.setPosSelected(parseInt(e.target.value, 10), null));
    this.posYInput?.addEventListener('input', (e) => this.setPosSelected(null, parseInt(e.target.value, 10)));
    
    // 十字キーによる位置調整イベント
    const handleMove = (dx, dy, e) => {
      const multiplier = e.shiftKey ? 10 : 1; // Shiftキーを押しながらだと大きく移動
      this.moveSelected(dx * multiplier, dy * multiplier);
    };

    this.btnUp?.addEventListener('click', (e) => handleMove(0, -1, e));
    this.btnDown?.addEventListener('click', (e) => handleMove(0, 1, e));
    this.btnLeft?.addEventListener('click', (e) => handleMove(-1, 0, e));
    this.btnRight?.addEventListener('click', (e) => handleMove(1, 0, e));

    // 座標直接入力のイベント
    this.posXInput?.addEventListener('input', (e) => this.setPosSelected(parseInt(e.target.value, 10), null));
    this.posYInput?.addEventListener('input', (e) => this.setPosSelected(null, parseInt(e.target.value, 10)));
  }

  isTargetActive(type, index = null) {
    const isDrag = this.isDragging && this.dragTarget?.type === type && (index === null || this.dragTarget?.index === index);
    const isSelect = this.selectedTarget?.type === type && (index === null || this.selectedTarget?.index === index);
    return isDrag || isSelect;
  }

  drawBoundingBox(x, y, width, height, padding = 4) {
    this.ctx.save();
    this.ctx.strokeStyle = '#FF0000';
    this.ctx.lineWidth = 1.5;
    this.ctx.setLineDash([4, 4]);
    this.ctx.strokeRect(x - padding, y - padding, width + padding * 2, height + padding * 2);
    this.ctx.restore();
  }

  isPointInText(pt, pos, text) {
    const fontSize = pos.fontSize || 36;
    const fontFamily = (pos.useCustomFont && pos.fontFamily) ? pos.fontFamily : this.baseFont;
    const lineHeight = fontSize * 1.2;

    this.ctx.font = `${fontSize}px ${fontFamily}`;
    const lines = (text || '').split('\n');

    let maxWidth = 0;
    lines.forEach(line => {
      const metrics = this.ctx.measureText(line);
      if (metrics.width > maxWidth) maxWidth = metrics.width;
    });

    const boxWidth = Math.max(maxWidth, 30);
    const totalHeight = Math.max(lines.length * lineHeight, fontSize);

    let boxX = pos.x;
    if (pos.align === 'center') boxX = pos.x - boxWidth / 2;
    else if (pos.align === 'right') boxX = pos.x - boxWidth;

    const boxY = pos.y - fontSize * 0.8;
    const padding = 10;

    return (
      pt.x >= boxX - padding &&
      pt.x <= boxX + boxWidth + padding &&
      pt.y >= boxY - padding &&
      pt.y <= boxY + totalHeight + padding
    );
  }

  attachDragEvents() {
    const getCanvasPoint = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width / rect.width;
      const scaleY = this.canvas.height / rect.height;
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
      };
    };

    this.canvas.addEventListener('mousedown', (e) => {
      const pt = getCanvasPoint(e);
      const layout = layouts[this.layoutSelect.value];

      if (this.uploadedImage) {
        const pos = this.uploadedImagePos;
        if (pt.x >= pos.x && pt.x <= pos.x + pos.width &&
            pt.y >= pos.y && pt.y <= pos.y + pos.height) {
          this.isDragging = true;
          this.dragTarget = { type: 'userImage' };
          this.selectedTarget = { type: 'userImage' };
          this.dragOffsetX = pt.x - pos.x;
          this.dragOffsetY = pt.y - pos.y;
          this.canvas.style.cursor = 'grabbing';
          this.render();
          return;
        }
      }

      if (layout.textPositions) {
        const tIdx = layout.textPositions.findIndex((pos, index) => {
          const text = this.textValues[index] !== undefined ? this.textValues[index] : (pos.defaultValue || `Sample ${index + 1}`);
          return this.isPointInText(pt, pos, text);
        });

        if (tIdx !== -1) {
          this.isDragging = true;
          this.dragTarget = { type: 'text', index: tIdx };
          this.selectedTarget = { type: 'text', index: tIdx };
          this.dragOffsetX = pt.x - layout.textPositions[tIdx].x;
          this.dragOffsetY = pt.y - layout.textPositions[tIdx].y;
          this.canvas.style.cursor = 'grabbing';
          this.updatePosControlUI();
          this.render();
          return;
        }
      }

      if (layout.p1Positions) {
        const p1Idx = layout.p1Positions.findIndex(pos => Math.hypot(pt.x - pos.x, pt.y - pos.y) < 30);
        if (p1Idx !== -1) {
          this.isDragging = true;
          this.dragTarget = { type: 'p1', index: p1Idx };
          this.selectedTarget = { type: 'p1', index: p1Idx };
          this.dragOffsetX = pt.x - layout.p1Positions[p1Idx].x;
          this.dragOffsetY = pt.y - layout.p1Positions[p1Idx].y;
          this.canvas.style.cursor = 'grabbing';
          this.render();
          return;
        }
      }

      if (layout.p2Positions) {
        const p2Idx = layout.p2Positions.findIndex((pos, index) => {
          const ratio = (this.p2Values[index] || 0) / 100;
          const currentX = pos.xMin + (pos.xMax - pos.xMin) * ratio;
          return Math.hypot(pt.x - currentX, pt.y - pos.y) < 30;
        });
        if (p2Idx !== -1) {
          this.isDragging = true;
          this.dragTarget = { type: 'p2', index: p2Idx };
          this.selectedTarget = { type: 'p2', index: p2Idx };
          this.dragOffsetX = pt.x - layout.p2Positions[p2Idx].xMin;
          this.dragOffsetY = pt.y - layout.p2Positions[p2Idx].y;
          this.canvas.style.cursor = 'grabbing';
          this.render();
          return;
        }
      }

      if (layout.p4Positions) {
        const p4Idx = layout.p4Positions.findIndex(pos => Math.hypot(pt.x - pos.x, pt.y - pos.y) < 30);
        if (p4Idx !== -1) {
          this.isDragging = true;
          this.dragTarget = { type: 'p4', index: p4Idx };
          this.selectedTarget = { type: 'p4', index: p4Idx };
          this.dragOffsetX = pt.x - layout.p4Positions[p4Idx].x;
          this.dragOffsetY = pt.y - layout.p4Positions[p4Idx].y;
          this.canvas.style.cursor = 'grabbing';
          this.render();
          return;
        }
      }

      this.selectedTarget = null;
      this.updatePosControlUI();
      this.render();
    });

    this.canvas.addEventListener('mousemove', (e) => {
      const pt = getCanvasPoint(e);
      const layout = layouts[this.layoutSelect.value];

      if (this.isDragging && this.dragTarget) {
        const { type, index } = this.dragTarget;
        if (type === 'userImage') {
          this.uploadedImagePos.x = Math.round(pt.x - this.dragOffsetX);
          this.uploadedImagePos.y = Math.round(pt.y - this.dragOffsetY);
        } else if (type === 'text' && layout.textPositions[index]) {
          layout.textPositions[index].x = Math.round(pt.x - this.dragOffsetX);
          layout.textPositions[index].y = Math.round(pt.y - this.dragOffsetY);
        } else if (type === 'p1' && layout.p1Positions[index]) {
          layout.p1Positions[index].x = Math.round(pt.x - this.dragOffsetX);
          layout.p1Positions[index].y = Math.round(pt.y - this.dragOffsetY);
        } else if (type === 'p2' && layout.p2Positions[index]) {
          const width = layout.p2Positions[index].xMax - layout.p2Positions[index].xMin;
          layout.p2Positions[index].xMin = Math.round(pt.x - this.dragOffsetX);
          layout.p2Positions[index].xMax = layout.p2Positions[index].xMin + width;
          layout.p2Positions[index].y = Math.round(pt.y - this.dragOffsetY);
        } else if (type === 'p4' && layout.p4Positions[index]) {
          layout.p4Positions[index].x = Math.round(pt.x - this.dragOffsetX);
          layout.p4Positions[index].y = Math.round(pt.y - this.dragOffsetY);
        }
        this.updatePosControlUI();
        this.render();
      } else {
        let isHover = false;
        if (this.uploadedImage) {
          const pos = this.uploadedImagePos;
          if (pt.x >= pos.x && pt.x <= pos.x + pos.width && pt.y >= pos.y && pt.y <= pos.y + pos.height) {
            isHover = true;
          }
        }
        if (layout.textPositions) {
          isHover = isHover || layout.textPositions.some((p, index) => this.isPointInText(pt, p, this.textValues[index]));
        }
        if (layout.p1Positions) isHover = isHover || layout.p1Positions.some(p => Math.hypot(pt.x - p.x, pt.y - p.y) < 30);
        if (layout.p2Positions) {
          isHover = isHover || layout.p2Positions.some((p, index) => {
            const ratio = (this.p2Values[index] || 0) / 100;
            const currentX = p.xMin + (p.xMax - p.xMin) * ratio;
            return Math.hypot(pt.x - currentX, pt.y - p.y) < 30;
          });
        }
        if (layout.p4Positions) isHover = isHover || layout.p4Positions.some(p => Math.hypot(pt.x - p.x, pt.y - p.y) < 30);

        this.canvas.style.cursor = isHover ? 'grab' : 'default';
      }
    });

    const stopDrag = () => {
      if (this.isDragging) {
        this.isDragging = false;
        this.dragTarget = null;
        this.canvas.style.cursor = 'default';
        this.render();
      }
    };

    this.canvas.addEventListener('mouseup', stopDrag);
    this.canvas.addEventListener('mouseleave', stopDrag);
  }

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
    const designIndex = this.designSelect ? this.designSelect.value : 0;
    const design = layout?.designs?.[designIndex] || layout;
    const imagePath = design?.imagePath || layout?.imagePath;

    if (!imagePath) return;

    try {
      const img = await this.loadImage(imagePath);
      
      this.canvas.width = img.naturalWidth || 800;
      this.canvas.height = img.naturalHeight || 600;

      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.drawImage(img, 0, 0);

      if (this.uploadedImage) {
        const pos = this.uploadedImagePos;
        this.ctx.drawImage(this.uploadedImage, pos.x, pos.y, pos.width, pos.height);

        if (this.isTargetActive('userImage')) {
          this.drawBoundingBox(pos.x, pos.y, pos.width, pos.height, 2);
        }
      }

      if (layout.textPositions) {
        layout.textPositions.forEach((pos, index) => {
          const text = this.textValues[index] !== undefined ? this.textValues[index] : (pos.defaultValue || `Sample ${index + 1}`);
          const fontSize = pos.fontSize || 36;
          
          // 個別フォント指定チェックが入っている場合は pos.fontFamily、なければ全体フォント（this.baseFont）を使用
          const fontFamily = (pos.useCustomFont && pos.fontFamily) ? pos.fontFamily : this.baseFont;
          const lineHeight = fontSize * 1.2;

          this.ctx.font = `${fontSize}px ${fontFamily}`;
          const isActive = this.isTargetActive('text', index);
          
          const textColor = (pos.useCustomColor && pos.color) ? pos.color : this.markColor;
          this.ctx.fillStyle = isActive ? '#FF0000' : textColor;
          this.ctx.textAlign = pos.align || 'left';

          const lines = text.split('\n');
          let maxWidth = 0;
          lines.forEach((line, lineIdx) => {
            const metrics = this.ctx.measureText(line);
            if (metrics.width > maxWidth) maxWidth = metrics.width;
            this.ctx.fillText(line, pos.x, pos.y + (lineIdx * lineHeight));
          });

          if (isActive) {
            const boxWidth = Math.max(maxWidth, 20);
            const totalHeight = lines.length * lineHeight;
            let boxX = pos.x;
            if (pos.align === 'center') boxX = pos.x - boxWidth / 2;
            else if (pos.align === 'right') boxX = pos.x - boxWidth;

            const boxY = pos.y - fontSize * 0.8;
            this.drawBoundingBox(boxX, boxY, boxWidth, totalHeight, 4);
          }
        });
      }

      if (layout.p1Positions) {
        layout.p1Positions.forEach((pos, index) => {
          const isChecked = this.p1States[index];
          const isActive = this.isTargetActive('p1', index);
          const fontSize = pos.fontSize || 28;

          if (isChecked || isActive) {
            this.ctx.font = `${fontSize}px sans-serif`;
            this.ctx.fillStyle = isActive ? '#FF0000' : this.markColor;
            this.ctx.textAlign = 'center';
            this.ctx.fillText('〇', pos.x, pos.y);
          } else {
            this.ctx.font = '16px sans-serif';
            this.ctx.fillStyle = 'rgba(180, 180, 180, 0.3)';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('・', pos.x, pos.y);
          }

          if (isActive) {
            const boxSize = fontSize * 1.1;
            this.drawBoundingBox(pos.x - boxSize / 2, pos.y - fontSize * 0.8, boxSize, boxSize, 2);
          }
        });
      }

      if (layout.p2Positions) {
        layout.p2Positions.forEach((pos, index) => {
          const ratio = (this.p2Values[index] || 0) / 100;
          const currentX = pos.xMin + (pos.xMax - pos.xMin) * ratio;
          const isActive = this.isTargetActive('p2', index);
          const fontSize = pos.fontSize || 32;

          this.ctx.font = `${fontSize}px sans-serif`;
          this.ctx.fillStyle = isActive ? '#FF0000' : this.markColor;
          this.ctx.textAlign = 'center';
          this.ctx.fillText('〇', currentX, pos.y);

          if (isActive) {
            const boxSize = fontSize * 1.1;
            this.drawBoundingBox(currentX - boxSize / 2, pos.y - fontSize * 0.8, boxSize, boxSize, 2);
          }
        });
      }

      if (layout.p4Positions) {
        layout.p4Positions.forEach((pos, index) => {
          const symbol = this.p4Values[index];
          const isActive = this.isTargetActive('p4', index);
          const fontSize = pos.fontSize || 32;

          if (symbol || isActive) {
            this.ctx.font = `${fontSize}px sans-serif`;
            this.ctx.fillStyle = isActive ? '#FF0000' : this.markColor;
            this.ctx.textAlign = 'center';
            this.ctx.fillText(symbol || '〇', pos.x, pos.y);
          } else {
            this.ctx.font = '16px sans-serif';
            this.ctx.fillStyle = 'rgba(180, 180, 180, 0.3)';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('・', pos.x, pos.y);
          }

          if (isActive) {
            const boxSize = fontSize * 1.1;
            this.drawBoundingBox(pos.x - boxSize / 2, pos.y - fontSize * 0.8, boxSize, boxSize, 2);
          }
        });
      }

      if (layout.circles) {
        this.ctx.lineWidth = 3;
        layout.circles.forEach(circle => {
          this.ctx.strokeStyle = circle.color || this.markColor;
          this.ctx.beginPath();
          this.ctx.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2);
          this.ctx.stroke();
        });
      }
    } catch (error) {
      console.error('描画処理エラー:', error);
    }
  }

  formatObjectSingleLine(obj) {
    const pairs = Object.entries(obj).map(([key, value]) => {
      let valStr;
      if (typeof value === 'string') {
        if (value.includes('"')) {
          valStr = `'${value}'`;
        } else {
          valStr = JSON.stringify(value);
        }
      } else {
        valStr = JSON.stringify(value);
      }
      return `${key}: ${valStr}`;
    });
    return `{ ${pairs.join(', ')} }`;
  }

  formatArraySingleLineObjects(arr) {
    if (!arr || !Array.isArray(arr) || arr.length === 0) return '[]';
    const lines = arr.map(item => `      ${this.formatObjectSingleLine(item)}`);
    return `[\n${lines.join(',\n')}\n    ]`;
  }

  exportCoordinates() {
    const layout = layouts[this.layoutSelect.value];
    
    const textPositionsStr = this.formatArraySingleLineObjects(layout.textPositions);
    const p1PositionsStr = this.formatArraySingleLineObjects(layout.p1Positions);
    const p2PositionsStr = this.formatArraySingleLineObjects(layout.p2Positions);
    const p4PositionsStr = this.formatArraySingleLineObjects(layout.p4Positions);
    const circlesStr = this.formatArraySingleLineObjects(layout.circles || []);
    const defaultUserImagePosStr = JSON.stringify(layout.defaultUserImagePos || { x: 50, y: 50 });

    const jsCode = `userImageLabel: ${JSON.stringify(layout.userImageLabel || '')},
      defaultUserImagePos: ${defaultUserImagePosStr},
      textPositions: ${textPositionsStr},
      p1Positions: ${p1PositionsStr},
      p2Positions: ${p2PositionsStr},
      p4Positions: ${p4PositionsStr},
      circles: ${circlesStr}`;

    console.log(`--- ${layout.name} 座標設定コード ---`);
    console.log(jsCode);

    navigator.clipboard.writeText(jsCode).then(() => {
      alert(`「${layout.name}」の座標設定コードをコピーしました。\ndata.js 内の該当レイアウトオブジェクトの中に直接貼り付けて上書きできます。`);
    }).catch(err => {
      console.error('コピー失敗:', err);
    });
  }

  downloadImage() {
    const tempSelected = this.selectedTarget;
    this.selectedTarget = null;
    this.render().then(() => {
      const link = document.createElement('a');
      link.download = `generated_image.png`;
      link.href = this.canvas.toDataURL('image/png');
      link.click();

      this.selectedTarget = tempSelected;
      this.render();
    });
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new ImageGenerator();
});
