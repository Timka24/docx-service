import { createChronoRow } from "./grid-chrono.js";
import { createEnergyRow } from "./grid-energy.js";
import { createNumericRow } from "./grid-numeric.js";
import { buildPayload } from "./form-payload.js";

const adrNaclMl = createNumericRow({
  minutes: 70,
  gridId: "adrNaclGrid",
  hintId: "adrNaclHint",
  valueInputId: "adrNaclValue",
  clearValueBtnId: "adrNaclClearValue",
  modePaintBtnId: "adrNaclModePaint",
  modeRangeBtnId: "adrNaclModeRange"
});

const amioGluMl = createNumericRow({
  minutes: 70,
  gridId: "amioGluGrid",
  hintId: "amioGluHint",
  valueInputId: "amioGluValue",
  clearValueBtnId: "amioGluClearValue",
  modePaintBtnId: "amioGluModePaint",
  modeRangeBtnId: "amioGluModeRange"
});

const defibEnergy = createEnergyRow({
  minutes: 70,
  gridId: "defibGrid",
  hintId: "defibHint",
  inputId: "defibEnergyInput",
  setBtnId: "defibEnergySet",
  clearBtnId: "defibEClear",
  modePaintBtnId: "defibModePaint",
  modeRangeBtnId: "defibModeRange",
  defaultEnergy: 200
});

const cprAuto = createChronoRow({
  minutes: 70,
  gridId: "cprAutoGrid",
  hintId: "cprAHint",
  symPlusBtnId: "cprASymPlus",
  symMinusBtnId: "cprASymMinus",
  symFillBtnId: "cprASymFill",
  symClearBtnId: "cprASymClear",
  symbolBtns: ["cprASymPlus", "cprASymMinus", "cprASymFill", "cprASymClear"],
  modePaintBtnId: "cprAModePaint",
  modeRangeBtnId: "cprAModeRange"
});

const cprManual = createChronoRow({
  minutes: 70,
  gridId: "cprManualGrid",
  hintId: "cprHint",
  symPlusBtnId: "cprSymPlus",
  symMinusBtnId: "cprSymMinus",
  symFillBtnId: "cprSymFill",
  symClearBtnId: "cprSymClear",
  symbolBtns: ["cprSymPlus", "cprSymMinus", "cprSymFill", "cprSymClear"],
  modePaintBtnId: "cprModePaint",
  modeRangeBtnId: "cprModeRange"
});

const ventMask = createChronoRow({
  minutes: 70,
  gridId: "ventMaskGrid",
  hintId: "ventMHint",
  symPlusBtnId: "ventMSymPlus",
  symMinusBtnId: "ventMSymMinus",
  symFillBtnId: "ventMSymFill",
  symClearBtnId: "ventMSymClear",
  symbolBtns: ["ventMSymPlus", "ventMSymMinus", "ventMSymFill", "ventMSymClear"],
  modePaintBtnId: "ventMModePaint",
  modeRangeBtnId: "ventMModeRange"
});

const ventAdvanced = createChronoRow({
  minutes: 70,
  gridId: "ventAdvancedGrid",
  hintId: "ventAHint",
  symPlusBtnId: "ventASymPlus",
  symMinusBtnId: "ventASymMinus",
  symFillBtnId: "ventASymFill",
  symClearBtnId: "ventASymClear",
  symbolBtns: ["ventASymPlus", "ventASymMinus", "ventASymFill", "ventASymClear"],
  modePaintBtnId: "ventAModePaint",
  modeRangeBtnId: "ventAModeRange"
});

const rhythmAs = createChronoRow({
  minutes: 70,
  gridId: "rhythmAsGrid",
  hintId: "rhAsHint",
  symPlusBtnId: "rhAsSymPlus",
  symMinusBtnId: "rhAsSymMinus",
  symFillBtnId: "rhAsSymFill",
  symClearBtnId: "rhAsSymClear",
  symbolBtns: ["rhAsSymPlus", "rhAsSymMinus", "rhAsSymFill", "rhAsSymClear"],
  modePaintBtnId: "rhAsModePaint",
  modeRangeBtnId: "rhAsModeRange"
});

