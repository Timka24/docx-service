var _document$getElementB7, _document$getElementB8, _document$getElementB9, _document$getElementB0, _document$getElementB1, _document$getElementB10, _document$getElementB11, _document$getElementB12, _document$getElementB13, _document$getElementB14, _document$getElementB15, _document$getElementB16, _document$getElementB17, _document$getElementB18, _document$getElementB19, _document$getElementB20, _document$getElementB21, _document$getElementB22, _document$getElementB24, _document$getElementB25, _document$getElementB26, _getKvField, _document$getElementB27, _document$getElementB28, _document$getElementB29;
import { createChronoRow } from "./grid-chrono.js";
import { createEnergyRow } from "./grid-energy.js";
import { createNumericRow } from "./grid-numeric.js";
import { buildPayload } from "./form-payload.js";
import { KV_PREFIX_BASE_CODES, PSTATION_OPTIONS } from "./form-config.js";
const VD_DEV_OPTIONS = ["ларингеальная трубка", "ларингеальная маска", "трахеопищеводная трубка Combitube"];
const IVL_DEVICE_OPTIONS = ['3/30 -"Медпром"', '3/30А -"Медпром"', '"РИТМ" 100 "ТМТ"', 'WEINMANN MEDUMAT', 'CareFusion LTV-1200', "4/40А (Медпром)", "Drager Oxylog 1000", "Drager Oxylog 3000", "Drager Oxylog 3000+", "Drager Carina"];
const DEFIB_MODEL_OPTIONS = ["Mindray BeneHeart D3", "ДКИ-Н-11 (ЭКГ) Аксион", "LifePak 1000", "Zoll AED Plus", "Comen", "CORPULS3"];
function initSelectOptions(selectId, options) {
  const select = document.getElementById(selectId);
  if (!select) return;
  select.innerHTML = "";
  select.append(new Option("", ""));
  options.forEach(value => {
    select.append(new Option(value, value));
  });
}
function initSelectOptionsGrouped(selectId, groups) {
  const select = document.getElementById(selectId);
  if (!select) return;
  select.innerHTML = "";
  select.append(new Option("", ""));
  groups.forEach(group => {
    const optgroup = document.createElement("optgroup");
    optgroup.label = group.label;
    group.values.forEach(value => {
      optgroup.append(new Option(value, value));
    });
    select.append(optgroup);
  });
}
function getCallYearFromDateInput() {
  var _document$getElementB;
  const iso = ((_document$getElementB = document.getElementById("nowDate")) === null || _document$getElementB === void 0 ? void 0 : _document$getElementB.value) || "";
  const year = Number(String(iso).slice(0, 4));
  return Number.isInteger(year) && year >= 1900 ? year : new Date().getFullYear();
}
function formatKvPrefix(code, year) {
  return `${code}-${String(year).slice(-2)}`;
}
function buildKvPrefixOptions(year) {
  return KV_PREFIX_BASE_CODES.map(code => formatKvPrefix(code, year));
}
function syncKvPrefixOptions(preferredPrefix = "") {
  const select = document.getElementById("kvPrefix");
  if (!select) return;
  const year = getCallYearFromDateInput();
  const options = buildKvPrefixOptions(year);
  const fallback = options[0] || "";
  const nextValue = options.includes(preferredPrefix) ? preferredPrefix : fallback;
  select.innerHTML = "";
  options.forEach(value => {
    select.append(new Option(value, value));
  });
  select.value = nextValue;
}
function initPstationSelectOptions() {
  initSelectOptions("pstation", PSTATION_OPTIONS);
}
function ensureSelectOption(selectId, value) {
  const select = document.getElementById(selectId);
  const nextValue = String(value || "").trim();
  if (!select || !nextValue) return;
  const exists = Array.from(select.options).some(opt => opt.value === nextValue);
  if (!exists) {
    select.append(new Option(nextValue, nextValue));
  }
  select.value = nextValue;
}
function parseKvNum(kvNum) {
  const rawKv = String(kvNum || "").trim();
  if (!rawKv) return {
    prefix: "",
    tail: ""
  };
  const match = rawKv.match(/^(\d+-\d{2})-(.+)$/);
  if (!match) return {
    prefix: "",
    tail: rawKv
  };
  return {
    prefix: match[1],
    tail: match[2]
  };
}
function setDisplay(id, isVisible) {
  const el = document.getElementById(id);
  if (!el) return;
  const target = el.closest(".chrono-grid-accordion") || el;
  if (target !== el) el.style.display = "";
  target.style.display = isVisible ? "" : "none";
}
const CHRONO_SECTION_SELECTOR = "[data-chrono-section]";
const CHRONO_VALUE_INPUT_IDS = ["slr_h", "slr_m", "fr_gr", "defib_model", "ch_adr_nacl_sum", "ch_amio_glu_sum", "ch_nacl", "ch_drugs1", "ch_drugs2", "ch_manipulation1", "ch_manipulation2"];
const CHRONO_GRID_ACCORDIONS = [{
  sectionId: "chronoCprManualSection",
  gridId: "cprManualGrid"
}, {
  sectionId: "chronoCprAutoSection",
  gridId: "cprAutoGrid"
}, {
  sectionId: "chronoVentMaskSection",
  gridId: "ventMaskGrid"
}, {
  sectionId: "chronoVentAdvancedSection",
  gridId: "ventAdvancedGrid"
}, {
  sectionId: "chronoRhythmAsSection",
  gridId: "rhythmAsGrid"
}, {
  sectionId: "chronoRhythmVfSection",
  gridId: "rhythmVfGrid"
}, {
  sectionId: "chronoRhythmVtSection",
  gridId: "rhythmVtGrid"
}, {
  sectionId: "chronoRhythmPeaSection",
  gridId: "rhythmPeaGrid"
}, {
  sectionId: "chronoRhythmPacedSection",
  gridId: "rhythmPacedGrid"
}, {
  sectionId: "chronoRhythmOrgSection",
  gridId: "rhythmOrgGrid"
}, {
  sectionId: "chronoRhythmBradyPedSection",
  gridId: "rhythmBradyPedGrid"
}, {
  sectionId: "chronoRhythmChildLt60Section",
  gridId: "rhythmChildLt60Grid"
}, {
  sectionId: "chronoDefibSection",
  gridId: "defibGrid"
}, {
  sectionId: "medTherapyFieldsBlock",
  gridId: "adrNaclGrid"
}, {
  sectionId: "medTherapyFieldsBlock",
  gridId: "amioGluGrid"
}, {
  sectionId: "medNaclBlock",
  gridId: "naclGrid"
}, {
  sectionId: "medDrugs1Block",
  gridId: "ch_drugs1_grid"
}, {
  sectionId: "medDrugs2Block",
  gridId: "ch_drugs2_grid"
}, {
  sectionId: "chronoManipulation1Section",
  gridId: "ch_manipulation1_grid"
}, {
  sectionId: "chronoManipulation2Section",
  gridId: "ch_manipulation2_grid"
}, {
  sectionId: "chronoPulseCarotidSection",
  gridId: "ch_pulse_carotid_grid"
}, {
  sectionId: "chronoPupilReactionSection",
  gridId: "ch_pupil_reaction_grid"
}];
const EMPTY_STATUS_HTML = "&#1053;&#1077;&#1090; &#1076;&#1072;&#1085;&#1085;&#1099;&#1093;";
const FILLED_STATUS_PREFIX_HTML = "&#1047;&#1072;&#1087;&#1086;&#1083;&#1085;&#1077;&#1085;&#1086; &#1084;&#1080;&#1085;&#1091;&#1090;: ";
function countFilledChronoMinutes(data) {
  return Array.isArray(data) ? data.reduce((count, value) => count + (String(value || "").trim() !== "" ? 1 : 0), 0) : 0;
}
function getChronoAccordionTitle(host) {
  var _sourceLabel$innerHTM;
  const sourceLabel = Array.from(host.children).find(child => {
    var _child$classList;
    return (_child$classList = child.classList) === null || _child$classList === void 0 ? void 0 : _child$classList.contains("form-label");
  });
  return (sourceLabel === null || sourceLabel === void 0 || (_sourceLabel$innerHTM = sourceLabel.innerHTML) === null || _sourceLabel$innerHTM === void 0 ? void 0 : _sourceLabel$innerHTM.trim()) || "";
}
function setChronoAccordionExpanded(wrapper, expanded) {
  var _wrapper$querySelecto;
  if (!wrapper) return;
  wrapper.classList.toggle("is-collapsed", !expanded);
  (_wrapper$querySelecto = wrapper.querySelector(".chrono-grid-header")) === null || _wrapper$querySelecto === void 0 || _wrapper$querySelecto.setAttribute("aria-expanded", expanded ? "true" : "false");
}
function updateChronoAccordionStatus(gridId, data) {
  const status = document.querySelector(`[data-chrono-grid-status="${gridId}"]`);
  if (!status) return;
  const filledMinutes = countFilledChronoMinutes(data);
  const hasData = filledMinutes > 0;
  status.innerHTML = hasData ? FILLED_STATUS_PREFIX_HTML + filledMinutes : EMPTY_STATUS_HTML;
  status.classList.toggle("is-empty", !hasData);
  status.classList.toggle("is-filled", hasData);
}
function dispatchFieldEvents(el) {
  el.dispatchEvent(new Event("input", {
    bubbles: true
  }));
  el.dispatchEvent(new Event("change", {
    bubbles: true
  }));
}
function clearSection(sectionElement) {
  if (!sectionElement) return;
  const fields = sectionElement.querySelectorAll("input, textarea, select");
  fields.forEach(field => {
    if (field.closest(".checkbox-grid")) return;
    if (field.type === "checkbox" || field.type === "radio") {
      if (!field.checked) return;
      field.checked = false;
      dispatchFieldEvents(field);
      return;
    }
    if (field.value === "") return;
    field.value = "";
    dispatchFieldEvents(field);
  });
}
function setChronoVisibility(show) {
  document.querySelectorAll(CHRONO_SECTION_SELECTOR).forEach(section => {
    section.style.display = show ? "" : "none";
  });
}
function hasAnyChronoData() {
  const hasInputData = CHRONO_VALUE_INPUT_IDS.some(id => {
    const el = document.getElementById(id);
    return el && String(el.value || "").trim() !== "";
  });
  if (hasInputData) return true;
  return Object.values(grids).some(grid => {
    var _grid$getData;
    const data = grid === null || grid === void 0 || (_grid$getData = grid.getData) === null || _grid$getData === void 0 ? void 0 : _grid$getData.call(grid);
    return Array.isArray(data) && data.some(item => String(item || "").trim() !== "");
  });
}
function applyChronoVisibilityState(preferredValue = "") {
  setChronoVisibility(true);
}
const UX_STORAGE_KEY = "slr_form_draft_v1";
const DEFAULT_FORM_MODE = "basic";
const NAVIGATOR_SECTIONS = [["main", "Основные данные"], ["circumstances", "Время"], ["resuscitation_start", "Начало реанимации"], ["notes", "Особенности"], ["chrono", "Хронометраж"], ["outcome", "Исход"], ["signatures", "Подписи"]];
function setFormMode(mode = DEFAULT_FORM_MODE) {
  const target = mode === "full" ? "full" : DEFAULT_FORM_MODE;
  document.querySelectorAll('input[name="form_mode"]').forEach(input => {
    input.checked = input.value === target;
  });
  syncFormModeToggleState();
}
function syncFormModeToggleState() {
  document.querySelectorAll("#formModeToggle .radio-option").forEach(option => {
    const modeInput = option.querySelector('input[name="form_mode"]');
    option.classList.toggle("is-active", Boolean(modeInput === null || modeInput === void 0 ? void 0 : modeInput.checked));
  });
}
function findFormGroupByFieldId(fieldId) {
  var _node$classList;
  const node = document.getElementById(fieldId);
  if (!node) return null;
  if ((_node$classList = node.classList) !== null && _node$classList !== void 0 && _node$classList.contains("form-group")) return node;
  return node.closest(".form-group") || null;
}
function createSectionWrapper({
  key,
  title,
  startFieldId,
  endFieldId
}) {
  const form = document.getElementById("docxForm");
  const start = findFormGroupByFieldId(startFieldId);
  const end = findFormGroupByFieldId(endFieldId);
  if (!form || !start || !end) return null;
  const existing = form.querySelector(`.section-wrapper[data-form-section="${key}"]`);
  if (existing) return existing;
  const wrapper = document.createElement("section");
  wrapper.className = "section-wrapper";
  wrapper.dataset.formSection = key;
  const headerBtn = document.createElement("button");
  headerBtn.type = "button";
  headerBtn.className = "section-header-btn";
  headerBtn.textContent = title;
  wrapper.append(headerBtn);
  const content = document.createElement("div");
  content.className = "form-section-content";
  wrapper.append(content);
  const nodes = [];
  let current = start;
  while (current) {
    nodes.push(current);
    if (current === end) break;
    current = current.nextElementSibling;
  }
  if (nodes.length === 0 || nodes[nodes.length - 1] !== end) return null;
  form.insertBefore(wrapper, start);
  nodes.forEach(node => content.append(node));
  return wrapper;
}
function initUxSections() {
  const sections = [{
    key: "main",
    title: "1. Основные данные",
    startFieldId: "brigade",
    endFieldId: "nowDate"
  }, {
    key: "circumstances",
    title: "2. Время и обстоятельства",
    startFieldId: "arrivalHours",
    endFieldId: "clearSlrBtn"
  }, {
    key: "resuscitation_start",
    title: "3. Начало реанимационных мероприятий",
    startFieldId: "clearRstartBtn",
    endFieldId: "apparatusIvlSection"
  }, {
    key: "notes",
    title: "4. Особенности",
    startFieldId: "vd_note",
    endFieldId: "vd_note"
  }, {
    key: "chrono",
    title: "5. Хронометраж мероприятий",
    startFieldId: "chronoStartCprSection",
    endFieldId: "chronoPupilReactionSection"
  }, {
    key: "outcome",
    title: "6. Завершение реанимации",
    startFieldId: "reverseCauses",
    endFieldId: "bio_d_h"
  }, {
    key: "signatures",
    title: "7. Подписи",
    startFieldId: "br_ruk_last",
    endFieldId: "ver_ruk_last"
  }];
  sections.forEach(section => createSectionWrapper(section));
  const chrono = document.querySelector('.section-wrapper[data-form-section="chrono"] .form-section-content');
  if (chrono) {
    ["chronoStartCprSection", "chronoCompressionRateSection", "chronoMonitoringSection", "chronoMedicationSection", "chronoManipulation1Section", "chronoManipulation2Section", "chronoPulseCarotidSection", "chronoPupilReactionSection"].forEach(id => {
      const el = document.getElementById(id);
      if (el && !chrono.contains(el)) {
        console.error(`${id} outside chrono section`);
      }
    });
  }
}
function getVisibleSectionWrappers() {
  return Array.from(document.querySelectorAll(".section-wrapper")).filter(wrapper => !wrapper.hidden);
}
function syncSectionVisibility() {
  const wrappers = Array.from(document.querySelectorAll(".section-wrapper"));
  wrappers.forEach(wrapper => {
    const visibleGroups = Array.from(wrapper.querySelectorAll(":scope > .form-section-content > .form-group")).filter(group => !group.hidden);
    wrapper.hidden = visibleGroups.length === 0;
  });
  const visibleWrappers = getVisibleSectionWrappers();
  const openedVisible = visibleWrappers.filter(wrapper => !wrapper.classList.contains("is-collapsed"));
  if (openedVisible.length === 0 && visibleWrappers[0]) {
    visibleWrappers[0].classList.remove("is-collapsed");
  }
}
function syncNavigatorVisibility() {
  document.querySelectorAll(".navigator-btn").forEach(btn => {
    const target = document.querySelector(`.section-wrapper[data-form-section="${btn.dataset.targetSection}"]`);
    const hidden = !target || target.hidden;
    btn.hidden = hidden;
    if (hidden) btn.classList.remove("active");
  });
}
function initAccordionBehavior() {
  const wrappers = Array.from(document.querySelectorAll(".section-wrapper"));
  wrappers.forEach((wrapper, idx) => {
    var _wrapper$querySelecto2;
    if (idx > 1) wrapper.classList.add("is-collapsed");
    (_wrapper$querySelecto2 = wrapper.querySelector(".section-header-btn")) === null || _wrapper$querySelecto2 === void 0 || _wrapper$querySelecto2.addEventListener("click", () => {
      wrapper.classList.toggle("is-collapsed");
      updateNavigatorState();
    });
  });
}
function currentMode() {
  return selectedRadioValue("form_mode") || "basic";
}
function getRequiredFieldsMissingCount() {
  const requiredIds = ["brigade", "pstation", "lastName", "firstName", "nowDate", "callAcceptHours", "callAcceptMinutes"];
  return requiredIds.reduce((acc, id) => {
    var _document$getElementB2;
    const val = String(((_document$getElementB2 = document.getElementById(id)) === null || _document$getElementB2 === void 0 ? void 0 : _document$getElementB2.value) || "").trim();
    return acc + (val ? 0 : 1);
  }, 0);
}
function computeProgressPercent() {
  const fields = Array.from(document.querySelectorAll("#docxForm input, #docxForm select, #docxForm textarea")).filter(el => {
    if (el.type === "button" || el.id === "" || el.name === "form_mode") return false;
    if (el.closest('[data-form-section="ui_service"]')) return false;
    const group = el.closest(".form-group");
    return !(group && group.hidden);
  });
  if (fields.length === 0) return 0;
  const filled = fields.filter(el => {
    if (el.type === "checkbox" || el.type === "radio") return el.checked;
    return String(el.value || "").trim() !== "";
  }).length;
  return Math.round(filled / fields.length * 100);
}
function renderPreSubmitReview() {
  const box = document.getElementById("preSubmitReview");
  if (!box) return;
  const missing = getRequiredFieldsMissingCount();
  const fullName = ["lastName", "firstName", "middleName"].map(id => {
    var _document$getElementB3;
    return ((_document$getElementB3 = document.getElementById(id)) === null || _document$getElementB3 === void 0 ? void 0 : _document$getElementB3.value) || "";
  }).join(" ").trim();
  box.innerHTML = `
    <label class="form-label">Проверка перед формированием</label>
    <div>Пациент: ${fullName || "не заполнен"}</div>
    <div>Прогресс: ${computeProgressPercent()}%</div>
    <div>Пропущено ключевых полей: ${missing}</div>
    <div>${missing > 0 ? "⚠️ Проверьте обязательные блоки" : "✅ Основные блоки заполнены"}</div>
  `;
}
function updateProgressUi() {
  const progress = document.getElementById("formProgress");
  if (progress) {
    progress.textContent = `Заполнение формы: ${computeProgressPercent()}%. Незаполненных ключевых блоков: ${getRequiredFieldsMissingCount()}.`;
  }
  renderPreSubmitReview();
}
function updateNavigatorState() {
  const activeSections = new Set(getVisibleSectionWrappers().filter(wrapper => !wrapper.classList.contains("is-collapsed")).map(wrapper => wrapper.dataset.formSection).filter(Boolean));
  document.querySelectorAll(".navigator-btn").forEach(btn => {
    btn.classList.toggle("active", !btn.hidden && activeSections.has(btn.dataset.targetSection));
  });
}
function initNavigator() {
  const nav = document.getElementById("formNavigator");
  if (!nav) return;
  nav.innerHTML = "";
  NAVIGATOR_SECTIONS.forEach(([key, label]) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "navigator-btn";
    btn.textContent = label;
    btn.dataset.targetSection = key;
    btn.addEventListener("click", () => {
      const target = document.querySelector(`.section-wrapper[data-form-section="${key}"]`);
      if (!target || target.hidden) return;
      target.classList.remove("is-collapsed");
      target.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
      updateNavigatorState();
    });
    nav.append(btn);
  });
  syncNavigatorVisibility();
  updateNavigatorState();
}
function applyFormMode() {
  const basicKeep = new Set(["brigade", "pstation", "lastName", "firstName", "middleName", "kvPrefix", "kvNumber", "nowDate", "callAcceptHours", "callAcceptMinutes", "arrivalHours", "arrivalMinutes", "deathHours", "deathMinutes", "reverseCauses", "comments", "end_date", "end_h", "end_m"]);
  const basic = currentMode() === "basic";
  document.querySelectorAll("#docxForm .form-group").forEach(group => {
    if (group.closest('[data-form-section="ui_service"]')) return;
    const hasKeyField = Array.from(group.querySelectorAll("input[id], select[id], textarea[id]")).some(el => basicKeep.has(el.id));
    group.classList.toggle("mode-full-only", !hasKeyField);
    group.hidden = basic ? !hasKeyField : false;
  });
  syncSectionVisibility();
  syncNavigatorVisibility();
  updateNavigatorState();
}
function saveDraft() {
  const payload = buildPayload(grids);
  payload.archive_id = window.lastArchiveId || null;
  payload.ui_form_mode = currentMode();
  localStorage.setItem(UX_STORAGE_KEY, JSON.stringify(payload));
}
function restoreDraft() {
  const raw = localStorage.getItem(UX_STORAGE_KEY);
  if (!raw) return;
  try {
    const parsed = JSON.parse(raw);
    loadRawToForm(parsed);
  } catch (_unused) {
    // ignore broken draft
  }
}
function loadRawToForm(raw) {
  loadArchiveToForm({
    id: null,
    kv_num: (raw === null || raw === void 0 ? void 0 : raw.kv_num) || "",
    raw_data: raw || {}
  });
}
function selectedRadioValue(name) {
  var _document$querySelect;
  return ((_document$querySelect = document.querySelector(`input[name="${name}"]:checked`)) === null || _document$querySelect === void 0 ? void 0 : _document$querySelect.value) || "";
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
  var _document$getElementB4, _document$getElementB5, _document$getElementB6;
  const endSuccess = ((_document$getElementB4 = document.getElementById("end_success")) === null || _document$getElementB4 === void 0 ? void 0 : _document$getElementB4.checked) === true;
  setDisplay("endSuccessFieldsBlock", endSuccess);
  document.querySelectorAll(".end-success-field").forEach(el => {
    el.style.display = endSuccess ? "" : "none";
  });
  const showTransferDoc = endSuccess && ((_document$getElementB5 = document.getElementById("end_transfer_doc")) === null || _document$getElementB5 === void 0 ? void 0 : _document$getElementB5.checked) === true;
  const showTransferTeam = endSuccess && ((_document$getElementB6 = document.getElementById("end_transfer_team")) === null || _document$getElementB6 === void 0 ? void 0 : _document$getElementB6.checked) === true;
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
  chPupReact
};
const GRID_INSTANCE_BY_ID = {
  cprManualGrid: cprManual,
  cprAutoGrid: cprAuto,
  ventMaskGrid: ventMask,
  ventAdvancedGrid: ventAdvanced,
  rhythmAsGrid: rhythmAs,
  rhythmVfGrid: rhythmVf,
  rhythmVtGrid: rhythmVt,
  rhythmPeaGrid: rhythmPea,
  rhythmPacedGrid: rhythmPaced,
  rhythmOrgGrid: rhythmOrg,
  rhythmBradyPedGrid: rhythmBradyPed,
  rhythmChildLt60Grid: rhythmChildLt60,
  defibGrid: defibEnergy,
  adrNaclGrid: adrNaclMl,
  amioGluGrid: amioGluMl,
  naclGrid: nacl,
  ch_drugs1_grid: drugs1,
  ch_drugs2_grid: drugs2,
  ch_manipulation1_grid: manipulation1,
  ch_manipulation2_grid: manipulation2,
  ch_pulse_carotid_grid: chPulseCart,
  ch_pupil_reaction_grid: chPupReact
};
function updateAllChronoAccordionStatuses() {
  CHRONO_GRID_ACCORDIONS.forEach(({
    gridId
  }) => {
    const grid = GRID_INSTANCE_BY_ID[gridId];
    if (!grid) return;
    updateChronoAccordionStatus(gridId, grid.getData());
  });
}
function createChronoGridAccordion(item) {
  const section = document.getElementById(item.sectionId);
  const grid = document.getElementById(item.gridId);
  if (!section || !grid || grid.closest(".chrono-grid-accordion")) return null;
  const host = grid.closest(".form-group") || section;
  if (!host || host.closest(".chrono-grid-accordion")) return null;
  const wrapper = document.createElement("div");
  wrapper.className = "chrono-grid-accordion section-wrapper is-collapsed";
  wrapper.dataset.chronoGridId = item.gridId;
  const headerBtn = document.createElement("button");
  headerBtn.type = "button";
  headerBtn.className = "section-header-btn chrono-grid-header";
  headerBtn.setAttribute("aria-expanded", "false");
  const titleEl = document.createElement("span");
  titleEl.className = "chrono-grid-title";
  titleEl.innerHTML = getChronoAccordionTitle(host);
  const statusEl = document.createElement("span");
  statusEl.className = "chrono-grid-status is-empty";
  statusEl.dataset.chronoGridStatus = item.gridId;
  statusEl.innerHTML = EMPTY_STATUS_HTML;
  headerBtn.append(titleEl, statusEl);
  const content = document.createElement("div");
  content.className = "form-section-content chrono-grid-content";
  const firstLabel = Array.from(host.children).find(child => {
    var _child$classList2;
    return (_child$classList2 = child.classList) === null || _child$classList2 === void 0 ? void 0 : _child$classList2.contains("form-label");
  });
  firstLabel === null || firstLabel === void 0 || firstLabel.classList.add("chrono-grid-inner-label");
  host.classList.add("chrono-grid-body");
  host.parentElement.insertBefore(wrapper, host);
  content.append(host);
  wrapper.append(headerBtn, content);
  return wrapper;
}
function initChronoGridAccordions() {
  const wrappers = CHRONO_GRID_ACCORDIONS.map(item => createChronoGridAccordion(item)).filter(Boolean);
  wrappers.forEach(wrapper => {
    var _wrapper$querySelecto3;
    (_wrapper$querySelecto3 = wrapper.querySelector(".chrono-grid-header")) === null || _wrapper$querySelecto3 === void 0 || _wrapper$querySelecto3.addEventListener("click", () => {
      const shouldExpand = wrapper.classList.contains("is-collapsed");
      wrappers.forEach(item => setChronoAccordionExpanded(item, false));
      if (shouldExpand) setChronoAccordionExpanded(wrapper, true);
    });
  });
  document.addEventListener("chrono-grid-datachange", event => {
    var _event$detail, _event$detail2;
    const gridId = (_event$detail = event.detail) === null || _event$detail === void 0 ? void 0 : _event$detail.gridId;
    if (!gridId) return;
    updateChronoAccordionStatus(gridId, (_event$detail2 = event.detail) === null || _event$detail2 === void 0 ? void 0 : _event$detail2.data);
  });
  updateAllChronoAccordionStatuses();
}
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
initSelectOptions("defib_model", DEFIB_MODEL_OPTIONS);
(_document$getElementB7 = document.getElementById("clearMedTherapy")) === null || _document$getElementB7 === void 0 || _document$getElementB7.addEventListener("click", () => {
  document.querySelectorAll('input[name="med_therapy"]').forEach(r => r.checked = false);
  updateMedicationVisibility();
});
(_document$getElementB8 = document.getElementById("clearOtherDrugsBtn")) === null || _document$getElementB8 === void 0 || _document$getElementB8.addEventListener("click", () => {
  setRadioByName("other_drugs", "no");
  updateMedicationVisibility();
});
(_document$getElementB9 = document.getElementById("clearSlrBtn")) === null || _document$getElementB9 === void 0 || _document$getElementB9.addEventListener("click", () => {
  document.querySelectorAll('input[name="slr"]').forEach(r => r.checked = false);
});
(_document$getElementB0 = document.getElementById("clearWitnessBtn")) === null || _document$getElementB0 === void 0 || _document$getElementB0.addEventListener("click", () => {
  document.querySelectorAll('input[name="witness"]').forEach(r => r.checked = false);
});
(_document$getElementB1 = document.getElementById("clearDeathPlaceBtn")) === null || _document$getElementB1 === void 0 || _document$getElementB1.addEventListener("click", () => {
  document.querySelectorAll('input[name="death_place"]').forEach(r => r.checked = false);
});
(_document$getElementB10 = document.getElementById("clearVascularPhaseBtn")) === null || _document$getElementB10 === void 0 || _document$getElementB10.addEventListener("click", () => {
  document.querySelectorAll('input[name="vascular_phase"]').forEach(r => r.checked = false);
});
(_document$getElementB11 = document.getElementById("clearAWhenBtn")) === null || _document$getElementB11 === void 0 || _document$getElementB11.addEventListener("click", () => {
  document.querySelectorAll('input[name="airway_phase"]').forEach(r => r.checked = false);
});
(_document$getElementB12 = document.getElementById("clearIvlBtn")) === null || _document$getElementB12 === void 0 || _document$getElementB12.addEventListener("click", () => {
  document.querySelectorAll('input[name="ivl_alt"]').forEach(r => r.checked = false);
  const fr = document.getElementById("fr_m");
  if (fr) fr.value = "";
});
document.querySelectorAll(".js-clear-section-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const sectionId = btn.dataset.sectionId;
    clearSection(document.getElementById(sectionId));
    toggleSlrStopOtherText();
    updateMedicationVisibility();
    updateEndSectionVisibility();
  });
});
(_document$getElementB13 = document.getElementById("clearRstartBtn")) === null || _document$getElementB13 === void 0 || _document$getElementB13.addEventListener("click", () => {
  const rn = document.getElementById("r_start_nms");
  const rv = document.getElementById("r_start_vent");
  const rd = document.getElementById("r_start_defib");
  if (rn) rn.checked = false;
  if (rv) rv.checked = false;
  if (rd) rd.checked = false;
});
(_document$getElementB14 = document.getElementById("clearOBtn")) === null || _document$getElementB14 === void 0 || _document$getElementB14.addEventListener("click", () => {
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
(_document$getElementB15 = document.getElementById("slr_stop_oth")) === null || _document$getElementB15 === void 0 || _document$getElementB15.addEventListener("change", toggleSlrStopOtherText);
document.querySelectorAll('input[name="med_therapy"]').forEach(el => {
  el.addEventListener("change", updateMedicationVisibility);
});
document.querySelectorAll('input[name="other_drugs"]').forEach(el => {
  el.addEventListener("change", updateMedicationVisibility);
});
(_document$getElementB16 = document.getElementById("end_success")) === null || _document$getElementB16 === void 0 || _document$getElementB16.addEventListener("change", updateEndSectionVisibility);
(_document$getElementB17 = document.getElementById("end_transfer_doc")) === null || _document$getElementB17 === void 0 || _document$getElementB17.addEventListener("change", updateEndSectionVisibility);
(_document$getElementB18 = document.getElementById("end_transfer_team")) === null || _document$getElementB18 === void 0 || _document$getElementB18.addEventListener("change", updateEndSectionVisibility);
toggleSlrStopOtherText();
updateMedicationVisibility();
updateEndSectionVisibility();
applyChronoVisibilityState("no");
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
(_document$getElementB19 = document.getElementById("kvNumber")) === null || _document$getElementB19 === void 0 || _document$getElementB19.addEventListener("input", function () {
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
  if (input2) input2.value = `${yyyy}-${mm}-${dd}`;
  syncKvPrefixOptions();
})();
initPstationSelectOptions();
initUxSections();
initAccordionBehavior();
initChronoGridAccordions();
updateMedicationVisibility();
initNavigator();
setFormMode(DEFAULT_FORM_MODE);
applyFormMode();
restoreDraft();
updateProgressUi();
document.querySelectorAll('input[name="form_mode"]').forEach(el => {
  el.addEventListener("change", () => {
    syncFormModeToggleState();
    applyFormMode();
    updateProgressUi();
  });
});
(_document$getElementB20 = document.getElementById("docxForm")) === null || _document$getElementB20 === void 0 || _document$getElementB20.addEventListener("input", () => {
  saveDraft();
  updateProgressUi();
});
(_document$getElementB21 = document.getElementById("docxForm")) === null || _document$getElementB21 === void 0 || _document$getElementB21.addEventListener("change", () => {
  saveDraft();
  updateProgressUi();
  updateNavigatorState();
});
window.addEventListener("beforeunload", () => {
  saveDraft();
});
function clearForm(options = {}) {
  const preserveDraft = options.preserveDraft === true;
  const preserveMode = options.preserveMode === true;
  initSelectOptions("vd_dev", VD_DEV_OPTIONS);
  initSelectOptions("i_d", IVL_DEVICE_OPTIONS);
  initSelectOptions("defib_model", DEFIB_MODEL_OPTIONS);
  document.getElementById("brigade") && (document.getElementById("brigade").value = "");
  initPstationSelectOptions();
  document.getElementById("pstation") && (document.getElementById("pstation").value = "");
  document.getElementById("lastName") && (document.getElementById("lastName").value = "");
  document.getElementById("firstName") && (document.getElementById("firstName").value = "");
  document.getElementById("middleName") && (document.getElementById("middleName").value = "");
  syncKvPrefixOptions();
  document.getElementById("kvNumber") && (document.getElementById("kvNumber").value = "");
  document.getElementById("arrivalHours") && (document.getElementById("arrivalHours").value = "");
  document.getElementById("arrivalMinutes") && (document.getElementById("arrivalMinutes").value = "");
  document.getElementById("callAcceptHours") && (document.getElementById("callAcceptHours").value = "");
  document.getElementById("callAcceptMinutes") && (document.getElementById("callAcceptMinutes").value = "");
  document.getElementById("deathHours") && (document.getElementById("deathHours").value = "");
  document.getElementById("deathMinutes") && (document.getElementById("deathMinutes").value = "");
  ["bio_d_h", "bio_d_m", "br_ruk_last", "br_ruk_first", "br_ruk_middle", "ver_ruk_last", "ver_ruk_first", "ver_ruk_middle"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });
  document.querySelectorAll('#docxForm input[type="radio"]').forEach(r => r.checked = false);
  document.querySelectorAll('input[type="checkbox"]').forEach(c => c.checked = false);
  document.querySelectorAll('input[name="airway_phase"]').forEach(r => r.checked = false);
  ["a1t", "a2t", "a3t", "a4t", "a5t", "et_num", "et_try", "vd_dev"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });
  ["a1_result", "a2_result", "a3_result", "a4_result", "a5_result"].forEach(name => {
    document.querySelectorAll(`input[name="${name}"]`).forEach(r => r.checked = false);
  });
  document.querySelectorAll('input[name="vascular_phase"]').forEach(r => r.checked = false);
  ["v1t", "v2t", "v3t", "v4t", "v1try", "v2try", "v3try", "v4try", "v_point"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });
  ["v1_result", "v2_result", "v3_result", "v4_result"].forEach(name => {
    document.querySelectorAll(`input[name="${name}"]`).forEach(r => r.checked = false);
  });
  document.querySelectorAll('input[name="ivl_alt"]').forEach(r => r.checked = false);
  const fr = document.getElementById("fr_m");
  if (fr) fr.value = "";
  ["i_d", "i_m", "i_fr", "i_t", "vd_note"].forEach(id => {
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
  document.querySelectorAll('input[name="end_resp"]').forEach(el => {
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
  setRadioByName("other_drugs", "no");
  toggleSlrStopOtherText();
  updateMedicationVisibility();
  updateEndSectionVisibility();
  applyChronoVisibilityState("no");
  window.lastArchiveId = null;
  (function resetDefaultDates() {
    const input = document.getElementById("nowDate");
    const input2 = document.getElementById("end_date");
    if (!input) return;
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    input.value = `${yyyy}-${mm}-${dd}`;
    if (input2) input2.value = `${yyyy}-${mm}-${dd}`;
    syncKvPrefixOptions();
  })();
  if (!preserveMode) setFormMode(DEFAULT_FORM_MODE);
  applyFormMode();
  updateNavigatorState();
  updateProgressUi();
  if (!preserveDraft) localStorage.removeItem(UX_STORAGE_KEY);
  setGenerateStatus({
    status: "Форма очищена.",
    archiveId: null,
    version: null,
    renderStatus: "—"
  });
}
(_document$getElementB22 = document.getElementById("clearBtn")) === null || _document$getElementB22 === void 0 || _document$getElementB22.addEventListener("click", clearForm);

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
  const exists = Array.from(el.options || []).some(opt => opt.value === text);
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
  document.querySelectorAll(`input[name="${name}"]`).forEach(radio => {
    radio.checked = radio.value === value;
  });
}
function splitFio(fio) {
  const parts = String(fio || "").trim().split(/\s+/).filter(Boolean);
  return {
    last: parts[0] || "",
    first: parts[1] || "",
    middle: parts.slice(2).join(" ")
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
  return parseKvNum(kvNum).tail;
}
function loadArchiveToForm(archive) {
  const raw = archive !== null && archive !== void 0 && archive.raw_data && typeof archive.raw_data === "object" ? archive.raw_data : {};
  clearForm({
    preserveDraft: true,
    preserveMode: true
  });
  setFormMode(raw.ui_form_mode || DEFAULT_FORM_MODE);
  setInputValue("brigade", raw.brig);
  ensureSelectOption("pstation", raw.ps);
  const fio = splitFio(raw.fio_pac);
  setInputValue("lastName", raw.last_name_raw || fio.last);
  setInputValue("firstName", raw.first_name_raw || fio.first);
  setInputValue("middleName", raw.middle_name_raw || fio.middle);
  const prDateIso = raw.pr_date_iso_raw || parseIsoDate(raw.pr_date);
  const kvSource = raw.kv_num || (archive === null || archive === void 0 ? void 0 : archive.kv_num) || "";
  setInputValue("nowDate", prDateIso);
  syncKvPrefixOptions(raw.kv_prefix_raw || parseKvNum(kvSource).prefix);
  setInputValue("kvNumber", raw.kv_num_tail_raw || applyTailFromKv(kvSource));
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
  setRadioByName("airway_phase", raw.a_v === "☑" ? "during" : raw.a_d === "☑" ? "before" : "");
  setRadioByName("vascular_phase", raw.v_v === "☑" ? "during" : raw.v_d === "☑" ? "before" : "");
  setRadioByName("ivl_alt", raw.t_3 === "☑" ? "3" : raw.t_15 === "☑" ? "15" : raw.t_30 === "☑" ? "30" : "");
  const hasOtherDrugData = String(raw.ch_drugs1 || "").trim() !== "" || String(raw.ch_drugs2 || "").trim() !== "" || arrayOrEmpty(raw.ch_drugs1_marks).some(v => String(v || "").trim() !== "") || arrayOrEmpty(raw.ch_drugs2_marks).some(v => String(v || "").trim() !== "");
  setRadioByName("med_therapy", raw.med_t_y === "☑" ? "yes" : raw.med_t_n === "☑" ? "no" : hasOtherDrugData ? "yes" : "");
  setRadioByName("other_drugs", raw.other_drugs || (hasOtherDrugData ? "yes" : "no"));
  setRadioByName("end_resp", raw.end_resp || (raw.end_resp_spont === "☑" ? "spont" : raw.end_resp_ivl === "☑" ? "ivl" : ""));
  setCheckboxValue("r_start_nms", raw.r_start_nms === "☑");
  setCheckboxValue("r_start_vent", raw.r_start_vent === "☑");
  setCheckboxValue("r_start_defib", raw.r_start_defib === "☑");
  setCheckboxValue("o_air", raw.o_air === "☑");
  setCheckboxValue("o_o2", raw.o_o2 === "☑");
  ["a1t", "a2t", "a3t", "a4t", "a5t", "et_num", "et_try", "v1t", "v2t", "v3t", "v4t", "v1try", "v2try", "v3try", "v4try", "v_point", "fr_m", "i_m", "i_fr", "i_t", "vd_note", "slr_h", "slr_m", "fr_gr", "ch_adr_nacl_sum", "ch_amio_glu_sum", "ch_nacl", "ch_drugs1", "ch_drugs2", "ch_manipulation1", "ch_manipulation2", "reverseCauses", "postResuscitationTherapy", "comments", "end_h", "end_m", "end_ecg_rhythm", "end_hr", "end_conclusion", "end_gcs", "end_rr", "end_bp", "end_pulse", "end_spo2", "end_transfer_doc_fio", "end_transfer_doc_h", "end_transfer_doc_m", "end_transfer_team_num", "end_transfer_team_h", "end_transfer_team_m", "slr_stop_oth_txt", "br_ruk_last", "br_ruk_first", "br_ruk_middle", "ver_ruk_last", "ver_ruk_first", "ver_ruk_middle"].forEach(id => {
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
      ver_ruk_middle: "ver_ruk_middle_raw"
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
  applyChronoVisibilityState(raw.show_chrono || "");
  applyFormMode();
  updateProgressUi();
  updateNavigatorState();
  window.lastArchiveId = archive.id;
  clearKvError();
  const restoredFromDraft = archive.id == null;
  setGenerateStatus({
    status: restoredFromDraft ? "Черновик формы восстановлен." : `Загружена карта #${archive.id} по kv_num ${archive.kv_num}.`,
    archiveId: archive.id,
    version: null,
    renderStatus: restoredFromDraft ? "восстановлено из черновика" : "загружено из архива"
  });
}
async function trySuggestLoadByKv() {
  var _document$getElementB23;
  const kvInput = document.getElementById("kvNumber");
  const tail = typeof (kvInput === null || kvInput === void 0 ? void 0 : kvInput.value) === "string" ? kvInput.value.trim() : "";
  if (!tail) return;
  const prefix = ((_document$getElementB23 = document.getElementById("kvPrefix")) === null || _document$getElementB23 === void 0 ? void 0 : _document$getElementB23.value) || "";
  if (!prefix) return;
  const fullKvNum = `${prefix}-${tail}`;
  try {
    const resp = await fetch(`/api/archive/by-kv?kv_num=${encodeURIComponent(fullKvNum)}`);
    if (resp.status === 404) return;
    let data = null;
    try {
      data = await resp.json();
    } catch (_unused2) {
      data = null;
    }
    if (!resp.ok) {
      var _data;
      setGenerateStatus({
        status: `Ошибка поиска карты: ${((_data = data) === null || _data === void 0 ? void 0 : _data.error) || `HTTP ${resp.status}`}`,
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
  } catch (_unused3) {
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
const generateStatusBlockEl = document.getElementById("generateStatusBlock");
function setGenerateStatus({
  status,
  archiveId,
  version,
  renderStatus,
  state = "neutral",
  details = []
}) {
  if (generateStatusBlockEl) {
    generateStatusBlockEl.classList.remove("status-error", "status-pending", "status-success", "status-neutral");
    generateStatusBlockEl.classList.add(`status-${state}`);
  }
  if (genStatusEl && typeof status === "string") {
    genStatusEl.style.whiteSpace = "pre-line";
    genStatusEl.innerHTML = "";
    const title = document.createElement("strong");
    title.className = "generate-status-title";
    title.textContent = state === "error" ? "Ошибка" : state === "success" ? "Готово" : state === "pending" ? "Формирование выполняется" : "Статус";
    const body = document.createElement("div");
    body.textContent = status;
    genStatusEl.append(title, body);
    if (state === "error" && Array.isArray(details) && details.length > 0) {
      const list = document.createElement("ul");
      list.className = "generate-status-details";
      details.forEach(item => {
        const li = document.createElement("li");
        const path = (item === null || item === void 0 ? void 0 : item.path) || (item === null || item === void 0 ? void 0 : item.field) || "поле";
        const message = (item === null || item === void 0 ? void 0 : item.message) || (item === null || item === void 0 ? void 0 : item.error) || "некорректное значение";
        li.textContent = `${path}: ${message}`;
        list.appendChild(li);
      });
      genStatusEl.appendChild(list);
    }
  }
  const hasRenderMeta = renderStatus && renderStatus !== "—";
  const showMeta = state !== "error" || archiveId != null || version != null || hasRenderMeta;
  [genArchiveIdEl, genVersionEl, genRenderStatusEl].forEach(el => {
    if (el) el.hidden = !showMeta;
  });
  if (showMeta) {
    if (genArchiveIdEl) genArchiveIdEl.textContent = `Архив: ${archiveId !== null && archiveId !== void 0 ? archiveId : "—"}`;
    if (genVersionEl) genVersionEl.textContent = `Версия: ${version !== null && version !== void 0 ? version : "—"}`;
    if (genRenderStatusEl) genRenderStatusEl.textContent = `DOCX/PDF: ${renderStatus || "—"}`;
  }
}
function formatErrorDetails(details) {
  if (!Array.isArray(details) || details.length === 0) return "";
  const lines = details.map(item => {
    if (item && typeof item === "object") {
      const path = item.path || item.field || "поле";
      const message = item.message || item.error || "некорректное значение";
      return `- ${path}: ${message}`;
    }
    return `- ${String(item)}`;
  });
  return lines.join("\n");
}
function getFriendlyGenerateErrorMessage(errorCode, httpStatus) {
  if (errorCode === "validation_error") {
    return "Проверьте заполнение формы. Некоторые поля содержат некорректные значения.";
  }
  if (errorCode === "kv_num_exists") {
    return "Карта с таким kv_num уже существует. Загрузите существующую карту или измените номер.";
  }
  if (errorCode === "internal_error") {
    return "Не удалось сохранить форму из-за внутренней ошибки сервера. Попробуйте еще раз позже.";
  }
  if (errorCode === "archive_not_found") {
    return "Архивная запись не найдена. Обновите страницу и попробуйте снова.";
  }
  if (errorCode === "invalid_archive_id") {
    return "Некорректный идентификатор архивной записи. Обновите страницу и попробуйте снова.";
  }
  if (errorCode === "kv_num_required_for_render") {
    return "Для формирования документа нужно заполнить номер карты вызова (kv_num).";
  }
  return `Ошибка сервера: HTTP ${httpStatus}`;
}
function formatGenerateError(resp, data) {
  const errorCode = data === null || data === void 0 ? void 0 : data.error;
  const message = (data === null || data === void 0 ? void 0 : data.message) || getFriendlyGenerateErrorMessage(errorCode, resp.status);
  const detailsText = formatErrorDetails(data === null || data === void 0 ? void 0 : data.details);
  return detailsText ? `${message}\nДетали:\n${detailsText}` : message;
}
function getKvField() {
  return document.getElementById("kvNumber") || document.querySelector('input[name="kv_num"]');
}
const VALIDATION_FIELD_MAP = {
  kv_num: "kvNumber",
  pr_date: "nowDate",
  pr_date_iso_raw: "nowDate",
  end_date: "end_date",
  end_date_iso_raw: "end_date"
};
function resolveFieldForValidationPath(path) {
  const key = String(path || "").replace(/\[.*$/, "");
  const mapped = VALIDATION_FIELD_MAP[key] || key;
  return document.getElementById(mapped) || document.querySelector(`[name="${mapped}"]`);
}
function clearFieldValidationError(field) {
  if (!field) return;
  field.classList.remove("field-invalid");
  field.classList.remove("error");
  field.removeAttribute("aria-invalid");
  const group = field.closest(".form-group") || field.parentElement;
  const message = group === null || group === void 0 ? void 0 : group.querySelector(`.field-error-message[data-error-for="${field.id || field.name}"]`);
  message === null || message === void 0 || message.remove();
}
function clearValidationErrors() {
  document.querySelectorAll(".field-invalid, .input-field.error").forEach(field => {
    clearFieldValidationError(field);
  });
  document.querySelectorAll(".field-error-message").forEach(message => message.remove());
}
function showValidationErrors(details) {
  if (!Array.isArray(details) || details.length === 0) return;
  let firstField = null;
  details.forEach(item => {
    const field = resolveFieldForValidationPath((item === null || item === void 0 ? void 0 : item.path) || (item === null || item === void 0 ? void 0 : item.field));
    if (!field) return;
    if (!firstField) firstField = field;
    clearFieldValidationError(field);
    field.classList.add("field-invalid");
    field.classList.add("error");
    field.setAttribute("aria-invalid", "true");
    const group = field.closest(".form-group") || field.parentElement;
    const message = document.createElement("div");
    message.className = "field-error-message";
    message.dataset.errorFor = field.id || field.name || "";
    message.textContent = (item === null || item === void 0 ? void 0 : item.message) || (item === null || item === void 0 ? void 0 : item.error) || "Некорректное значение";
    group === null || group === void 0 || group.appendChild(message);
  });
  if (firstField) {
    firstField.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });
    firstField.focus({
      preventScroll: true
    });
  }
}
function clearKvError() {
  const kvField = getKvField();
  if (kvField) clearFieldValidationError(kvField);
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
    } catch (_unused4) {
      data = null;
    }
    if (!resp.ok) {
      const errText = formatGenerateError(resp, data);
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
      isRenderPending = false;
      setApplyButtonDisabled(isGenerateInFlight);
      setGenerateStatus({
        status: "Сохранено. Версия ещё не создана.",
        archiveId,
        version: null,
        renderStatus: "версия ещё не создана"
      });
      return;
    }
    isRenderPending = isRenderStillPending(latestRender);
    setApplyButtonDisabled(isGenerateInFlight || isRenderPending);
    const renderFailed = latestRender.docx_status === "failed" || latestRender.pdf_status === "failed";
    setGenerateStatus({
      status: `Архив #${archiveId}: статус версии обновлён.`,
      archiveId,
      version: latestRender.version,
      renderStatus: `${latestRender.docx_status}/${latestRender.pdf_status}`,
      state: latestRender.docx_status === "ready" && latestRender.pdf_status === "ready" ? "success" : renderFailed ? "error" : "pending"
    });
  } catch (_unused5) {
    setGenerateStatus({
      status: "Ошибка сети/сервер недоступен",
      archiveId,
      version: null,
      renderStatus: "—"
    });
  }
}
let isGenerateInFlight = false;
let isRenderPending = false;
function setApplyButtonDisabled(disabled) {
  const applyBtn = document.getElementById("applyBtn");
  if (applyBtn) applyBtn.disabled = disabled;
}
function isRenderStillPending(render) {
  return (render === null || render === void 0 ? void 0 : render.docx_status) === "pending" || (render === null || render === void 0 ? void 0 : render.pdf_status) === "pending";
}
function unlockGenerateAfterFormChange() {
  if (!isRenderPending || isGenerateInFlight) return;
  isRenderPending = false;
  setApplyButtonDisabled(false);
  setGenerateStatus({
    status: "Данные изменены. Для формирования новой версии нажмите «Сформировать».",
    archiveId: window.lastArchiveId || null,
    version: null,
    renderStatus: "—",
    state: "neutral"
  });
}
async function runGenerate() {
  if (isGenerateInFlight) return;
  isGenerateInFlight = true;
  setApplyButtonDisabled(true);
  clearValidationErrors();
  clearKvError();
  const payload = buildPayload(grids);
  payload.archive_id = window.lastArchiveId || null;
  try {
    var _data$archive_id, _data9, _data0, _data1, _data10, _data11, _data$version3, _data12;
    const resp = await fetch("/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
    let data = null;
    try {
      data = await resp.json();
    } catch (_unused6) {
      data = null;
    }
    if (!resp.ok) {
      var _data2, _data3, _data5, _data6, _data7, _data8;
      const errText = formatGenerateError(resp, data);
      if (resp.status === 409 && ((_data2 = data) === null || _data2 === void 0 ? void 0 : _data2.error) === "kv_num_exists") {
        highlightKvError();
        setGenerateStatus({
          status: errText,
          archiveId: window.lastArchiveId || null,
          version: null,
          renderStatus: "—",
          state: "error"
        });
        await trySuggestLoadByKv();
        return;
      }
      if (((_data3 = data) === null || _data3 === void 0 ? void 0 : _data3.error) === "validation_error") {
        var _data4;
        showValidationErrors((_data4 = data) === null || _data4 === void 0 ? void 0 : _data4.details);
      }
      setGenerateStatus({
        status: ((_data5 = data) === null || _data5 === void 0 ? void 0 : _data5.error) === "validation_error" ? ((_data6 = data) === null || _data6 === void 0 ? void 0 : _data6.message) || getFriendlyGenerateErrorMessage((_data7 = data) === null || _data7 === void 0 ? void 0 : _data7.error, resp.status) : `Ошибка: ${errText}`,
        archiveId: window.lastArchiveId || null,
        version: null,
        renderStatus: "—",
        state: "error",
        details: (_data8 = data) === null || _data8 === void 0 ? void 0 : _data8.details
      });
      return;
    }
    const archiveId = (_data$archive_id = (_data9 = data) === null || _data9 === void 0 ? void 0 : _data9.archive_id) !== null && _data$archive_id !== void 0 ? _data$archive_id : null;
    window.lastArchiveId = archiveId;
    if ((_data0 = data) !== null && _data0 !== void 0 && _data0.already_pending) {
      var _data$version;
      isRenderPending = true;
      setGenerateStatus({
        status: "Формирование уже выполняется. Дождитесь завершения текущей версии.",
        archiveId,
        version: (_data$version = data.version) !== null && _data$version !== void 0 ? _data$version : null,
        renderStatus: "pending",
        state: "pending"
      });
      await refreshArchiveStatus(archiveId);
      return;
    }
    if (((_data1 = data) === null || _data1 === void 0 ? void 0 : _data1.message) === "queued") {
      var _data$version2;
      isRenderPending = true;
      setGenerateStatus({
        status: `Сохранено. Поставлено в очередь на формирование. Архив #${archiveId}, версия ${data.version}. Статус: pending.`,
        archiveId,
        version: (_data$version2 = data.version) !== null && _data$version2 !== void 0 ? _data$version2 : null,
        renderStatus: "pending/pending",
        state: "pending"
      });
      await refreshArchiveStatus(archiveId);
      return;
    }
    if (((_data10 = data) === null || _data10 === void 0 ? void 0 : _data10.message) === "saved_no_kv_num") {
      setGenerateStatus({
        status: `Сохранено как черновик (архив #${archiveId}). Заполните номер карты вызова (kv_num), затем снова нажмите «Сформировать».`,
        archiveId,
        version: null,
        renderStatus: "версия не создана",
        state: "error"
      });
      highlightKvError();
      return;
    }
    if ((_data11 = data) !== null && _data11 !== void 0 && _data11.error) {
      setGenerateStatus({
        status: formatGenerateError({
          status: 200
        }, data),
        archiveId,
        version: null,
        renderStatus: "—",
        state: "error"
      });
      return;
    }
    setGenerateStatus({
      status: "Получен неожиданный ответ сервера.",
      archiveId,
      version: (_data$version3 = (_data12 = data) === null || _data12 === void 0 ? void 0 : _data12.version) !== null && _data$version3 !== void 0 ? _data$version3 : null,
      renderStatus: "—",
      state: "error"
    });
  } catch (_unused7) {
    setGenerateStatus({
      status: "Ошибка сети/сервер недоступен",
      archiveId: null,
      version: null,
      renderStatus: "—",
      state: "error"
    });
  } finally {
    isGenerateInFlight = false;
    setApplyButtonDisabled(isRenderPending);
  }
}
(_document$getElementB24 = document.getElementById("applyBtn")) === null || _document$getElementB24 === void 0 || _document$getElementB24.addEventListener("click", runGenerate);
(_document$getElementB25 = document.getElementById("docxForm")) === null || _document$getElementB25 === void 0 || _document$getElementB25.addEventListener("submit", event => {
  event.preventDefault();
  runGenerate();
});
(_document$getElementB26 = document.getElementById("refreshStatusBtn")) === null || _document$getElementB26 === void 0 || _document$getElementB26.addEventListener("click", async () => {
  await refreshArchiveStatus(window.lastArchiveId);
});
document.querySelectorAll("input, select, textarea").forEach(field => {
  field.addEventListener("input", () => {
    clearFieldValidationError(field);
    unlockGenerateAfterFormChange();
  });
  field.addEventListener("change", () => {
    clearFieldValidationError(field);
    unlockGenerateAfterFormChange();
  });
});
(_getKvField = getKvField()) === null || _getKvField === void 0 || _getKvField.addEventListener("input", clearKvError);
(_document$getElementB27 = document.getElementById("kvNumber")) === null || _document$getElementB27 === void 0 || _document$getElementB27.addEventListener("blur", trySuggestLoadByKv);
(_document$getElementB28 = document.getElementById("kvPrefix")) === null || _document$getElementB28 === void 0 || _document$getElementB28.addEventListener("blur", trySuggestLoadByKv);
(_document$getElementB29 = document.getElementById("nowDate")) === null || _document$getElementB29 === void 0 ? void 0 : _document$getElementB29.addEventListener("change", () => {
  var _document$getElementB30;
  const previousPrefix = ((_document$getElementB30 = document.getElementById("kvPrefix")) === null || _document$getElementB30 === void 0 ? void 0 : _document$getElementB30.value) || "";
  const previousCode = previousPrefix.split("-")[0] || "";
  const year = getCallYearFromDateInput();
  const preferredPrefix = previousCode ? formatKvPrefix(previousCode, year) : "";
  syncKvPrefixOptions(preferredPrefix);
});
//# sourceMappingURL=form-init.js.map