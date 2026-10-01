// 変数の初期化
let money = 0;
let power = 1;
let auto = 0;
let mult = 1;
let prestigeCount = 0;

let cCost = 10;
let aCost = 50;
let bCost = 500;

const PRESTIGE_REQUIREMENT = 100000;
const SAVE_KEY = 'moneyClickerSave';

// HTML要素の取得
const moneyEl = document.getElementById('money');
const cpsEl = document.getElementById('cps');
const clickPowerEl = document.getElementById('clickPowerText');
const clickBtn = document.getElementById('clickBtn');
const buyClickBtn = document.getElementById('buyClick');
const buyAutoBtn = document.getElementById('buyAuto');
const buyBoostBtn = document.getElementById('buyBoost');
const prestigeBtn = document.getElementById('prestige');
const saveBtn = document.getElementById('saveBtn');
const resetBtn = document.getElementById('resetBtn');

function formatAmount(amount) {
  return amount.toLocaleString('ja-JP', { maximumFractionDigits: 1 });
}

function getIncomeMultiplier() {
  return mult * (1 + prestigeCount * 0.1);
}

// 画面表示の更新処理
function render() {
  moneyEl.textContent = Math.floor(money).toLocaleString();
  cpsEl.textContent = formatAmount(auto * getIncomeMultiplier());
  clickPowerEl.textContent = `1タップ = +$${formatAmount(power * getIncomeMultiplier())}`;

  buyClickBtn.textContent = `タップ強化 (+$${formatAmount(getIncomeMultiplier())}) | コスト: $${cCost.toLocaleString()}`;
  buyAutoBtn.textContent = `自動購入機 (+$${formatAmount(5 * getIncomeMultiplier())}/秒) | コスト: $${aCost.toLocaleString()}`;
  buyBoostBtn.textContent = `全生産力 2倍！ | コスト: $${bCost.toLocaleString()}`;
  prestigeBtn.textContent = `転生 (+10%永久ボーナス) | $${PRESTIGE_REQUIREMENT.toLocaleString()}`;

  // 所持金が足りないボタンを無効化
  buyClickBtn.disabled = money < cCost;
  buyAutoBtn.disabled = money < aCost;
  buyBoostBtn.disabled = money < bCost;
  prestigeBtn.disabled = money < PRESTIGE_REQUIREMENT;
}

function resetRun() {
  money = 0;
  power = 1;
  auto = 0;
  mult = 1;
  cCost = 10;
  aCost = 50;
  bCost = 500;
  render();
}

function saveGame() {
  const gameState = { money, power, auto, mult, prestigeCount, cCost, aCost, bCost };
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(gameState));
    saveBtn.textContent = '保存しました';
    setTimeout(() => {
      saveBtn.textContent = '💾 セーブ';
    }, 1200);
  } catch {
    saveBtn.textContent = '保存できません';
  }
}

function loadGame() {
  try {
    const savedState = localStorage.getItem(SAVE_KEY);
    if (!savedState) return;

    const gameState = JSON.parse(savedState);
    const fields = ['money', 'power', 'auto', 'mult', 'prestigeCount', 'cCost', 'aCost', 'bCost'];
    if (!fields.every((field) => Number.isFinite(gameState[field]) && gameState[field] >= 0)) {
      throw new Error('Invalid saved game');
    }

    ({ money, power, auto, mult, prestigeCount, cCost, aCost, bCost } = gameState);
  } catch {
    localStorage.removeItem(SAVE_KEY);
  }
}

// メインタップ
clickBtn.addEventListener('click', () => {
  money += power * getIncomeMultiplier();
  render();
});

// タップ強化の購入
buyClickBtn.addEventListener('click', () => {
  if (money >= cCost) {
    money -= cCost;
    power += 1;
    cCost = Math.floor(cCost * 1.5);
    render();
  }
});

// 自動購入機の購入
buyAutoBtn.addEventListener('click', () => {
  if (money >= aCost) {
    money -= aCost;
    auto += 5;
    aCost = Math.floor(aCost * 1.6);
    render();
  }
});

// 倍率ブーストの購入
buyBoostBtn.addEventListener('click', () => {
  if (money >= bCost) {
    money -= bCost;
    mult *= 2;
    bCost = Math.floor(bCost * 3.5);
    render();
  }
});

prestigeBtn.addEventListener('click', () => {
  if (money >= PRESTIGE_REQUIREMENT) {
    prestigeCount += 1;
    resetRun();
  }
});

saveBtn.addEventListener('click', saveGame);

resetBtn.addEventListener('click', () => {
  if (!window.confirm('セーブデータを含めて、すべての進行状況を消去しますか？')) return;

  try {
    localStorage.removeItem(SAVE_KEY);
  } catch {
    resetBtn.textContent = '消去できません';
    return;
  }

  prestigeCount = 0;
  resetRun();
});

// 0.1秒ごとの自動計算（毎秒の1/10を加算）
setInterval(() => {
  money += (auto * getIncomeMultiplier()) / 10;
  render();
}, 100);

// 初回描画
loadGame();
render();