const rhythmVf = createChronoRow({
  minutes: 70,
  gridId: "rhythmVfGrid",
  hintId: "rhVfHint",
  symPlusBtnId: "rhVfSymPlus",
  symMinusBtnId: "rhVfSymMinus",
  symFillBtnId: "rhVfSymFill",
  symClearBtnId: "rhVfSymClear",
  symbolBtns: ["rhVfSymPlus", "rhVfSymMinus", "rhVfSymFill", "rhVfSymClear"],
  modePaintBtnId: "rhVfModePaint",
  modeRangeBtnId: "rhVfModeRange"
});

const rhythmVt = createChronoRow({
  minutes: 70,
  gridId: "rhythmVtGrid",
  hintId: "rhVtHint",
  symPlusBtnId: "rhVtSymPlus",
  symMinusBtnId: "rhVtSymMinus",
  symFillBtnId: "rhVtSymFill",
  symClearBtnId: "rhVtSymClear",
  symbolBtns: ["rhVtSymPlus", "rhVtSymMinus", "rhVtSymFill", "rhVtSymClear"],
  modePaintBtnId: "rhVtModePaint",
  modeRangeBtnId: "rhVtModeRange"
});

const rhythmPea = createChronoRow({
  minutes: 70,
  gridId: "rhythmPeaGrid",
  hintId: "rhPeaHint",
  symPlusBtnId: "rhPeaSymPlus",
  symMinusBtnId: "rhPeaSymMinus",
  symFillBtnId: "rhPeaSymFill",
  symClearBtnId: "rhPeaSymClear",
  symbolBtns: ["rhPeaSymPlus", "rhPeaSymMinus", "rhPeaSymFill", "rhPeaSymClear"],
  modePaintBtnId: "rhPeaModePaint",
  modeRangeBtnId: "rhPeaModeRange"
});

const rhythmPaced = createChronoRow({
  minutes: 70,
  gridId: "rhythmPacedGrid",
  hintId: "rhPacedHint",
  symPlusBtnId: "rhPacedSymPlus",
  symMinusBtnId: "rhPacedSymMinus",
  symFillBtnId: "rhPacedSymFill",
  symClearBtnId: "rhPacedSymClear",
  symbolBtns: ["rhPacedSymPlus", "rhPacedSymMinus", "rhPacedSymFill", "rhPacedSymClear"],
  modePaintBtnId: "rhPacedModePaint",
  modeRangeBtnId: "rhPacedModeRange"
});

const rhythmOrg = createChronoRow({
  minutes: 70,
  gridId: "rhythmOrgGrid",
  hintId: "rhOrgHint",
  symPlusBtnId: "rhOrgSymPlus",
  symMinusBtnId: "rhOrgSymMinus",
  symFillBtnId: "rhOrgSymFill",
  symClearBtnId: "rhOrgSymClear",
  symbolBtns: ["rhOrgSymPlus", "rhOrgSymMinus", "rhOrgSymFill", "rhOrgSymClear"],
  modePaintBtnId: "rhOrgModePaint",
  modeRangeBtnId: "rhOrgModeRange"
});

const rhythmBradyPed = createChronoRow({
  minutes: 70,
  gridId: "rhythmBradyPedGrid",
  hintId: "rhBradyPedHint",
  symPlusBtnId: "rhBradyPedSymPlus",
  symMinusBtnId: "rhBradyPedSymMinus",
  symFillBtnId: "rhBradyPedSymFill",
  symClearBtnId: "rhBradyPedSymClear",
  symbolBtns: ["rhBradyPedSymPlus", "rhBradyPedSymMinus", "rhBradyPedSymFill", "rhBradyPedSymClear"],
  modePaintBtnId: "rhBradyPedModePaint",
  modeRangeBtnId: "rhBradyPedModeRange"
});

const rhythmChildLt60 = createChronoRow({
  minutes: 70,
  gridId: "rhythmChildLt60Grid",
  hintId: "rhChildLt60Hint",
  symPlusBtnId: "rhChildLt60SymPlus",
  symMinusBtnId: "rhChildLt60SymMinus",
  symFillBtnId: "rhChildLt60SymFill",
  symClearBtnId: "rhChildLt60SymClear",
  symbolBtns: ["rhChildLt60SymPlus", "rhChildLt60SymMinus", "rhChildLt60SymFill", "rhChildLt60SymClear"],
  modePaintBtnId: "rhChildLt60ModePaint",
  modeRangeBtnId: "rhChildLt60ModeRange"
});

