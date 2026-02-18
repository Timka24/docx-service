const MINUTES = 70;
const ALLOWED = new Set(["", "+", "-", "■"]);

function pad2(n) {
  return String(n).padStart(2, "0");
}

function normalizeRow70(v) {
  const arr = Array.isArray(v) ? v : [];
  const out = new Array(MINUTES).fill("").map((_, idx) => {
    const s = (arr[idx] ?? "").toString().trim();
    return ALLOWED.has(s) ? s : "";
  });
  return out;
}

// --- мл по минутам: "" или дробное число (запятая/точка) ---
function normalizeMl70(v) {
  const arr = Array.isArray(v) ? v : [];
  const out = new Array(MINUTES).fill("").map((_, idx) => {
    let s = (arr[idx] ?? "").toString().trim();
    if (s === "") return "";

    // допускаем "2,5" и "2.5"
    s = s.replace(/\s+/g, "").replace(",", ".");
    if (!/^\d+(\.\d+)?$/.test(s)) return "";

    const num = Number(s);
    if (!Number.isFinite(num)) return "";

    // назад в строку с запятой, без лишних нулей
    let t = s;
    if (t.includes(".")) t = t.replace(/0+$/g, "").replace(/\.$/, "");
    t = t.replace(".", ",");
    return t;
  });
  return out;
}

function parseMlToNumber(s) {
  if (!s) return 0;
  const n = Number(String(s).replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}

function formatSumRu(n) {
  if (!Number.isFinite(n) || n === 0) return "";

  let t = n.toFixed(2);
  t = t.replace(/0+$/g, "").replace(/\.$/, "");
  return t.replace(".", ",");
}

function sumRange(row, a, b) {
  let sum = 0;
  for (let i = a; i <= b; i++) sum += parseMlToNumber(row[i - 1]);
  return sum;
}

// --- ДЕФИБРИЛЛЯЦИЯ: энергия в Дж по минутам (1..70) ---
function normalizeDefibEnergy70(v) {
  const arr = Array.isArray(v) ? v : [];
  const out = new Array(MINUTES).fill("").map((_, idx) => {
    let s = (arr[idx] ?? "").toString().trim();
    if (s === "") return "";
    s = s.replace(/\s+/g, "");
    if (/^\d+(\/\d+)*$/.test(s)) return s;
    return "";
  });
  return out;
}

module.exports = {
  MINUTES,
  pad2,
  normalizeRow70,
  normalizeMl70,
  parseMlToNumber,
  formatSumRu,
  sumRange,
  normalizeDefibEnergy70
};
