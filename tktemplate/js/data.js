// 10パターンのレイアウト定義データ
export const layouts = Array.from({ length: 10 }, (_, index) => {
  const id = index + 1;
  return {
    id: `layout_${id}`,
    name: `レイアウト ${id}`,
    // 30箇所の配置座標（例として格子状に配置）
    textPositions: Array.from({ length: 30 }, (_, textIndex) => ({
      id: `text_${textIndex + 1}`,
      label: `テキスト ${textIndex + 1}`,
      x: 50 + (textIndex % 3) * 240,
      y: 50 + Math.floor(textIndex / 3) * 50,
      fontSize: 18,
      align: 'left'
    })),
    // 丸囲み処理の対象箇所・座標データ
    circles: [
      { x: 120, y: 55, radius: 25 },
      { x: 360, y: 105, radius: 25 }
    ]
  };
});

// 8パターンのカラー定義データ
export const colors = [
  { id: 'c1', name: 'クラシック (白/黒/赤)', bg: '#FFFFFF', text: '#111111', circle: '#E53E3E' },
  { id: 'c2', name: 'ダーク (黒/白/黄)',     bg: '#1A202C', text: '#F7FAFC', circle: '#ECC94B' },
  { id: 'c3', name: 'ネイビー (紺/白/シアン)', bg: '#0F172A', text: '#F8FAFC', circle: '#38BDF8' },
  { id: 'c4', name: 'ウォーム (ベージュ/茶/橙)', bg: '#FEF3C7', text: '#78350F', circle: '#F97316' },
  { id: 'c5', name: 'フォレスト (緑/白/金)', bg: '#064E3B', text: '#ECFDF5', circle: '#FBBF24' },
  { id: 'c6', name: 'クール (灰/濃灰/青)',   bg: '#F1F5F9', text: '#0F172A', circle: '#2563EB' },
  { id: 'c7', name: 'ローズ (ピンク/濃赤/紫)', bg: '#FFF1F2', text: '#881337', circle: '#9333EA' },
  { id: 'c8', name: '高コントラスト (黒/黄/赤)', bg: '#000000', text: '#FFD700', circle: '#FF0000' }
];