function getDosageGridValue() {
  const raw = (document.getElementById("dosageGridValue")?.value ?? "").toString().trim();
  if (!raw) return "";

  let normalized = raw.replace(/\s+/g, "").replace(",", ".");
  if (!/^\d+(\.\d+)?$/.test(normalized)) return null;

  if (normalized.includes(".")) {
    normalized = normalized.replace(/0+$/g, "").replace(/\.$/, "");
  }

  return normalized.replace(".", ",");
}

const dosageGrid = createChronoRow({
  minutes: 70,
  gridId: "dosageGrid",
  hintId: "dosageGridHint",
  modePaintBtnId: "dosageGridModePaint",
  modeRangeBtnId: "dosageGridModeRange",
  getActiveSymbol: getDosageGridValue,
  invalidSymbolHint: "Ошибка: введите число (пример: 2 или 2,5)"
});


const grids = {
  cprManual,
  cprAuto,
  ventMask,
  ventAdvanced,
  rhythmAs,
  rhythmVf,
  rhythmVt,
  rhythmPea,
  rhythmPaced,
  rhythmOrg,
  rhythmBradyPed,
  rhythmChildLt60,
  defibEnergy,
  adrNaclMl,
  amioGluMl,
  dosageGrid,
};

adrNaclMl.init();
amioGluMl.init();
defibEnergy.init();
cprAuto.init();
cprManual.init();
ventMask.init();
ventAdvanced.init();
rhythmAs.init();
rhythmVf.init();
rhythmVt.init();
rhythmPea.init();
rhythmPaced.init();
rhythmOrg.init();
rhythmBradyPed.init();
rhythmChildLt60.init();
dosageGrid.init();

document.getElementById("dosageGridClearValue")?.addEventListener("click", () => {
  const input = document.getElementById("dosageGridValue");
  if (input) input.value = "";
});

document.getElementById("clearMedTherapy")?.addEventListener("click", () => {
  document.querySelectorAll('input[name="med_therapy"]').forEach((r) => (r.checked = false));
});
document.getElementById("clearSlrControlBtn")?.addEventListener("click", () => {
  document.querySelectorAll('input[name="slr_control"]').forEach((r) => (r.checked = false));
});
document.getElementById("clearSlrBtn")?.addEventListener("click", () => {
  document.querySelectorAll('input[name="slr"]').forEach((r) => (r.checked = false));
});
document.getElementById("clearWitnessBtn")?.addEventListener("click", () => {
  document.querySelectorAll('input[name="witness"]').forEach((r) => (r.checked = false));
});
document.getElementById("clearVascularPhaseBtn")?.addEventListener("click", () => {
  document.querySelectorAll('input[name="vascular_phase"]').forEach((r) => (r.checked = false));
});
document.getElementById("clearAWhenBtn")?.addEventListener("click", () => {
  document.querySelectorAll('input[name="airway_phase"]').forEach((r) => (r.checked = false));
});
document.getElementById("clearIvlBtn")?.addEventListener("click", () => {
  document.querySelectorAll('input[name="ivl_alt"]').forEach((r) => (r.checked = false));
  const fr = document.getElementById("fr_m");
  if (fr) fr.value = "";
});
document.getElementById("clearRstartBtn")?.addEventListener("click", () => {
  const rn = document.getElementById("r_start_nms");
  const rv = document.getElementById("r_start_vent");
  const rd = document.getElementById("r_start_defib");
  if (rn) rn.checked = false;
  if (rv) rv.checked = false;
  if (rd) rd.checked = false;
});
document.getElementById("clearOBtn")?.addEventListener("click", () => {
  const oa = document.getElementById("o_air");
  const oo = document.getElementById("o_o2");
  if (oa) oa.checked = false;
  if (oo) oo.checked = false;
});

function normalizeTimeInput(input, max) {
  if (!input) return;
  input.addEventListener("blur", () => {
    let v = input.value.replace(/\D/g, "");
    if (v === "") return;

    let num = parseInt(v, 10);
    if (isNaN(num)) num = 0;

    if (num > max) num = max;
    if (num < 0) num = 0;

    input.value = String(num).padStart(2, "0");
  });
}

