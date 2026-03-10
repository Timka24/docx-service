import { createChronoRow } from "./grid-chrono.js";
import { createEnergyRow } from "./grid-energy.js";
import { createNumericRow } from "./grid-numeric.js";
import { buildPayload } from "./form-payload.js";

const VD_DEV_OPTIONS = [
  "ларингеальная трубка",
  "ларингеальная маска",
  "трахеопищеводная трубка Combitube",
];

const IVL_DEVICE_OPTIONS = [
  '3/30 -"Медпром"',
  '3/30А -"Медпром"',
  '"РИТМ" 100 "ТМТ"',
  'WEINMANN MEDUMAT',
  'Care Fusion Pulmonetic LTV-1200',
];

const DEFIB_MODEL_OPTIONS = [
  {
    label: "Ручные",
    values: [
      "AXION ДКИ-Н-11",
      "BeneHeart D3",
    ],
  },
  {
    label: "Автоматические",
    values: [
      "ZOL AED Plus",
      "LifePak",
      "Comen",
      "Corpuls3",
      "Mindray BeneHeart",
      'ДКИ-Н-11 "Аксион"',
    ],
  },
];

function initSelectOptions(selectId, options) {
  const select = document.getElementById(selectId);
  if (!select) return;
  select.innerHTML = "";
  select.append(new Option("", ""));
  options.forEach((value) => {
    select.append(new Option(value, value));
  });
}

function initSelectOptionsGrouped(selectId, groups) {
  const select = document.getElementById(selectId);
  if (!select) return;
  select.innerHTML = "";
  select.append(new Option("", ""));
  groups.forEach((group) => {
    const optgroup = document.createElement("optgroup");
    optgroup.label = group.label;
    group.values.forEach((value) => {
      optgroup.append(new Option(value, value));
    });
    select.append(optgroup);
  });
}

function setDisplay(id, isVisible) {
  const el = document.getElementById(id);
  if (!el) return;
  el.style.display = isVisible ? "" : "none";
}

function selectedRadioValue(name) {
  return document.querySelector(`input[name="${name}"]:checked`)?.value || "";
}

function updateMedicationVisibility() {
  const medTherapy = selectedRadioValue("med_therapy");
  const showTherapyFields = medTherapy === "yes";
  setDisplay("medTherapyFieldsBlock", showTherapyFields);

  const showOtherControl = showTherapyFields;
  setDisplay("medOtherControlBlock", showOtherControl);

  const showOtherDrugs = showTherapyFields && selectedRadioValue("other_drugs") === "yes";
  setDisplay("medDrugs1Block", showOtherDrugs);
  setDisplay("medDrugs2Block", showOtherDrugs);
}

function updateEndSectionVisibility() {
  const endSuccess = document.getElementById("end_success")?.checked === true;
  setDisplay("endSuccessFieldsBlock", endSuccess);
  document.querySelectorAll(".end-success-field").forEach((el) => {
    el.style.display = endSuccess ? "" : "none";
  });

  const showTransferDoc = endSuccess && (document.getElementById("end_transfer_doc")?.checked === true);
  const showTransferTeam = endSuccess && (document.getElementById("end_transfer_team")?.checked === true);
  setDisplay("endTransferDocDetails", showTransferDoc);
  setDisplay("endTransferTeamDetails", showTransferTeam);
}

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

const nacl = createChronoRow({
  minutes: 70,
  gridId: "naclGrid",
  hintId: "naclHint",
  symPlusBtnId: "naclSymPlus",
  symMinusBtnId: "naclSymMinus",
  symFillBtnId: "naclSymFill",
  symClearBtnId: "naclSymClear",
  symbolBtns: ["naclSymPlus", "naclSymMinus", "naclSymFill", "naclSymClear"],
  modePaintBtnId: "naclModePaint",
  modeRangeBtnId: "naclModeRange"
});

const drugs1 = createChronoRow({
  minutes: 70,
  gridId: "ch_drugs1_grid",
  hintId: "drugs1Hint",
  symPlusBtnId: "drugs1SymPlus",
  symMinusBtnId: "drugs1SymMinus",
  symFillBtnId: "drugs1SymFill",
  symClearBtnId: "drugs1SymClear",
  symbolBtns: ["drugs1SymPlus", "drugs1SymMinus", "drugs1SymFill", "drugs1SymClear"],
  modePaintBtnId: "drugs1ModePaint",
  modeRangeBtnId: "drugs1ModeRange"
});

