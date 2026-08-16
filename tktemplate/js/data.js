// 利用可能なフォント定義
export const availableFonts = [
  { name: 'Noto Sans JP', value: '"Noto Sans JP", sans-serif' },
  { name: 'Zen Kaku Gothic', value: '"Zen Kaku Gothic New", sans-serif' },
  { name: 'M PLUS Rounded', value: '"M PLUS Rounded 1c", sans-serif' },
  { name: 'Dela Gothic One', value: '"Dela Gothic One", display' },
  { name: 'Kiwi Maru', value: '"Kiwi Maru", serif' }
];

// デフォルトのパターン①ラベル定義（レイアウト未指定時のフォールバック用）
export const defaultP1Labels = {
  cols: ['POST', '好き', 'OK', '自衛', '×'],
  rows: ['オールキャラ', 'あ', 'い', 'う', 'その他']
};

// パターン①: X座標配列とY座標配列を受け取って 5x5 座標配列を生成するヘルパー関数
const createPattern1Positions = (xCols, yRows) => {
  const positions = [];
  yRows.forEach((y, rIndex) => {
    xCols.forEach((x, cIndex) => {
      positions.push({
        id: `p1_${rIndex + 1}_${cIndex + 1}`,
        x: x,
        y: y,
        fontSize: 28
      });
    });
  });
  return positions;
};

// パターン②: 項目リスト（ラベル・xMin・xMax・y）を受け取って配列を生成するヘルパー関数
const createPattern2Positions = (items) => {
  return items.map((item, i) => ({
    id: `p2_${i + 1}`,
    label: item.label,
    xMin: item.xMin,
    xMax: item.xMax,
    y: item.y,
    fontSize: item.fontSize || 32
  }));
};

