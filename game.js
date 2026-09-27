const SAVE_KEY = "huagongfang-save-v1";
const REAGENTS = [
  { sku: "CaO", name: "生石灰", industrial: 2, reagent: 4 },
  { sku: "CaCO3", name: "石灰石", industrial: 2, reagent: 4 },
  { sku: "HCl", name: "稀盐酸", industrial: 3, reagent: 5 },
  { sku: "AcOH", name: "醋酸", industrial: 4, reagent: 7 },
  { sku: "NaOH", name: "氢氧化钠", industrial: 3, reagent: 6 },
  { sku: "Fe", name: "铁屑", industrial: 2, reagent: 3 },
  { sku: "CuSO4", name: "硫酸铜", industrial: 4, reagent: 8 },
  { sku: "H2O2", name: "双氧水", industrial: 5, reagent: 9 }
];
const RECIPES = [
  { id: "lime", name: "生石灰熟化", equation: "CaO + H₂O → Ca(OH)₂", product: "石灰乳", basePrice: 16, market: "salt", needs: [{ sku: "CaO", n: 1 }], targetTemp: [40, 80], targetRatio: 1, speedLimit: 2.2, heatRate: 18, repair: 18, qte: [{ id: "good", label: "停止加水" }, { id: "mid", label: "上冷浴" }, { id: "bad", label: "再浇水" }] },
  { id: "acetate", name: "酸碱滴定", equation: "CH₃COOH + NaOH → CH₃COONa + H₂O", product: "醋酸钠", basePrice: 28, market: "salt", needs: [{ sku: "AcOH", n: 1 }, { sku: "NaOH", n: 1 }], targetTemp: [18, 32], targetRatio: 1, speedLimit: 1.6, heatRate: 4, repair: 40, qte: [{ id: "good", label: "干沙压住" }, { id: "mid", label: "退开" }, { id: "bad", label: "浇水" }] },
  { id: "cacl2", name: "石灰石与盐酸", equation: "CaCO₃ + 2HCl → CaCl₂ + CO₂↑ + H₂O", product: "氯化钙", basePrice: 20, market: "salt", needs: [{ sku: "CaCO3", n: 1 }, { sku: "HCl", n: 1 }], targetTemp: [18, 35], targetRatio: 2, speedLimit: 1.8, heatRate: 6, repair: 15, qte: [{ id: "good", label: "干沙" }, { id: "mid", label: "退开" }, { id: "bad", label: "浇水" }] },
  { id: "copper", name: "铁置换铜", equation: "Fe + CuSO₄ → FeSO₄ + Cu", product: "铜粉", basePrice: 30, market: "metal", needs: [{ sku: "Fe", n: 1 }, { sku: "CuSO4", n: 1 }], targetTemp: [18, 36], targetRatio: 1, speedLimit: 2.5, heatRate: 10, repair: 20, qte: [{ id: "good", label: "撤火盖上" }, { id: "mid", label: "退开" }, { id: "bad", label: "继续加热" }] },
  { id: "peroxide", name: "双氧水灌装", equation: "2H₂O₂ → 2H₂O + O₂↑", product: "消毒水", basePrice: 24, market: "gas", needs: [{ sku: "H2O2", n: 1 }], targetTemp: [10, 40], targetRatio: 1, speedLimit: 2, heatRate: 14, repair: 12, qte: [{ id: "good", label: "沙围住" }, { id: "mid", label: "撤掉灯" }, { id: "bad", label: "点火" }] }
];
function recipeById(id) { return RECIPES.find(function (r) { return r.id === id; }); }
function purityFactor(p) { return p >= 0.95 ? 1.6 : p >= 0.9 ? 1.25 : p >= 0.8 ? 1 : 0.7; }
function unitPrice(stack, market) {
  var r = recipeById(stack.recipeId);
  return Math.round(r.basePrice * market[r.market] * purityFactor(stack.purity) * (stack.salvage ? 0.4 : 1));
}
function calculatePurity(state, baseGradePurity, hasScale) {
  var tolerance = hasScale ? 0.08 : 0.03;
  var ratioError = Math.abs(state.actualRatio - state.targetRatio);
  var ratioScore = 1 - ratioError / (tolerance * 3);
  ratioScore = Math.max(0.1, Math.min(1, ratioScore));
  var minT = state.targetTemp[0], maxT = state.targetTemp[1], tempScore = 1;
  if (state.currentTemp < minT) tempScore = 1 - (minT - state.currentTemp) * 0.02;
  else if (state.currentTemp > maxT) tempScore = 1 - (state.currentTemp - maxT) * 0.04;
  tempScore = Math.max(0.2, Math.min(1, tempScore));
  return Math.round(baseGradePurity * (ratioScore * 0.7 + tempScore * 0.3) * 100) / 100;
}
function checkHazard(state) {
  if (state.addSpeed > state.speedLimit) return "BOIL_OVER";
  if (state.currentTemp > 130) return "EXPLOSION";
  return "NONE";
}
function fresh() {
  return { version: 2, day: 1, gold: 200, research: 0, reputation: 12, cleanDays: 0, warehouse: [], products: [], made: 0, ruined: 0, rescued: 0, dirty: false, mastered: [], scars: [], market: { salt: 1, metal: 1, gas: 1 }, contract: { recipeId: "acetate", purityMin: 0.9, reward: 39, research: 2, dueDay: 3 }, scale: false, bestGold: 200 };
}
function load() {
  try {
    var s = JSON.parse(localStorage.getItem(SAVE_KEY) || "");
    if (s && (s.version === 1 || s.version === 2)) { s.version = 2; return s; }
  } catch (e) {}
  return fresh();
}
var save = load();
var grade = "reagent";
var run = { phase: "pick", recipeId: null, fill: 0, qteStarted: 0, state: null, valve: 0 };
var qteTimer = null;
var tickTimer = null;
function persist() { save.bestGold = Math.max(save.bestGold, save.gold); localStorage.setItem(SAVE_KEY, JSON.stringify(save)); }
function say(t) { var el = document.getElementById("msg"); if (el) el.textContent = t || ""; }
function setGrade(g) { grade = g; render(); }
function count(sku, g) { var w = save.warehouse.find(function (x) { return x.sku === sku && x.grade === g; }); return w ? w.lots : 0; }
function addLot(sku, g, cost) {
  var w = save.warehouse.find(function (x) { return x.sku === sku && x.grade === g; });
  if (w) { w.lots += 1; w.unitCost = cost; } else save.warehouse.push({ sku: sku, grade: g, lots: 1, unitCost: cost });
}
function takeNeeds(id) {
  var r = recipeById(id);
  for (var i = 0; i < r.needs.length; i++) if (count(r.needs[i].sku, grade) < r.needs[i].n) return null;
  for (var j = 0; j < r.needs.length; j++) {
    var w = save.warehouse.find(function (x) { return x.sku === r.needs[j].sku && x.grade === grade; });
    w.lots -= r.needs[j].n;
  }
  return grade === "reagent" ? 0.95 : 0.8;
}
function buy(sku) {
  var item = REAGENTS.find(function (x) { return x.sku === sku; });
  var price = item[grade];
  if (save.gold < price) { say("金不够"); return; }
  save.gold -= price; addLot(sku, grade, price); persist(); render();
}
function makeState(r) {
  return { currentTemp: 25, targetTemp: r.targetTemp.slice(), targetRatio: r.targetRatio, actualRatio: r.targetRatio, addSpeed: 0.6, speedLimit: r.speedLimit, partA: 10, partB: 10 / r.targetRatio };
}
function beginRun(id) {
  var p = takeNeeds(id);
  if (p == null) { say("缺料"); return; }
  var r = recipeById(id);
  run.recipeId = id; run.phase = "craft"; run.fill = 8; run.valve = 0; run.baseP = p; run.state = makeState(r);
  say("控温、控速、控配比，然后停手出货");
  startTick(); render();
}
function startTick() {
  clearInterval(tickTimer);
  tickTimer = setInterval(function () {
    if (run.phase !== "craft" || !run.state) return;
    var r = recipeById(run.recipeId);
    var st = run.state;
    st.currentTemp += run.valve * 0.9 + (st.addSpeed > 1 ? r.heatRate * 0.04 : 0) - 0.15;
    if (st.currentTemp < 8) st.currentTemp = 8;
    run.fill = Math.min(100, run.fill + st.addSpeed * 0.8);
    var hz = checkHazard(st);
    if (hz !== "NONE" || run.fill >= 100) { clearInterval(tickTimer); beginQte(hz === "NONE" ? "BOIL_OVER" : hz); }
    else renderMeters();
  }, 120);
}
function setValve(v) { if (run.state) run.valve = v; renderMeters(); }
function setSpeed(v) { if (run.state) run.state.addSpeed = v; renderMeters(); }
function nudgeRatio(d) {
  if (!run.state) return;
  run.state.partB = Math.max(1, run.state.partB + d);
  run.state.actualRatio = run.state.partA / run.state.partB;
  renderMeters();
}
function collectProduct() {
  if (run.phase !== "craft" || !run.state) return;
  clearInterval(tickTimer);
  var r = recipeById(run.recipeId);
  var purity = calculatePurity(run.state, run.baseP, save.scale);
  save.products.push({ recipeId: r.id, purity: purity, units: 1, salvage: false });
  save.made += 1;
  if (purity >= 0.95 && save.mastered.indexOf(r.id) < 0) { save.mastered.push(r.id); save.research += 1; }
  say(r.product + " 纯度 " + Math.round(purity * 100) + "%");
  run.phase = "pick"; run.state = null; persist(); render();
}
function beginQte(kind) {
  run.phase = "qte"; run.qteStarted = performance.now(); run.hazard = kind;
  say(kind === "EXPLOSION" ? "温度失控" : "加料过快，暴沸");
  render();
  clearInterval(qteTimer);
  qteTimer = setInterval(function () {
    var left = 3 - (performance.now() - run.qteStarted) / 1000;
    if (left <= 0) { clearInterval(qteTimer); finishQte("timeout"); }
    else { var cd = document.getElementById("cd"); if (cd) cd.textContent = String(Math.ceil(left)); }
  }, 40);
}
function finishQte(choice) {
  clearInterval(qteTimer); clearInterval(tickTimer);
  var r = recipeById(run.recipeId);
  var elapsed = (performance.now() - run.qteStarted) / 1000;
  var fast = choice === "good" && elapsed <= 1;
  var ok = choice === "good" || choice === "mid";
  if (!ok) {
    save.gold = Math.max(0, save.gold - r.repair); save.reputation -= 2; save.ruined += 1; save.dirty = true;
    save.scars = [r.name].concat(save.scars).slice(0, 6);
    say("事故：维修 -" + r.repair + " 声望 -2");
  } else {
    var p = calculatePurity(run.state || makeState(r), run.baseP || 0.8, save.scale) * (fast ? 0.62 : 0.5);
    save.products.push({ recipeId: r.id, purity: Math.round(p * 100) / 100, units: 1, salvage: true });
    save.rescued += 1;
    if (!fast) { save.gold = Math.max(0, save.gold - Math.ceil(r.repair * 0.5)); save.reputation -= 1; }
    say("抢回残次品");
  }
  run.phase = "pick"; run.state = null; persist(); render();
}
function sell(i) {
  var st = save.products[i]; if (!st) return;
  save.gold += unitPrice(st, save.market); st.units -= 1; if (st.units <= 0) save.products.splice(i, 1);
  persist(); render();
}
function deliver() {
  var c = save.contract; if (!c) return;
  var i = save.products.findIndex(function (p) { return p.recipeId === c.recipeId && !p.salvage && p.purity >= c.purityMin; });
  if (i < 0) { say("没有达标的合同货"); return; }
  save.products.splice(i, 1); save.gold += c.reward; save.research += c.research; save.reputation += 3; save.contract = null;
  say("交货 +" + c.reward + " 金"); persist(); render();
}
function buyScale() {
  if (save.scale) { say("已装天平"); return; }
  if (save.gold < 80 || save.research < 5) { say("差 80 金和 5 研发"); return; }
  save.gold -= 80; save.research -= 5; save.scale = true; persist(); render(); say("配比容错加宽");
}
function jitter(v) { return Math.max(0.85, Math.min(1.25, +(v + (Math.random() * 0.16 - 0.08)).toFixed(2))); }
function endDay() {
  var sold = 0;
  for (var i = 0; i < save.products.length; i++) sold += unitPrice(save.products[i], save.market) * 0.85 * save.products[i].units;
  sold = Math.round(sold); save.gold += sold; save.products = [];
  if (save.contract && save.day >= save.contract.dueDay) { save.reputation -= 4; save.contract = null; }
  save.gold = Math.max(0, save.gold - 8);
  if (save.dirty) save.cleanDays = 0; else { save.cleanDays += 1; save.reputation += 1; }
  save.dirty = false;
  save.market = { salt: jitter(save.market.salt), metal: jitter(save.market.metal), gas: jitter(save.market.gas) };
  save.day += 1;
  if (!save.contract && save.reputation >= 12) save.contract = { recipeId: "cacl2", purityMin: 0.9, reward: 32, research: 2, dueDay: save.day + 3 };
  persist();
  var box = document.getElementById("ledger"); var body = document.getElementById("ledgerBody");
  if (box && body) { box.style.display = "flex"; body.innerHTML = "<h2>第 " + (save.day - 1) + " 天账本</h2><p>清仓 +" + sold + " 金</p><p>房租 -8</p><p>现金 " + save.gold + " · 声望 " + save.reputation + "</p><button class='good' onclick=\"document.getElementById('ledger').style.display='none';render()\">开始新一天</button>"; }
}
function resetSave() { if (!confirm("清掉存档？")) return; save = fresh(); persist(); run = { phase: "pick", recipeId: null, fill: 0, qteStarted: 0, state: null, valve: 0 }; render(); }
function liquidColor() {
  if (run.recipeId === "acetate" && run.state) {
    if (run.state.currentTemp > 50 || run.fill > 84) return "#ff4f9a";
    if (run.fill > 40) return "#ffd0e4";
  }
  if (run.recipeId === "copper") return "#3ec6ff";
  if (run.recipeId === "peroxide") return "#d8f4ff";
  if (run.state && run.state.currentTemp > 90) return "#ffb070";
  return "#f4f0e4";
}
function renderMeters() {
  var liq = document.getElementById("liq"); if (liq) { liq.style.height = (run.phase === "craft" ? Math.max(12, run.fill) : 42) + "%"; liq.style.background = liquidColor(); }
  var meter = document.getElementById("meters");
  if (!meter) return;
  if (run.phase === "craft" && run.state) {
    var st = run.state, p = calculatePurity(st, run.baseP, save.scale);
    meter.innerHTML = "温度 " + Math.round(st.currentTemp) + "°C（目标 " + st.targetTemp[0] + "–" + st.targetTemp[1] + "） · 配比 " + st.actualRatio.toFixed(2) + "/理想" + st.targetRatio + " · 流速 " + st.addSpeed.toFixed(1) + "/阈值" + st.speedLimit + " · 预估纯度 " + Math.round(p * 100) + "%";
  } else meter.textContent = "";
}
function render() {
  document.getElementById("gold").textContent = save.gold + " 金";
  document.getElementById("rs").textContent = "研发 " + save.research;
  document.getElementById("rep").textContent = "声望 " + save.reputation;
  document.getElementById("day").textContent = "第 " + save.day + " 天";
  var gi = document.getElementById("gInd"), gr = document.getElementById("gReg");
  if (gi) gi.className = grade === "industrial" ? "good" : "";
  if (gr) gr.className = grade === "reagent" ? "good" : "";
  document.getElementById("shop").innerHTML = REAGENTS.map(function (it) {
    return "<div class='item'><span>" + it.name + " · " + it[grade] + "金 · 库存 " + count(it.sku, grade) + "</span><button onclick=\"buy('" + it.sku + "')\">买 1 份</button></div>";
  }).join("");
  var rec = recipeById(run.recipeId);
  document.getElementById("eq").textContent = rec ? rec.equation : "选一条 T1 配方";
  document.getElementById("bench").className = "bench" + (run.phase === "qte" ? " qte" : "");
  document.getElementById("cd").textContent = run.phase === "qte" ? "3" : "";
  document.getElementById("recipes").innerHTML = RECIPES.map(function (r) {
    return "<button onclick=\"run.recipeId='" + r.id + "';run.phase='pick';render()\">" + r.name + "</button>";
  }).join("");
  var acts = "";
  if (run.phase === "pick" && rec) acts = "<button class='good' onclick=\"beginRun('" + rec.id + "')\">推上实验台</button>";
  if (run.phase === "craft") acts = "<button onclick=\"setValve(-1)\">冷浴</button><button onclick=\"setValve(0)\">关火</button><button onclick=\"setValve(1)\">加热</button><button onclick=\"setSpeed(0.5)\">慢滴</button><button onclick=\"setSpeed(1.2)\">中速</button><button class='warn' onclick=\"setSpeed(3)\">倒快</button><button onclick=\"nudgeRatio(-1)\">B-</button><button onclick=\"nudgeRatio(1)\">B+</button><button class='good' onclick=\"collectProduct()\">停手出货</button>";
  if (run.phase === "qte" && rec) acts = rec.qte.map(function (c) {
    return "<button class='" + (c.id === "bad" ? "bad" : c.id === "good" ? "good" : "") + "' onclick=\"finishQte('" + c.id + "')\">" + c.label + "</button>";
  }).join("");
  document.getElementById("acts").innerHTML = acts;
  var scars = document.getElementById("scars");
  if (scars) scars.textContent = save.scars.length ? "台面疤痕：" + save.scars.join(" · ") : "";
  var c = save.contract;
  document.getElementById("contract").innerHTML = c
    ? "<p>合同 " + recipeById(c.recipeId).product + " 纯度≥" + Math.round(c.purityMin * 100) + "% 截至第" + c.dueDay + "天 酬 " + c.reward + "</p><button class='good' onclick='deliver()'>交货</button>"
    : "<p>没有合同</p>";
  document.getElementById("stock").innerHTML = save.products.map(function (p, i) {
    return "<div class='item'><span>" + recipeById(p.recipeId).product + " " + Math.round(p.purity * 100) + "%" + (p.salvage ? " 残次" : "") + " · " + unitPrice(p, save.market) + "金</span><button onclick='sell(" + i + ")'>卖</button></div>";
  }).join("") || "<p>没有成品</p>";
  renderMeters();
}
if (document.getElementById("shop")) render();
