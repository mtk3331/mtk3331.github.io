// 10パターンのレイアウト定義データ
export const layouts = Array.from({ length: 10 }, (_, index) => {
  const id = index + 1;
  return {
    id: `layout_${id}`,
    name: `レイアウト ${id}`,
    // 背景画像のパスを指定
    imagePath: `image/template_${id}.jpg`, 
    // 30箇所の配置座標（実際の画像に合わせて調整が必要）
    textPositions: Array.from({ length: 30 }, (_, textIndex) => ({
      id: `text_${textIndex + 1}`,
      x: 50 + (textIndex % 3) * 240,
      y: 50 + Math.floor(textIndex / 3) * 50,
      fontSize: 18,
      align: 'left',
      color: '#000000' // テキストカラー固定、必要に応じて変更
    })),
    // 丸囲みの座標データ
    circles: [
      { x: 120, y: 55, radius: 25, color: '#FF0000' }
    ]
  };
});