normalizeTimeInput(document.getElementById("arrivalMinutes"), 59);
normalizeTimeInput(document.getElementById("arrivalHours"), 23);
normalizeTimeInput(document.getElementById("deathHours"), 23);
normalizeTimeInput(document.getElementById("deathMinutes"), 59);
normalizeTimeInput(document.getElementById("slr_h"), 23);
normalizeTimeInput(document.getElementById("slr_m"), 59);

document.getElementById("kvNumber")?.addEventListener("input", function () {
  this.value = this.value.replace(/[^0-9]/g, "");
});

(function setDefaultDate() {
  const input = document.getElementById("nowDate");
  if (!input) return;

  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  input.value = `${yyyy}-${mm}-${dd}`;
})();

document.getElementById("clearBtn")?.addEventListener("click", () => {
  document.getElementById("brigade") && (document.getElementById("brigade").value = "");
  document.getElementById("pstation") && (document.getElementById("pstation").value = "");
  document.getElementById("lastName") && (document.getElementById("lastName").value = "");
  document.getElementById("firstName") && (document.getElementById("firstName").value = "");
  document.getElementById("middleName") && (document.getElementById("middleName").value = "");
  document.getElementById("kvNumber") && (document.getElementById("kvNumber").value = "");
  document.getElementById("arrivalHours") && (document.getElementById("arrivalHours").value = "");
  document.getElementById("arrivalMinutes") && (document.getElementById("arrivalMinutes").value = "");
  document.getElementById("deathHours") && (document.getElementById("deathHours").value = "");
  document.getElementById("deathMinutes") && (document.getElementById("deathMinutes").value = "");

  document.querySelectorAll('input[type="radio"]').forEach((r) => (r.checked = false));
  document.querySelectorAll('input[type="checkbox"]').forEach((c) => (c.checked = false));
  document.querySelectorAll('input[name="airway_phase"]').forEach((r) => (r.checked = false));

  ["a1t", "a2t", "a3t", "a4t", "a5t", "et_num", "et_try"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });
  ["a1_result", "a2_result", "a3_result", "a4_result", "a5_result"].forEach((name) => {
    document.querySelectorAll(`input[name="${name}"]`).forEach((r) => (r.checked = false));
  });
  document.querySelectorAll('input[name="vascular_phase"]').forEach((r) => (r.checked = false));
  ["v1t", "v2t", "v3t", "v4t", "v1try", "v2try", "v3try", "v4try", "v_point"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });
  ["v1_result", "v2_result", "v3_result", "v4_result"].forEach((name) => {
    document.querySelectorAll(`input[name="${name}"]`).forEach((r) => (r.checked = false));
  });

  document.querySelectorAll('input[name="ivl_alt"]').forEach((r) => (r.checked = false));
  const fr = document.getElementById("fr_m");
  if (fr) fr.value = "";

  ["i_d", "i_m", "i_fr", "i_t"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });

  cprManual.clear();
  cprAuto.clear();
  const chCprA = document.getElementById("ch_cpr_a");
  if (chCprA) chCprA.value = "";

  ventMask.clear();
  ventAdvanced.clear();
  rhythmAs.clear();
  rhythmVf.clear();
  rhythmVt.clear();
  rhythmPea.clear();
  rhythmPaced.clear();
  rhythmOrg.clear();
  rhythmBradyPed.clear();
  rhythmChildLt60.clear();
  defibEnergy.clear();

  const dm = document.getElementById("defib_model");
  if (dm) dm.value = "";
  const en = document.getElementById("defibEnergyInput");
  if (en) en.value = "";

  adrNaclMl.clear();
  amioGluMl.clear();
  const adrInp = document.getElementById("adrNaclValue");
  if (adrInp) adrInp.value = "";
  const amioInp = document.getElementById("amioGluValue");
  if (amioInp) amioInp.value = "";

  dosageGrid.clear();
  const dosGr = document.getElementById("dosageGridValue");
  if (dosGr) dosGr.value = "";
  const dosMl = document.getElementById("dosageMl");
  if (dosMl) dosMl.value = "";

});

document.getElementById("applyBtn")?.addEventListener("click", async () => {
  const payload = buildPayload(grids);

  const resp = await fetch("/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!resp.ok) {
    const txt = await resp.text();
    alert(txt || "Ошибка формирования DOCX");
    return;
  }

  const blob = await resp.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "filled.docx";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
});