const drugs2 = createChronoRow({
  minutes: 70,
  gridId: "ch_drugs2_grid",
  hintId: "drugs2Hint",
  symPlusBtnId: "drugs2SymPlus",
  symMinusBtnId: "drugs2SymMinus",
  symFillBtnId: "drugs2SymFill",
  symClearBtnId: "drugs2SymClear",
  symbolBtns: ["drugs2SymPlus", "drugs2SymMinus", "drugs2SymFill", "drugs2SymClear"],
  modePaintBtnId: "drugs2ModePaint",
  modeRangeBtnId: "drugs2ModeRange"
});

const manipulation1 = createChronoRow({
  minutes: 70,
  gridId: "ch_manipulation1_grid",
  hintId: "manip1Hint",
  symPlusBtnId: "manip1SymPlus",
  symMinusBtnId: "manip1SymMinus",
  symFillBtnId: "manip1SymFill",
  symClearBtnId: "manip1SymClear",
  symbolBtns: ["manip1SymPlus", "manip1SymMinus", "manip1SymFill", "manip1SymClear"],
  modePaintBtnId: "manip1ModePaint",
  modeRangeBtnId: "manip1ModeRange"
});

const manipulation2 = createChronoRow({
  minutes: 70,
  gridId: "ch_manipulation2_grid",
  hintId: "manip2Hint",
  symPlusBtnId: "manip2SymPlus",
  symMinusBtnId: "manip2SymMinus",
  symFillBtnId: "manip2SymFill",
  symClearBtnId: "manip2SymClear",
  symbolBtns: ["manip2SymPlus", "manip2SymMinus", "manip2SymFill", "manip2SymClear"],
  modePaintBtnId: "manip2ModePaint",
  modeRangeBtnId: "manip2ModeRange"
});

const chPulseCart = createChronoRow({
  minutes: 70,
  gridId: "ch_pulse_carotid_grid",
  hintId: "pulseCarotidHint",
  symPlusBtnId: "pulseCarotidSymPlus",
  symMinusBtnId: "pulseCarotidSymMinus",
  symFillBtnId: "pulseCarotidSymFill",
  symClearBtnId: "pulseCarotidSymClear",
  symbolBtns: ["pulseCarotidSymPlus", "pulseCarotidSymMinus", "pulseCarotidSymFill", "pulseCarotidSymClear"],
  modePaintBtnId: "pulseCarotidModePaint",
  modeRangeBtnId: "pulseCarotidModeRange"
});