export const layouts = [
  {
    id: 'layout_1',
    name: 'ゲームジャンル向け汎用プロフィール',
    defaultUserImagePos: { x: 404, y: 84 },

    designs: [
      { id: 'layout_1_1', name: '初空ソーダ', imagePath: 'image/multi2025/prof4_1.png', defaultMarkColor: '#2C4C5E' },
      { id: 'layout_1_2', name: 'いちごシロップ', imagePath: 'image/multi2025/prof4_2.png', defaultMarkColor: '#6E3A4B' },
      { id: 'layout_1_3', name: '夜明けのすみれ', imagePath: 'image/multi2025/prof4_3.png', defaultMarkColor: '#4B3B60' },
      { id: 'layout_1_4', name: 'ひなたのレモネード', imagePath: 'image/multi2025/prof4_4.png', defaultMarkColor: '#594E2B' },
      { id: 'layout_1_5', name: '雨上がりのミント', imagePath: 'image/multi2025/prof4_5.png', defaultMarkColor: '#2E4E3F' },
      { id: 'layout_1_6', name: '夕焼けアプリコット', imagePath: 'image/multi2025/prof4_6.png', defaultMarkColor: '#6E4733' },
      { id: 'layout_1_7', name: '雨模様のテラス', imagePath: 'image/multi2025/prof4_7.png', defaultMarkColor: '#383D42' }
    ],

    // 1. パターン①の表ラベル定義
    p1Labels: {
      cols: ['POST', '好き', 'OK', '自衛', '×'],
      rows: ['オールキャラ', '男女CP', 'BL', 'GL', 'その他']
    },

    // 2. パターン①の座標定義（X軸・Y軸の配列を指定）
    p1Positions: createPattern1Positions(
      [116, 158, 191, 221, 253], // X軸5列
      [690, 737, 785, 833, 879]  // Y軸5行
    ),

    // 3. パターン②の項目名とスライダー座標定義
    p2Positions: createPattern2Positions([
      { label: "傾向", xMin: 597, xMax: 716, y: 682, fontSize: 32 },
      { label: "スクショ", xMin: 597, xMax: 716, y: 717, fontSize: 32 },
      { label: "投稿", xMin: 824, xMax: 943, y: 682, fontSize: 32 },
      { label: "ネタバレ", xMin: 824, xMax: 943, y: 717, fontSize: 32 }
    ]),

    textPositions: [
       { id: "text_1", label: "名前", defaultValue: "", x: 52, y: 111, fontSize: 36, fontFamily: '"Noto Sans JP", sans-serif', color: "#000000", align: "left"},
      { id: "text_2", label: "年齢", defaultValue: "", x: 105, y: 224, fontSize: 36, fontFamily: '"Noto Sans JP", sans-serif', color: "#000000", align: "left" },
      { id: "text_3", label: "ジャンル名（メイン）", defaultValue: "", x: 631, y: 214, fontSize: 36, fontFamily: '"Noto Sans JP", sans-serif', color: "#000000", align: "left" },
      { id: "text_4", label: "好きなキャラなど", defaultValue: "", x: 40, y: 400, fontSize: 36, fontFamily: '"Noto Sans JP", sans-serif', color: "#000000", align: "left" },
      { id: "text_5", label: "好きなストーリー", defaultValue: "", x: 521, y: 394, fontSize: 36, fontFamily: '"Noto Sans JP", sans-serif', color: "#000000", align: "left" },
      { id: "text_6", label: "プレイスタイル", defaultValue: "", x: 36, y: 550, fontSize: 36, fontFamily: '"Noto Sans JP", sans-serif', color: "#000000", align: "left" },
      { id: "text_7", label: "チェックリスト（その他）", defaultValue: "", x: 46, y: 874, fontSize: 18, fontFamily: '"Noto Sans JP", sans-serif', color: "#000000", align: "left" },
      { id: "text_8", label: "NG項目", defaultValue: "", x: 88, y: 932, fontSize: 36, fontFamily: '"Noto Sans JP", sans-serif', color: "#000000", align: "left" },
      { id: "text_9", label: "語りたいこと", defaultValue: "", x: 308, y: 743, fontSize: 36, fontFamily: '"Noto Sans JP", sans-serif', color: "#000000", align: "left" },
      { id: "text_10", label: "そのほかのジャンル", defaultValue: "", x: 511, y: 808, fontSize: 36, fontFamily: '"Noto Sans JP", sans-serif', color: "#000000", align: "left" },
      { id: "text_11", label: "フリースペース", defaultValue: "", x: 510, y: 901, fontSize: 36, fontFamily: '"Noto Sans JP", sans-serif', color: "#000000", align: "left" }
    ],

    p4Positions: [
      { id: "p4_1_1", section: "活動（Activity）", label: "小説", x: 570, y: 531, fontSize: 32 },
      { id: "p4_1_2", section: "活動（Activity）", label: "イラスト", x: 671, y: 531, fontSize: 32 },
      { id: "p4_1_3", section: "活動（Activity）", label: "手芸", x: 785, y: 531, fontSize: 32 },
      { id: "p4_1_4", section: "活動（Activity）", label: "コスプレ", x: 895, y: 531, fontSize: 32 },
      { id: "p4_1_5", section: "活動（Activity）", label: "ゲーム攻略", x: 600, y: 570, fontSize: 32 },
      { id: "p4_1_6", section: "活動（Activity）", label: "動画", x: 725, y: 570, fontSize: 32 },
      { id: "p4_1_7", section: "活動（Activity）", label: "感想", x: 820, y: 570, fontSize: 32 },
      { id: "p4_1_8", section: "活動（Activity）", label: "考察", x: 913, y: 570, fontSize: 32 },
      { id: "p4_2_1", section: "NGチェック", label: "同担", x: 112, y: 959, fontSize: 32 },
      { id: "p4_2_2", section: "NGチェック", label: "ネタバレ", x: 157, y: 959, fontSize: 32 },
      { id: "p4_2_3", section: "NGチェック", label: "R18", x: 205, y: 959, fontSize: 32 },
      { id: "p4_3_1", section: "Follow", label: "雑談", x: 329, y: 799, fontSize: 32 },
      { id: "p4_3_2", section: "Follow", label: "通話", x: 378, y: 799, fontSize: 32 },
      { id: "p4_3_3", section: "Follow", label: "オフ会", x: 433, y: 799, fontSize: 32 },
      { id: "p4_3_4", section: "Follow", label: "創作", x: 329, y: 826, fontSize: 32 },
      { id: "p4_3_5", section: "Follow", label: "イベント", x: 414, y: 826, fontSize: 32 },
      { id: "p4_4_1", section: "反応チェック", label: "RP", x: 321, y: 893, fontSize: 32 },
      { id: "p4_4_2", section: "反応チェック", label: "いいね", x: 371, y: 893, fontSize: 32 },
      { id: "p4_4_3", section: "反応チェック", label: "フォロー", x: 433, y: 893, fontSize: 32 },
      { id: "p4_5_1", section: "お迎え", label: "フォロー", x: 354, y: 949, fontSize: 32 },
      { id: "p4_5_2", section: "お迎え", label: "リプライ", x: 421, y: 949, fontSize: 32 }
    ],
    circles: []
  },
  {
    id: 'layout_1',
    name: '雑多垢向けプロフィール/自己紹介カード2.0',
    defaultUserImagePos: { x: 404, y: 84 },

    designs: [
      { id: 'layout_1_7', name: '水底のサイダー', imagePath: 'image/multi2022/t_0.png', defaultMarkColor: '#2B4C53' },
      { id: 'layout_1_1', name: '夕暮れのローズ', imagePath: 'image/multi2022/t_1.png', defaultMarkColor: '#5C3A42' },
      { id: 'layout_1_2', name: '陽だまりの紅茶', imagePath: 'image/multi2022/t_2.png', defaultMarkColor: '#5B422B' },
      { id: 'layout_1_3', name: '藤色レコード', imagePath: 'image/multi2022/t_3.png', defaultMarkColor: '#413352' },
      { id: 'layout_1_4', name: '木漏れ日のピスタチオ', imagePath: 'image/multi2022/t_4.png', defaultMarkColor: '#3C4A29' },
      { id: 'layout_1_5', name: '雨模様のテラス', imagePath: 'image/multi2022/t_5.png', defaultMarkColor: '#233B5D' },
      { id: 'layout_1_6', name: '深緑のベロア', imagePath: 'image/multi2022/t_6.png', defaultMarkColor: '#274436' },
      { id: 'layout_1_7', name: '月明かりの霧', imagePath: 'image/multi2022/t_7.png', defaultMarkColor: '#384047' }
    ],

    // 1. パターン①の表ラベル定義
    p1Labels: {
      cols: [],
      rows: []
    },

    // 2. パターン①の座標定義（X軸・Y軸の配列を指定）
    p1Positions: createPattern1Positions(
      [], // X軸5列
      []  // Y軸5行
    ),

    // 3. パターン②の項目名とスライダー座標定義
    p2Positions: createPattern2Positions([
      { id: "p2_1", label: "ツイート頻度", xMin: 810, xMax: 929, y: 825, fontSize: 32 },
      { id: "p2_2", label: "スクショ", xMin: 810, xMax: 929, y: 872, fontSize: 32 },
      { id: "p2_3", label: "リプライ", xMin: 1095, xMax: 1214, y: 819, fontSize: 32 },
      { id: "p2_4", label: "リツイート", xMin: 1095, xMax: 1214, y: 867, fontSize: 32 }
    ]),

    textPositions: [
      { id: "text_1", label: "名前", defaultValue: "", x: 48, y: 238, fontSize: 36, fontFamily: '"Noto Sans JP", sans-serif', color: "#000000", align: "left" },
      { id: "text_2", label: "誕生日", defaultValue: "", x: 770, y: 240, fontSize: 36, fontFamily: '"Noto Sans JP", sans-serif', color: "#000000", align: "left" },
      { id: "text_3", label: "年齢", defaultValue: "", x: 1038, y: 239, fontSize: 36, fontFamily: '"Noto Sans JP", sans-serif', color: "#000000", align: "left" },
      { id: "text_4", label: "ハマっていること（ジャンルなど）", defaultValue: "", x: 53, y: 360, fontSize: 36, fontFamily: '"Noto Sans JP", sans-serif', color: "#000000", align: "left" },
      { id: "text_5", label: "お気に入り・好きなジャンルなど", defaultValue: "", x: 49, y: 497, fontSize: 36, fontFamily: '"Noto Sans JP", sans-serif', color: "#000000", align: "left" },
      { id: "text_5_1", label: "お気に入り・好きなジャンルなど（備考）", defaultValue: "", x: 56, y: 601, fontSize: 18, fontFamily: '"Noto Sans JP", sans-serif', color: "#000000", align: "left" },
      { id: "text_6", label: "チェックリスト（備考）", defaultValue: "", x: 53, y: 840, fontSize: 18, fontFamily: '"Noto Sans JP", sans-serif', color: "#000000", align: "left" },
      { id: "text_7", label: "Follow Request（備考）", defaultValue: "", x: 53, y: 1019, fontSize: 18, fontFamily: '"Noto Sans JP", sans-serif', color: "#000000", align: "left" },
      { id: "text_8", label: "活動（Activity）", defaultValue: "", x: 679, y: 595, fontSize: 28, fontFamily: '"Noto Sans JP", sans-serif', color: "#000000", align: "left" },
      { id: "text_9", label: "Tweet（備考）", defaultValue: "", x: 675, y: 911, fontSize: 18, fontFamily: '"Noto Sans JP", sans-serif', color: "#000000", align: "left" },
      { id: "text_11", label: "フリースペース", defaultValue: "", x: 673, y: 1035, fontSize: 36, fontFamily: '"Noto Sans JP", sans-serif', color: "#000000", align: "left" }
    ],

    p4Positions: [
      { id: "p4_1_1", section: "活動（Activity）", label: "小説", x: 757, y: 484, fontSize: 32 },
      { id: "p4_1_2", section: "活動（Activity）", label: "イラスト", x: 843, y: 481, fontSize: 32 },
      { id: "p4_1_3", section: "活動（Activity）", label: "手芸", x: 964, y: 481, fontSize: 32 },
      { id: "p4_1_4", section: "活動（Activity）", label: "動画", x: 1052, y: 481, fontSize: 32 },
      { id: "p4_1_5", section: "活動（Activity）", label: "コスプレ", x: 719, y: 523, fontSize: 32 },
      { id: "p4_1_6", section: "活動（Activity）", label: "感想", x: 842, y: 523, fontSize: 32 },
      { id: "p4_1_7", section: "活動（Activity）", label: "考察", x: 928, y: 525, fontSize: 32 },
      { id: "p4_1_8", section: "活動（Activity）", label: "攻略・まとめ", x: 1016, y: 525, fontSize: 32 },
      { id: "p4_2_1", section: "チェックリスト＞OK", label: "男女CP", x: 146, y: 735, fontSize: 32 },
      { id: "p4_2_2", section: "チェックリスト＞OK", label: "BL", x: 202, y: 733, fontSize: 32 },
      { id: "p4_2_3", section: "チェックリスト＞OK", label: "GL", x: 243, y: 733, fontSize: 32 },
      { id: "p4_2_4", section: "チェックリスト＞OK", label: "夢", x: 285, y: 733, fontSize: 32 },
      { id: "p4_2_5", section: "チェックリスト＞OK", label: "エロ", x: 328, y: 735, fontSize: 32 },
      { id: "p4_2_6", section: "チェックリスト＞OK", label: "グロ", x: 389, y: 735, fontSize: 32 },
      { id: "p4_2_7", section: "チェックリスト＞OK", label: "ネタバレ", x: 460, y: 733, fontSize: 32 },
      { id: "p4_2_8", section: "チェックリスト＞OK", label: "同担", x: 534, y: 731, fontSize: 32 },
      { id: "p4_3_1", section: "チェックリスト＞NG", label: "男女CP", x: 143, y: 804, fontSize: 32 },
      { id: "p4_3_2", section: "チェックリスト＞NG", label: "BL", x: 202, y: 807, fontSize: 32 },
      { id: "p4_3_3", section: "チェックリスト＞NG", label: "GL", x: 245, y: 804, fontSize: 32 },
      { id: "p4_3_4", section: "チェックリスト＞NG", label: "夢", x: 285, y: 802, fontSize: 32 },
      { id: "p4_3_5", section: "チェックリスト＞NG", label: "エロ", x: 334, y: 804, fontSize: 32 },
      { id: "p4_3_6", section: "チェックリスト＞NG", label: "グロ", x: 387, y: 805, fontSize: 32 },
      { id: "p4_3_7", section: "チェックリスト＞NG", label: "ネタバレ", x: 458, y: 805, fontSize: 32 },
      { id: "p4_3_8", section: "チェックリスト＞NG", label: "同担", x: 538, y: 802, fontSize: 32 },
      { id: "p4_4_1", section: "Tweet", label: "日常", x: 725, y: 772, fontSize: 32 },
      { id: "p4_4_2", section: "Tweet", label: "感想", x: 814, y: 775, fontSize: 32 },
      { id: "p4_4_3", section: "Tweet", label: "考察", x: 903, y: 776, fontSize: 32 },
      { id: "p4_4_4", section: "Tweet", label: "創作作品", x: 989, y: 772, fontSize: 32 },
      { id: "p4_4_5", section: "Tweet", label: "ネタバレ", x: 1112, y: 770, fontSize: 32 },
      { id: "p4_5_1", section: "Follow Request", label: "語りたい", x: 95, y: 935, fontSize: 32 },
      { id: "p4_5_2", section: "Follow Request", label: "一緒に遊びたい, ", x: 234, y: 938, fontSize: 32 },
      { id: "p4_5_3", section: "Follow Request", label: "一緒に創作したい", x: 425, y: 932, fontSize: 32 },
      { id: "p4_5_4", section: "Follow Request", label: "同じ創作している人", x: 108, y: 974, fontSize: 32 },
      { id: "p4_5_5", section: "Follow Request", label: "好きなジャンルが一緒な人", x: 341, y: 973, fontSize: 32 },
      { id: "p4_6_1", section: "Follow＞チェック", label: "RT", x: 112, y: 1133, fontSize: 32 },
      { id: "p4_6_2", section: "Follow＞チェック", label: "いいね", x: 177, y: 1132, fontSize: 32 },
      { id: "p4_6_3", section: "Follow＞チェック", label: "フォロー", x: 282, y: 1139, fontSize: 32 },
      { id: "p4_6_4", section: "Follow＞チェック", label: "リプライ", x: 395, y: 1135, fontSize: 32 },
      { id: "p4_6_5", section: "Follow＞チェック", label: "気まぐれ", x: 507, y: 1134, fontSize: 32 },
      { id: "p4_7_1", section: "Follow＞お迎え", label: "フォロー＞無言", x: 213, y: 1207, fontSize: 32 },
      { id: "p4_7_2", section: "Follow＞お迎え", label: "フォロー＞リプ有", x: 271, y: 1211, fontSize: 32 },
      { id: "p4_7_3", section: "Follow＞お迎え", label: "フォロー＞フォロバ後リプ有", x: 388, y: 1209, fontSize: 32 },
      { id: "p4_7_4", section: "Follow＞お迎え", label: "リプライ", x: 513, y: 1202, fontSize: 32 }
    ],
    circles: []
  }
];
