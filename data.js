export const SAVE_KEY = "huagongfang-save-v1";

export const REAGENTS = [
  { sku: "CaO", name: "生石灰", industrial: 2, reagent: 4 },
  { sku: "CaCO3", name: "石灰石", industrial: 2, reagent: 4 },
  { sku: "HCl", name: "稀盐酸", industrial: 3, reagent: 5 },
  { sku: "AcOH", name: "醋酸", industrial: 4, reagent: 7 },
  { sku: "NaOH", name: "氢氧化钠", industrial: 3, reagent: 6 },
  { sku: "Fe", name: "铁屑", industrial: 2, reagent: 3 },
  { sku: "CuSO4", name: "硫酸铜", industrial: 4, reagent: 8 },
  { sku: "H2O2", name: "双氧水", industrial: 5, reagent: 9 }
];

export const RECIPES = [
  {
    id: "lime",
    name: "生石灰熟化",
    equation: "CaO + H2O → Ca(OH)2",
    product: "石灰乳",
    basePrice: 16,
    market: "salt",
    needs: [{ sku: "CaO", n: 1 }],
    goodLabel: "分次洒水",
    badLabel: "一次浇满",
    repair: 18,
    qte: [
      { id: "good", label: "停止加水" },
      { id: "mid", label: "上冷浴" },
      { id: "bad", label: "再浇水" }
    ]
  },
  {
    id: "acetate",
    name: "酸碱滴定",
    equation: "CH3COOH + NaOH → CH3COONa + H2O",
    product: "醋酸钠",
    basePrice: 28,
    market: "salt",
    needs: [{ sku: "AcOH", n: 1 }, { sku: "NaOH", n: 1 }],
    goodLabel: "开始滴定",
    badLabel: "",
    repair: 40,
    endpoint: { low: 64, high: 76, scaleLow: 56, scaleHigh: 84, boom: 92 },
    qte: [
      { id: "good", label: "干沙压住" },
      { id: "mid", label: "退开" },
      { id: "bad", label: "浇水" }
    ]
  },
  {
    id: "cacl2",
    name: "石灰石与盐酸",
    equation: "CaCO3 + 2HCl → CaCl2 + CO2 + H2O",
    product: "氯化钙",
    basePrice: 20,
    market: "salt",
    needs: [{ sku: "CaCO3", n: 1 }, { sku: "HCl", n: 1 }],
    goodLabel: "慢滴盐酸",
    badLabel: "一次倒完",
    repair: 15,
    qte: [
      { id: "good", label: "干沙" },
      { id: "mid", label: "退开" },
      { id: "bad", label: "浇水" }
    ]
  },
  {
    id: "copper",
    name: "铁置换铜",
    equation: "Fe + CuSO4 → FeSO4 + Cu",
    product: "铜粉",
    basePrice: 30,
    market: "metal",
    needs: [{ sku: "Fe", n: 1 }, { sku: "CuSO4", n: 1 }],
    goodLabel: "常温静置",
    badLabel: "加热至沸",
    repair: 20,
    qte: [
      { id: "good", label: "撤火盖上" },
      { id: "mid", label: "退开" },
      { id: "bad", label: "继续加热" }
    ]
  },
  {
    id: "peroxide",
    name: "双氧水灌装",
    equation: "2H2O2 → 2H2O + O2",
    product: "消毒水",
    basePrice: 24,
    market: "gas",
    needs: [{ sku: "H2O2", n: 1 }],
    goodLabel: "低温灌装",
    badLabel: "开灯加热",
    repair: 12,
    qte: [
      { id: "good", label: "沙围住" },
      { id: "mid", label: "撤掉灯" },
      { id: "bad", label: "点火" }
    ]
  }
];