const chPupReact = createChronoRow({
  minutes: 70,
  gridId: "ch_pupil_reaction_grid",
  hintId: "pupilReactionHint",
  symPlusBtnId: "pupilReactionSymPlus",
  symMinusBtnId: "pupilReactionSymMinus",
  symFillBtnId: "pupilReactionSymFill",
  symClearBtnId: "pupilReactionSymClear",
  symbolBtns: ["pupilReactionSymPlus", "pupilReactionSymMinus", "pupilReactionSymFill", "pupilReactionSymClear"],
  modePaintBtnId: "pupilReactionModePaint",
  modeRangeBtnId: "pupilReactionModeRange"
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
  nacl,
  drugs1,
  drugs2,
  manipulation1,
  manipulation2,
  chPulseCart,
  chPupReact,
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
nacl.init();
drugs1.init();
drugs2.init();
manipulation1.init();
manipulation2.init();
chPulseCart.init();
chPupReact.init();
initSelectOptions("vd_dev", VD_DEV_OPTIONS);
initSelectOptions("i_d", IVL_DEVICE_OPTIONS);
initSelectOptionsGrouped("defib_model", DEFIB_MODEL_OPTIONS);

document.getElementById("clearMedTherapy")?.addEventListener("click", () => {
  document.querySelectorAll('input[name="med_therapy"]').forEach((r) => (r.checked = false));
  updateMedicationVisibility();
});
document.getElementById("clearOtherDrugsBtn")?.addEventListener("click", () => {
  document.querySelectorAll('input[name="other_drugs"]').forEach((r) => (r.checked = false));
  updateMedicationVisibility();
});
document.getElementById("clearSlrBtn")?.addEventListener("click", () => {
  document.querySelectorAll('input[name="slr"]').forEach((r) => (r.checked = false));
});
document.getElementById("clearWitnessBtn")?.addEventListener("click", () => {
  document.querySelectorAll('input[name="witness"]').forEach((r) => (r.checked = false));
});
document.getElementById("clearDeathPlaceBtn")?.addEventListener("click", () => {
  document.querySelectorAll('input[name="death_place"]').forEach((r) => (r.checked = false));
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

function toggleSlrStopOtherText() {
  const otherCheck = document.getElementById("slr_stop_oth");
  const otherText = document.getElementById("slr_stop_oth_txt");
  if (!otherCheck || !otherText) return;

  if (otherCheck.checked) {
    otherText.style.display = "block";
  } else {
    otherText.style.display = "none";
  }
}

document.getElementById("slr_stop_oth")?.addEventListener("change", toggleSlrStopOtherText);
document.querySelectorAll('input[name="med_therapy"]').forEach((el) => {
  el.addEventListener("change", updateMedicationVisibility);
});
document.querySelectorAll('input[name="other_drugs"]').forEach((el) => {
  el.addEventListener("change", updateMedicationVisibility);
});
document.getElementById("end_success")?.addEventListener("change", updateEndSectionVisibility);
document.getElementById("end_transfer_doc")?.addEventListener("change", updateEndSectionVisibility);
document.getElementById("end_transfer_team")?.addEventListener("change", updateEndSectionVisibility);
toggleSlrStopOtherText();
updateMedicationVisibility();
updateEndSectionVisibility();

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
normalizeTimeInput(document.getElementById("callAcceptHours"), 23);
normalizeTimeInput(document.getElementById("callAcceptMinutes"), 59);
normalizeTimeInput(document.getElementById("deathHours"), 23);
normalizeTimeInput(document.getElementById("deathMinutes"), 59);
normalizeTimeInput(document.getElementById("slr_h"), 23);
normalizeTimeInput(document.getElementById("slr_m"), 59);
normalizeTimeInput(document.getElementById("bio_d_h"), 23);
normalizeTimeInput(document.getElementById("bio_d_m"), 59);
normalizeTimeInput(document.getElementById("end_h"), 23);
normalizeTimeInput(document.getElementById("end_m"), 59);
normalizeTimeInput(document.getElementById("end_transfer_doc_h"), 23);
normalizeTimeInput(document.getElementById("end_transfer_doc_m"), 59);
normalizeTimeInput(document.getElementById("end_transfer_team_h"), 23);
normalizeTimeInput(document.getElementById("end_transfer_team_m"), 59);


document.getElementById("kvNumber")?.addEventListener("input", function () {
  this.value = this.value.replace(/[^0-9]/g, "");
});

(function setDefaultDate() {
  const input = document.getElementById("nowDate");
  const input2 = document.getElementById("end_date");
  if (!input) return;

  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  input.value = `${yyyy}-${mm}-${dd}`;
  input2.value = `${yyyy}-${mm}-${dd}`;
})();

function clearForm()  {
  initSelectOptions("vd_dev", VD_DEV_OPTIONS);
  initSelectOptions("i_d", IVL_DEVICE_OPTIONS);
  initSelectOptionsGrouped("defib_model", DEFIB_MODEL_OPTIONS);

  document.getElementById("brigade") && (document.getElementById("brigade").value = "");
  document.getElementById("pstation") && (document.getElementById("pstation").value = "");
  document.getElementById("lastName") && (document.getElementById("lastName").value = "");
  document.getElementById("firstName") && (document.getElementById("firstName").value = "");
  document.getElementById("middleName") && (document.getElementById("middleName").value = "");
  document.getElementById("kvNumber") && (document.getElementById("kvNumber").value = "");
  document.getElementById("arrivalHours") && (document.getElementById("arrivalHours").value = "");
  document.getElementById("arrivalMinutes") && (document.getElementById("arrivalMinutes").value = "");
  document.getElementById("callAcceptHours") && (document.getElementById("callAcceptHours").value = "");
  document.getElementById("callAcceptMinutes") && (document.getElementById("callAcceptMinutes").value = "");
  document.getElementById("deathHours") && (document.getElementById("deathHours").value = "");
  document.getElementById("deathMinutes") && (document.getElementById("deathMinutes").value = "");
  [
    "bio_d_h",
    "bio_d_m",
    "br_ruk_last",
    "br_ruk_first",
    "br_ruk_middle",
    "ver_ruk_last",
    "ver_ruk_first",
    "ver_ruk_middle"
  ].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });

  document.querySelectorAll('input[type="radio"]').forEach((r) => (r.checked = false));
  document.querySelectorAll('input[type="checkbox"]').forEach((c) => (c.checked = false));
  document.querySelectorAll('input[name="airway_phase"]').forEach((r) => (r.checked = false));

  ["a1t", "a2t", "a3t", "a4t", "a5t", "et_num", "et_try", "vd_dev"].forEach((id) => {
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

  ["i_d", "i_m", "i_fr", "i_t", "vd_note"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });

  cprManual.clear();
  cprAuto.clear();

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
  const adrSum = document.getElementById("ch_adr_nacl_sum");
  if (adrSum) adrSum.value = "";
  const amioSum = document.getElementById("ch_amio_glu_sum");
  if (amioSum) amioSum.value = "";

  nacl.clear();
  const chNacl = document.getElementById("ch_nacl");
  if (chNacl) chNacl.value = "";

  drugs1.clear();
  const chDrugs1 = document.getElementById("ch_drugs1");
  if (chDrugs1) chDrugs1.value = "";

  drugs2.clear();
  const chDrugs2 = document.getElementById("ch_drugs2");
  if (chDrugs2) chDrugs2.value = "";

  manipulation1.clear();
  const chManipulation1 = document.getElementById("ch_manipulation1");
  if (chManipulation1) chManipulation1.value = "";

  manipulation2.clear();
  const chManipulation2 = document.getElementById("ch_manipulation2");
  if (chManipulation2) chManipulation2.value = "";

  chPulseCart.clear();
  chPupReact.clear();

  const reverseCauses = document.getElementById("reverseCauses");
  if (reverseCauses) reverseCauses.value = "";
  const postResuscitationTherapy = document.getElementById("postResuscitationTherapy");
  if (postResuscitationTherapy) postResuscitationTherapy.value = "";
  const comments = document.getElementById("comments");
  if (comments) comments.value = "";
  const endDate = document.getElementById("end_date");
  if (endDate) endDate.value = "";
  const endH = document.getElementById("end_h");
  if (endH) endH.value = "";
  const endM = document.getElementById("end_m");
  if (endM) endM.value = "";
  const endSuccess = document.getElementById("end_success");
  if (endSuccess) endSuccess.checked = false;

  const endEcgRhythm = document.getElementById("end_ecg_rhythm");
  if (endEcgRhythm) endEcgRhythm.value = "";
  const endHr = document.getElementById("end_hr");
  if (endHr) endHr.value = "";
  const endConclusion = document.getElementById("end_conclusion");
  if (endConclusion) endConclusion.value = "";
  const endGcs = document.getElementById("end_gcs");
  if (endGcs) endGcs.value = "";

  document.querySelectorAll('input[name="end_resp"]').forEach((el) => {
    el.checked = false;
  });

  const endRr = document.getElementById("end_rr");
  if (endRr) endRr.value = "";
  const endBp = document.getElementById("end_bp");
  if (endBp) endBp.value = "";
  const endPulse = document.getElementById("end_pulse");
  if (endPulse) endPulse.value = "";
  const endSpo2 = document.getElementById("end_spo2");
  if (endSpo2) endSpo2.value = "";

  const endTransferDoc = document.getElementById("end_transfer_doc");
  if (endTransferDoc) endTransferDoc.checked = false;
  const endTransferDocFio = document.getElementById("end_transfer_doc_fio");
  if (endTransferDocFio) endTransferDocFio.value = "";
  const endTransferDocH = document.getElementById("end_transfer_doc_h");
  if (endTransferDocH) endTransferDocH.value = "";
  const endTransferDocM = document.getElementById("end_transfer_doc_m");
  if (endTransferDocM) endTransferDocM.value = "";

  const endTransferTeam = document.getElementById("end_transfer_team");
  if (endTransferTeam) endTransferTeam.checked = false;
  const endTransferTeamNum = document.getElementById("end_transfer_team_num");
  if (endTransferTeamNum) endTransferTeamNum.value = "";
  const endTransferTeamH = document.getElementById("end_transfer_team_h");
  if (endTransferTeamH) endTransferTeamH.value = "";
  const endTransferTeamM = document.getElementById("end_transfer_team_m");
  if (endTransferTeamM) endTransferTeamM.value = "";

  const slrStop1 = document.getElementById("slr_stop_1");
  if (slrStop1) slrStop1.checked = false;
  const slrStop2 = document.getElementById("slr_stop_2");
  if (slrStop2) slrStop2.checked = false;
  const slrStopBel = document.getElementById("slr_stop_bel");
  if (slrStopBel) slrStopBel.checked = false;
  const slrStopGip = document.getElementById("slr_stop_gip");
  if (slrStopGip) slrStopGip.checked = false;
  const slrStopOth = document.getElementById("slr_stop_oth");
  if (slrStopOth) slrStopOth.checked = false;
  const slrStopOthTxt = document.getElementById("slr_stop_oth_txt");
  if (slrStopOthTxt) slrStopOthTxt.value = "";
  const slrStop5 = document.getElementById("slr_stop_5");
  if (slrStop5) slrStop5.checked = false;
  const slrStop6 = document.getElementById("slr_stop_6");
  if (slrStop6) slrStop6.checked = false;
  document.querySelectorAll('input[name="other_drugs"]').forEach((r) => (r.checked = false));
  toggleSlrStopOtherText();
  updateMedicationVisibility();
  updateEndSectionVisibility();
  window.lastArchiveId = null;
  setGenerateStatus({ status: "Форма очищена.", archiveId: null, version: null, renderStatus: "—" });
}

document.getElementById("clearBtn")?.addEventListener("click", clearForm);

// 
function setInputValue(id, value) {
  const el = document.getElementById(id);
  if (!el) return;
  el.value = typeof value === "string" ? value : "";
}

function setSelectValue(id, value) {
  const el = document.getElementById(id);
  if (!el) return;
  const text = typeof value === "string" ? value : "";
  if (!text) {
    el.value = "";
    return;
  }
  const exists = Array.from(el.options || []).some((opt) => opt.value === text);
  if (!exists) {
    el.append(new Option(text, text));
  }
  el.value = text;
}

function setCheckboxValue(id, checked) {
  const el = document.getElementById(id);
  if (!el) return;
  el.checked = Boolean(checked);
}

function setRadioByName(name, value) {
  document.querySelectorAll(`input[name="${name}"]`).forEach((radio) => {
    radio.checked = radio.value === value;
  });
}

function splitFio(fio) {
  const parts = String(fio || "").trim().split(/\s+/).filter(Boolean);
  return {
    last: parts[0] || "",
    first: parts[1] || "",
    middle: parts.slice(2).join(" "),
  };
}

function parseIsoDate(raw) {
  const text = String(raw || "").trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
  const ru = text.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (!ru) return "";
  const [, dd, mm, yyyy] = ru;
  return `${yyyy}-${mm}-${dd}`;
}

function arrayOrEmpty(value) {
  return Array.isArray(value) ? value : [];
}

function applyResultPair(name, successMark, failMark) {
  if (successMark === "☑") {
    setRadioByName(name, "s");
    return;
  }
  if (failMark === "☑") {
    setRadioByName(name, "f");
    return;
  }
  setRadioByName(name, "");
}

function applyTailFromKv(kvNum) {
  const kvTail = String(kvNum || "").trim();
  if (!kvTail) return "";
  if (kvTail.startsWith("100-26-")) {
    return kvTail.slice("100-26-".length);
  }
  return kvTail;
}

function loadArchiveToForm(archive) {
  const raw = archive?.raw_data && typeof archive.raw_data === "object" ? archive.raw_data : {};
  clearForm();

  setInputValue("brigade", raw.brig);
  setInputValue("pstation", raw.ps);

  const fio = splitFio(raw.fio_pac);
  setInputValue("lastName", raw.last_name_raw || fio.last);
  setInputValue("firstName", raw.first_name_raw || fio.first);
  setInputValue("middleName", raw.middle_name_raw || fio.middle);

  setInputValue("kvNumber", raw.kv_num_tail_raw || applyTailFromKv(raw.kv_num));

  setInputValue("nowDate", raw.pr_date_iso_raw || parseIsoDate(raw.pr_date));
  setInputValue("end_date", raw.end_date_iso_raw || parseIsoDate(raw.end_date));

  setInputValue("arrivalHours", raw.pr_h);
  setInputValue("arrivalMinutes", raw.pr_m);
  setInputValue("callAcceptHours", raw.pr_time_h);
  setInputValue("callAcceptMinutes", raw.pr_time_m);
  setInputValue("deathHours", raw.d_h);
  setInputValue("deathMinutes", raw.d_m);
  setInputValue("bio_d_h", raw.bio_d_h);
  setInputValue("bio_d_m", raw.bio_d_m);

  setRadioByName("witness", raw.witness || "");
  setRadioByName("death_place", raw.death_place || "");
  setRadioByName("slr", raw.slr || "");
  setRadioByName("airway_phase", raw.a_v === "☑" ? "during" : (raw.a_d === "☑" ? "before" : ""));
  setRadioByName("vascular_phase", raw.v_v === "☑" ? "during" : (raw.v_d === "☑" ? "before" : ""));
  setRadioByName("ivl_alt", raw.t_3 === "☑" ? "3" : (raw.t_15 === "☑" ? "15" : (raw.t_30 === "☑" ? "30" : "")));
  setRadioByName("med_therapy", raw.med_t_y === "☑" ? "yes" : (raw.med_t_n === "☑" ? "no" : ""));
  const hasOtherDrugData =
    String(raw.ch_drugs1 || "").trim() !== "" ||
    String(raw.ch_drugs2 || "").trim() !== "" ||
    arrayOrEmpty(raw.ch_drugs1_marks).some((v) => String(v || "").trim() !== "") ||
    arrayOrEmpty(raw.ch_drugs2_marks).some((v) => String(v || "").trim() !== "");
  setRadioByName("other_drugs", raw.other_drugs || (hasOtherDrugData ? "yes" : "no"));
  setRadioByName("end_resp", raw.end_resp || (raw.end_resp_spont === "☑" ? "spont" : (raw.end_resp_ivl === "☑" ? "ivl" : "")));

  setCheckboxValue("r_start_nms", raw.r_start_nms === "☑");
  setCheckboxValue("r_start_vent", raw.r_start_vent === "☑");
  setCheckboxValue("r_start_defib", raw.r_start_defib === "☑");
  setCheckboxValue("o_air", raw.o_air === "☑");
  setCheckboxValue("o_o2", raw.o_o2 === "☑");

  ["a1t", "a2t", "a3t", "a4t", "a5t", "et_num", "et_try", "v1t", "v2t", "v3t", "v4t", "v1try", "v2try", "v3try", "v4try", "v_point", "fr_m", "i_m", "i_fr", "i_t", "vd_note", "slr_h", "slr_m", "fr_gr", "ch_adr_nacl_sum", "ch_amio_glu_sum", "ch_nacl", "ch_drugs1", "ch_drugs2", "ch_manipulation1", "ch_manipulation2", "reverseCauses", "postResuscitationTherapy", "comments", "end_h", "end_m", "end_ecg_rhythm", "end_hr", "end_conclusion", "end_gcs", "end_rr", "end_bp", "end_pulse", "end_spo2", "end_transfer_doc_fio", "end_transfer_doc_h", "end_transfer_doc_m", "end_transfer_team_num", "end_transfer_team_h", "end_transfer_team_m", "slr_stop_oth_txt", "br_ruk_last", "br_ruk_first", "br_ruk_middle", "ver_ruk_last", "ver_ruk_first", "ver_ruk_middle"].forEach((id) => {
    const map = {
      reverseCauses: "reversible_causes_4g4t",
      postResuscitationTherapy: "post_resuscitation_therapy",
      comments: "comments",
      slr_stop_oth_txt: "slr_oth_txt",
      br_ruk_last: "br_ruk_last_raw",
      br_ruk_first: "br_ruk_first_raw",
      br_ruk_middle: "br_ruk_middle_raw",
      ver_ruk_last: "ver_ruk_last_raw",
      ver_ruk_first: "ver_ruk_first_raw",
      ver_ruk_middle: "ver_ruk_middle_raw",
    };
    const rawKey = map[id] || id;
    setInputValue(id, raw[rawKey]);
  });
  setInputValue("ch_adr_nacl_sum", raw.ch_adr_nacl_sum || raw.ch_adr_nacl_sum_1_35 || raw.ch_adr_nacl_sum_36_70 || "");
  setInputValue("ch_amio_glu_sum", raw.ch_amio_glu_sum || raw.ch_amio_glu_sum_1_35 || raw.ch_amio_glu_sum_36_70 || "");
  setSelectValue("vd_dev", raw.vd_dev);
  setSelectValue("i_d", raw.i_d);
  setSelectValue("defib_model", raw.defib_model);

  applyResultPair("a1_result", raw.a1s, raw.a1f);
  applyResultPair("a2_result", raw.a2s, raw.a2f);
  applyResultPair("a3_result", raw.a3s, raw.a3f);
  applyResultPair("a4_result", raw.a4s, raw.a4f);
  applyResultPair("a5_result", raw.a5s, raw.a5f);
  applyResultPair("v1_result", raw.v1s, raw.v1f);
  applyResultPair("v2_result", raw.v2s, raw.v2f);
  applyResultPair("v3_result", raw.v3s, raw.v3f);
  applyResultPair("v4_result", raw.v4s, raw.v4f);

  setCheckboxValue("end_success", raw.end_success_mark === "☑");
  setCheckboxValue("end_transfer_doc", raw.end_transfer_doc_mark === "☑");
  setCheckboxValue("end_transfer_team", raw.end_transfer_team_mark === "☑");
  setCheckboxValue("slr_stop_1", raw.slr_s1 === "☑");
  setCheckboxValue("slr_stop_2", raw.slr_s2 === "☑");
  setCheckboxValue("slr_stop_bel", raw.slr_bel === "☑");
  setCheckboxValue("slr_stop_gip", raw.slr_gip === "☑");
  setCheckboxValue("slr_stop_oth", raw.slr_oth === "☑");
  setCheckboxValue("slr_stop_5", raw.slr_s5 === "☑");
  setCheckboxValue("slr_stop_6", raw.slr_s6 === "☑");
  toggleSlrStopOtherText();
  updateMedicationVisibility();
  updateEndSectionVisibility();

  grids.cprManual.setData(arrayOrEmpty(raw.ch_cpr_m));
  grids.cprAuto.setData(arrayOrEmpty(raw.ch_cpr_a_marks));
  grids.ventMask.setData(arrayOrEmpty(raw.ch_vent_m_marks));
  grids.ventAdvanced.setData(arrayOrEmpty(raw.ch_vent_a_marks));
  grids.rhythmAs.setData(arrayOrEmpty(raw.ch_rhythm_as_marks));
  grids.rhythmVf.setData(arrayOrEmpty(raw.ch_rhythm_vf_marks));
  grids.rhythmVt.setData(arrayOrEmpty(raw.ch_rhythm_vt_marks));
  grids.rhythmPea.setData(arrayOrEmpty(raw.ch_rhythm_pea_marks));
  grids.rhythmPaced.setData(arrayOrEmpty(raw.ch_rhythm_paced_marks));
  grids.rhythmOrg.setData(arrayOrEmpty(raw.ch_rhythm_organized_marks));
  grids.rhythmBradyPed.setData(arrayOrEmpty(raw.ch_rhythm_brady_ped_marks));
  grids.rhythmChildLt60.setData(arrayOrEmpty(raw.ch_rhythm_child_lt60_marks));
  grids.defibEnergy.setData(arrayOrEmpty(raw.ch_defib_j_marks));
  grids.adrNaclMl.setData(arrayOrEmpty(raw.ch_adr_nacl_ml_marks));
  grids.amioGluMl.setData(arrayOrEmpty(raw.ch_amio_glu_ml_marks));
  grids.nacl.setData(arrayOrEmpty(raw.ch_nacl_marks));
  grids.drugs1.setData(arrayOrEmpty(raw.ch_drugs1_marks));
  grids.drugs2.setData(arrayOrEmpty(raw.ch_drugs2_marks));
  grids.manipulation1.setData(arrayOrEmpty(raw.ch_manipulation1_marks));
  grids.manipulation2.setData(arrayOrEmpty(raw.ch_manipulation2_marks));
  grids.chPulseCart.setData(arrayOrEmpty(raw.ch_pulse_carotid_marks));
  grids.chPupReact.setData(arrayOrEmpty(raw.ch_pupil_reaction_marks));

  window.lastArchiveId = archive.id;
  clearKvError();
  setGenerateStatus({
    status: `Загружена карта #${archive.id} по kv_num ${archive.kv_num}.`,
    archiveId: archive.id,
    version: null,
    renderStatus: "загружено из архива"
  });
}

async function trySuggestLoadByKv() {
  const kvInput = document.getElementById("kvNumber");
  const tail = typeof kvInput?.value === "string" ? kvInput.value.trim() : "";
  if (!tail) return;

  const fullKvNum = `100-26-${tail}`;

  try {
    const resp = await fetch(`/api/archive/by-kv?kv_num=${encodeURIComponent(fullKvNum)}`);
    if (resp.status === 404) return;

    let data = null;
    try {
      data = await resp.json();
    } catch {
      data = null;
    }

    if (!resp.ok) {
      setGenerateStatus({
        status: `Ошибка поиска карты: ${data?.error || `HTTP ${resp.status}`}`,
        archiveId: window.lastArchiveId || null,
        version: null,
        renderStatus: "—"
      });
      return;
    }

    if (window.lastArchiveId && Number(window.lastArchiveId) === Number(data.id)) return;

    const shouldLoad = window.confirm("Найдена ранее заполненная карта с этим kv_num. Загрузить?");
    if (shouldLoad) {
      loadArchiveToForm(data);
    }
  } catch {
    setGenerateStatus({
      status: "Ошибка сети при поиске карты по kv_num",
      archiveId: window.lastArchiveId || null,
      version: null,
      renderStatus: "—"
    });
  }
}


const genStatusEl = document.getElementById("genStatus");
const genArchiveIdEl = document.getElementById("genArchiveId");
const genVersionEl = document.getElementById("genVersion");
const genRenderStatusEl = document.getElementById("genRenderStatus");

function setGenerateStatus({ status, archiveId, version, renderStatus }) {
  if (genStatusEl && typeof status === "string") genStatusEl.textContent = status;
  if (genArchiveIdEl) genArchiveIdEl.textContent = `Архив: ${archiveId ?? "—"}`;
  if (genVersionEl) genVersionEl.textContent = `Версия: ${version ?? "—"}`;
  if (genRenderStatusEl) genRenderStatusEl.textContent = `DOCX/PDF: ${renderStatus || "—"}`;
}

function getKvField() {
  return document.getElementById("kvNumber") || document.querySelector('input[name="kv_num"]');
}

function clearKvError() {
  const kvField = getKvField();
  if (kvField) kvField.classList.remove("error");
}

function highlightKvError() {
  const kvField = getKvField();
  if (!kvField) return;
  kvField.classList.add("error");
  kvField.focus();
}

async function refreshArchiveStatus(archiveId) {
  if (!archiveId) {
    setGenerateStatus({
      status: "Нет archive_id для обновления статуса.",
      archiveId: null,
      version: null,
      renderStatus: "—"
    });
    return;
  }

  try {
    const resp = await fetch(`/api/archive/${archiveId}`);
    let data = null;
    try {
      data = await resp.json();
    } catch {
      data = null;
    }

    if (!resp.ok) {
      const errText = data?.error || `HTTP ${resp.status}`;
      setGenerateStatus({
        status: `Ошибка: ${errText}`,
        archiveId,
        version: null,
        renderStatus: "—"
      });
      return;
    }

    const latestRender = Array.isArray(data.renders) ? data.renders[0] : null;
    if (!latestRender) {
      setGenerateStatus({
        status: "Сохранено. Версия ещё не создана.",
        archiveId,
        version: null,
        renderStatus: "версия ещё не создана"
      });
      return;
    }

    setGenerateStatus({
      status: `Архив #${archiveId}: статус версии обновлён.`,
      archiveId,
      version: latestRender.version,
      renderStatus: `${latestRender.docx_status}/${latestRender.pdf_status}`
    });
  } catch {
    setGenerateStatus({
      status: "Ошибка сети/сервер недоступен",
      archiveId,
      version: null,
      renderStatus: "—"
    });
  }
}

document.getElementById("applyBtn")?.addEventListener("click", async () => {
  clearKvError();
  const payload = buildPayload(grids);
  payload.archive_id = window.lastArchiveId || null;

  try {
    const resp = await fetch("/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    let data = null;
    try {
      data = await resp.json();
    } catch {
      data = null;
    }

    if (!resp.ok) {
      if (resp.status === 409 && errText === "kv_num_exists") {
        highlightKvError();
        setGenerateStatus({
          status: "kv_num уже существует, загрузите карту",
          archiveId: window.lastArchiveId || null,
          version: null,
          renderStatus: "—"
        });
        await trySuggestLoadByKv();
        return;
      }
      setGenerateStatus({
        status: `Ошибка: ${errText}`,
        archiveId: window.lastArchiveId || null,
        version: null,
        renderStatus: "—"
      });
      return;
    }

    const archiveId = data?.archive_id ?? null;
    window.lastArchiveId = archiveId;

    if (data?.message === "queued") {
      setGenerateStatus({
        status: `Сохранено. Поставлено в очередь на формирование. Архив #${archiveId}, версия ${data.version}. Статус: pending.`,
        archiveId,
        version: data.version ?? null,
        renderStatus: "pending/pending"
      });
      await refreshArchiveStatus(archiveId);
      return;
    }

    if (data?.message === "saved_no_kv_num") {
      setGenerateStatus({
        status: `Сохранено как черновик (архив #${archiveId}). Заполните номер квитанции (kv_num), затем снова нажмите «Сформировать».`,
        archiveId,
        version: null,
        renderStatus: "версия не создана"
      });
      highlightKvError();
      return;
    }

    if (data?.error) {
      setGenerateStatus({
        status: `Ошибка: ${data.error}`,
        archiveId,
        version: null,
        renderStatus: "—"
      });
      return;
    }

    setGenerateStatus({
      status: "Получен неожиданный ответ сервера.",
      archiveId,
      version: data?.version ?? null,
      renderStatus: "—"
    });
  } catch {
    setGenerateStatus({
      status: "Ошибка сети/сервер недоступен",
      archiveId: null,
      version: null,
      renderStatus: "—"
    });
  }
});

document.getElementById("refreshStatusBtn")?.addEventListener("click", async () => {
  await refreshArchiveStatus(window.lastArchiveId);
});

getKvField()?.addEventListener("input", clearKvError);
document.getElementById("kvNumber")?.addEventListener("blur", trySuggestLoadByKv);
