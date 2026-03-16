const CHECKED = "☑";
const UNCHECKED = "☐";
function normalizeTimePart(value, max) {
  const digits = String(value || "").replace(/\D/g, "");
  if (!digits) return "";
  const num = Number(digits);
  if (!Number.isFinite(num) || num < 0 || num > max) return "";
  return String(num).padStart(2, "0");
}
function normalizeMlInput(value) {
  const text = String(value || "").trim();
  if (!text) return "";
  const normalized = text.replace(/\s+/g, "").replace(",", ".");
  if (!/^\d+(?:\.\d+)?$/.test(normalized)) return "";
  return normalized.replace(".", ",");
}
export function formatDateForDocx(iso) {
  if (!iso) return "";
  const [yyyy, mm, dd] = iso.split("-");
  if (!yyyy || !mm || !dd) return "";
  return `${dd}.${mm}.${yyyy}`;
}
export function marksFromResult(name) {
  var _document$querySelect;
  const chosen = ((_document$querySelect = document.querySelector(`input[name="${name}"]:checked`)) === null || _document$querySelect === void 0 ? void 0 : _document$querySelect.value) || "";
  return {
    s: chosen === "s" ? CHECKED : UNCHECKED,
    f: chosen === "f" ? CHECKED : UNCHECKED
  };
}
export function buildPayload(grids) {
  var _document$getElementB, _document$getElementB2, _document$getElementB3, _document$getElementB4, _document$getElementB5, _document$getElementB6, _document$getElementB7, _document$getElementB8, _document$getElementB9, _document$getElementB0, _document$getElementB1, _document$getElementB10, _document$getElementB11, _document$getElementB12, _document$getElementB13, _document$getElementB14, _document$getElementB15, _document$getElementB16, _document$getElementB17, _document$getElementB18, _document$getElementB19, _document$getElementB20, _document$getElementB21, _document$getElementB22, _document$getElementB23, _document$querySelect2, _document$getElementB24, _document$getElementB25, _document$getElementB26, _document$getElementB27, _document$getElementB28, _document$getElementB29, _document$getElementB30, _document$querySelect3, _document$getElementB31, _document$getElementB32, _document$getElementB33, _document$getElementB34, _document$getElementB35, _document$getElementB36, _document$getElementB37, _document$getElementB38, _document$getElementB39, _document$querySelect4, _document$getElementB40, _document$getElementB41, _document$getElementB42, _document$getElementB43, _document$getElementB44, _document$getElementB45, _document$getElementB46, _document$getElementB47, _document$getElementB48, _document$getElementB49, _document$getElementB50, _document$getElementB51, _document$getElementB52, _document$getElementB53, _document$getElementB54, _document$getElementB55, _document$getElementB56, _document$querySelect5, _document$getElementB57, _document$getElementB58, _document$getElementB59, _document$getElementB60, _document$querySelect6, _document$getElementB61, _document$getElementB62, _document$getElementB63, _document$getElementB64, _document$getElementB65, _document$getElementB66, _document$getElementB67, _document$querySelect7, _document$getElementB68, _document$getElementB69, _document$getElementB70, _document$getElementB71, _document$getElementB72, _document$getElementB73, _document$getElementB74, _document$getElementB75, _document$getElementB76, _document$getElementB77, _document$getElementB78, _document$getElementB79, _document$getElementB80, _document$getElementB81, _document$getElementB82, _document$getElementB83, _document$getElementB84, _document$getElementB85, _document$getElementB86, _document$getElementB87, _document$getElementB88, _document$getElementB89, _document$getElementB90;
  const brigade = ((_document$getElementB = document.getElementById("brigade")) === null || _document$getElementB === void 0 ? void 0 : _document$getElementB.value) || "";
  const pstation = ((_document$getElementB2 = document.getElementById("pstation")) === null || _document$getElementB2 === void 0 ? void 0 : _document$getElementB2.value) || "";
  const lastName = ((_document$getElementB3 = document.getElementById("lastName")) === null || _document$getElementB3 === void 0 ? void 0 : _document$getElementB3.value) || "";
  const firstName = ((_document$getElementB4 = document.getElementById("firstName")) === null || _document$getElementB4 === void 0 ? void 0 : _document$getElementB4.value) || "";
  const middleName = ((_document$getElementB5 = document.getElementById("middleName")) === null || _document$getElementB5 === void 0 ? void 0 : _document$getElementB5.value) || "";
  const kvNumber = ((_document$getElementB6 = document.getElementById("kvNumber")) === null || _document$getElementB6 === void 0 ? void 0 : _document$getElementB6.value) || "";
  const kvPrefixSelectValue = ((_document$getElementB7 = document.getElementById("kvPrefix")) === null || _document$getElementB7 === void 0 ? void 0 : _document$getElementB7.value) || "";
  const fio_pac = [lastName, firstName, middleName].map(s => s.trim()).filter(Boolean).join(" ");
  const pr_m_raw = ((_document$getElementB8 = document.getElementById("arrivalMinutes")) === null || _document$getElementB8 === void 0 ? void 0 : _document$getElementB8.value) || "";
  const d_m_raw = ((_document$getElementB9 = document.getElementById("deathMinutes")) === null || _document$getElementB9 === void 0 ? void 0 : _document$getElementB9.value) || "";
  const bio_d_h_raw = ((_document$getElementB0 = document.getElementById("bio_d_h")) === null || _document$getElementB0 === void 0 ? void 0 : _document$getElementB0.value) || "";
  const bio_d_m_raw = ((_document$getElementB1 = document.getElementById("bio_d_m")) === null || _document$getElementB1 === void 0 ? void 0 : _document$getElementB1.value) || "";
  const pr_time_h = normalizeTimePart((_document$getElementB10 = document.getElementById("callAcceptHours")) === null || _document$getElementB10 === void 0 ? void 0 : _document$getElementB10.value, 23);
  const pr_time_m = normalizeTimePart((_document$getElementB11 = document.getElementById("callAcceptMinutes")) === null || _document$getElementB11 === void 0 ? void 0 : _document$getElementB11.value, 59);
  const pr_h = ((_document$getElementB12 = document.getElementById("arrivalHours")) === null || _document$getElementB12 === void 0 ? void 0 : _document$getElementB12.value) || "";
  const pr_m = pr_m_raw === "" ? "" : String(pr_m_raw).padStart(2, "0");
  const d_h = ((_document$getElementB13 = document.getElementById("deathHours")) === null || _document$getElementB13 === void 0 ? void 0 : _document$getElementB13.value) || "";
  const d_m = d_m_raw === "" ? "" : String(d_m_raw).padStart(2, "0");
  const bio_d_h = bio_d_h_raw === "" ? "" : String(bio_d_h_raw).padStart(2, "0");
  const bio_d_m = bio_d_m_raw === "" ? "" : String(bio_d_m_raw).padStart(2, "0");
  const br_ruk_last = ((_document$getElementB14 = document.getElementById("br_ruk_last")) === null || _document$getElementB14 === void 0 ? void 0 : _document$getElementB14.value) || "";
  const br_ruk_first = ((_document$getElementB15 = document.getElementById("br_ruk_first")) === null || _document$getElementB15 === void 0 ? void 0 : _document$getElementB15.value) || "";
  const br_ruk_middle = ((_document$getElementB16 = document.getElementById("br_ruk_middle")) === null || _document$getElementB16 === void 0 ? void 0 : _document$getElementB16.value) || "";
  const br_ruk = [br_ruk_last, br_ruk_first, br_ruk_middle].map(s => s.trim()).filter(Boolean).join(" ");
  const ver_ruk_last = ((_document$getElementB17 = document.getElementById("ver_ruk_last")) === null || _document$getElementB17 === void 0 ? void 0 : _document$getElementB17.value) || "";
  const ver_ruk_first = ((_document$getElementB18 = document.getElementById("ver_ruk_first")) === null || _document$getElementB18 === void 0 ? void 0 : _document$getElementB18.value) || "";
  const ver_ruk_middle = ((_document$getElementB19 = document.getElementById("ver_ruk_middle")) === null || _document$getElementB19 === void 0 ? void 0 : _document$getElementB19.value) || "";
  const ver_ruk = [ver_ruk_last, ver_ruk_first, ver_ruk_middle].map(s => s.trim()).filter(Boolean).join(" ");
  const pr_date_iso = ((_document$getElementB20 = document.getElementById("nowDate")) === null || _document$getElementB20 === void 0 ? void 0 : _document$getElementB20.value) || "";
  const pr_date = formatDateForDocx(pr_date_iso);
  let witnessValue = "";
  const selectedWitness = document.querySelector('input[name="witness"]:checked');
  if (selectedWitness) witnessValue = selectedWitness.value;
  let deathPlaceValue = "";
  const selectedDeathPlace = document.querySelector('input[name="death_place"]:checked');
  if (selectedDeathPlace) deathPlaceValue = selectedDeathPlace.value;
  let slr_value = "";
  const selectedCpr = document.querySelector('input[name="slr"]:checked');
  if (selectedCpr) slr_value = selectedCpr.value;
  const r_start_nms = (_document$getElementB21 = document.getElementById("r_start_nms")) !== null && _document$getElementB21 !== void 0 && _document$getElementB21.checked ? CHECKED : UNCHECKED;
  const r_start_vent = (_document$getElementB22 = document.getElementById("r_start_vent")) !== null && _document$getElementB22 !== void 0 && _document$getElementB22.checked ? CHECKED : UNCHECKED;
  const r_start_defib = (_document$getElementB23 = document.getElementById("r_start_defib")) !== null && _document$getElementB23 !== void 0 && _document$getElementB23.checked ? CHECKED : UNCHECKED;
  const airwayPhase = ((_document$querySelect2 = document.querySelector('input[name="airway_phase"]:checked')) === null || _document$querySelect2 === void 0 ? void 0 : _document$querySelect2.value) || "";
  const a_v = airwayPhase === "during" ? CHECKED : UNCHECKED;
  const a_d = airwayPhase === "before" ? CHECKED : UNCHECKED;
  const a1 = marksFromResult("a1_result");
  const a2 = marksFromResult("a2_result");
  const a3 = marksFromResult("a3_result");
  const a4 = marksFromResult("a4_result");
  const a5 = marksFromResult("a5_result");
  const a1t = ((_document$getElementB24 = document.getElementById("a1t")) === null || _document$getElementB24 === void 0 ? void 0 : _document$getElementB24.value) || "";
  const a2t = ((_document$getElementB25 = document.getElementById("a2t")) === null || _document$getElementB25 === void 0 ? void 0 : _document$getElementB25.value) || "";
  const a3t = ((_document$getElementB26 = document.getElementById("a3t")) === null || _document$getElementB26 === void 0 ? void 0 : _document$getElementB26.value) || "";
  const a4t = ((_document$getElementB27 = document.getElementById("a4t")) === null || _document$getElementB27 === void 0 ? void 0 : _document$getElementB27.value) || "";
  const a5t = ((_document$getElementB28 = document.getElementById("a5t")) === null || _document$getElementB28 === void 0 ? void 0 : _document$getElementB28.value) || "";
  const et_num = ((_document$getElementB29 = document.getElementById("et_num")) === null || _document$getElementB29 === void 0 ? void 0 : _document$getElementB29.value) || "";
  const et_try = ((_document$getElementB30 = document.getElementById("et_try")) === null || _document$getElementB30 === void 0 ? void 0 : _document$getElementB30.value) || "";
  const vascularPhase = ((_document$querySelect3 = document.querySelector('input[name="vascular_phase"]:checked')) === null || _document$querySelect3 === void 0 ? void 0 : _document$querySelect3.value) || "";
  const v_v = vascularPhase === "during" ? CHECKED : UNCHECKED;
  const v_d = vascularPhase === "before" ? CHECKED : UNCHECKED;
  const v1 = marksFromResult("v1_result");
  const v2 = marksFromResult("v2_result");
  const v3 = marksFromResult("v3_result");
  const v4 = marksFromResult("v4_result");
  const v1t = ((_document$getElementB31 = document.getElementById("v1t")) === null || _document$getElementB31 === void 0 ? void 0 : _document$getElementB31.value) || "";
  const v2t = ((_document$getElementB32 = document.getElementById("v2t")) === null || _document$getElementB32 === void 0 ? void 0 : _document$getElementB32.value) || "";
  const v3t = ((_document$getElementB33 = document.getElementById("v3t")) === null || _document$getElementB33 === void 0 ? void 0 : _document$getElementB33.value) || "";
  const v4t = ((_document$getElementB34 = document.getElementById("v4t")) === null || _document$getElementB34 === void 0 ? void 0 : _document$getElementB34.value) || "";
  const v1try = ((_document$getElementB35 = document.getElementById("v1try")) === null || _document$getElementB35 === void 0 ? void 0 : _document$getElementB35.value) || "";
  const v2try = ((_document$getElementB36 = document.getElementById("v2try")) === null || _document$getElementB36 === void 0 ? void 0 : _document$getElementB36.value) || "";
  const v3try = ((_document$getElementB37 = document.getElementById("v3try")) === null || _document$getElementB37 === void 0 ? void 0 : _document$getElementB37.value) || "";
  const v4try = ((_document$getElementB38 = document.getElementById("v4try")) === null || _document$getElementB38 === void 0 ? void 0 : _document$getElementB38.value) || "";
  const v_point = ((_document$getElementB39 = document.getElementById("v_point")) === null || _document$getElementB39 === void 0 ? void 0 : _document$getElementB39.value) || "";
  const ivlAlt = ((_document$querySelect4 = document.querySelector('input[name="ivl_alt"]:checked')) === null || _document$querySelect4 === void 0 ? void 0 : _document$querySelect4.value) || "";
  const t_3 = ivlAlt === "3" ? CHECKED : UNCHECKED;
  const t_15 = ivlAlt === "15" ? CHECKED : UNCHECKED;
  const t_30 = ivlAlt === "30" ? CHECKED : UNCHECKED;
  const fr_m = ((_document$getElementB40 = document.getElementById("fr_m")) === null || _document$getElementB40 === void 0 ? void 0 : _document$getElementB40.value) || "";
  const o_air = (_document$getElementB41 = document.getElementById("o_air")) !== null && _document$getElementB41 !== void 0 && _document$getElementB41.checked ? CHECKED : UNCHECKED;
  const o_o2 = (_document$getElementB42 = document.getElementById("o_o2")) !== null && _document$getElementB42 !== void 0 && _document$getElementB42.checked ? CHECKED : UNCHECKED;
  const i_d = ((_document$getElementB43 = document.getElementById("i_d")) === null || _document$getElementB43 === void 0 ? void 0 : _document$getElementB43.value) || "";
  const i_m = ((_document$getElementB44 = document.getElementById("i_m")) === null || _document$getElementB44 === void 0 ? void 0 : _document$getElementB44.value) || "";
  const i_fr = ((_document$getElementB45 = document.getElementById("i_fr")) === null || _document$getElementB45 === void 0 ? void 0 : _document$getElementB45.value) || "";
  const i_t = ((_document$getElementB46 = document.getElementById("i_t")) === null || _document$getElementB46 === void 0 ? void 0 : _document$getElementB46.value) || "";
  const vd_dev = ((_document$getElementB47 = document.getElementById("vd_dev")) === null || _document$getElementB47 === void 0 ? void 0 : _document$getElementB47.value) || "";
  const vd_note = ((_document$getElementB48 = document.getElementById("vd_note")) === null || _document$getElementB48 === void 0 ? void 0 : _document$getElementB48.value) || "";
  const slr_s1 = (_document$getElementB49 = document.getElementById("slr_stop_1")) !== null && _document$getElementB49 !== void 0 && _document$getElementB49.checked ? CHECKED : UNCHECKED;
  const slr_s2 = (_document$getElementB50 = document.getElementById("slr_stop_2")) !== null && _document$getElementB50 !== void 0 && _document$getElementB50.checked ? CHECKED : UNCHECKED;
  const slr_bel = (_document$getElementB51 = document.getElementById("slr_stop_bel")) !== null && _document$getElementB51 !== void 0 && _document$getElementB51.checked ? CHECKED : UNCHECKED;
  const slr_gip = (_document$getElementB52 = document.getElementById("slr_stop_gip")) !== null && _document$getElementB52 !== void 0 && _document$getElementB52.checked ? CHECKED : UNCHECKED;
  const slr_oth = (_document$getElementB53 = document.getElementById("slr_stop_oth")) !== null && _document$getElementB53 !== void 0 && _document$getElementB53.checked ? CHECKED : UNCHECKED;
  const slr_oth_txt = slr_oth === CHECKED ? ((_document$getElementB54 = document.getElementById("slr_stop_oth_txt")) === null || _document$getElementB54 === void 0 ? void 0 : _document$getElementB54.value) || "" : "";
  const slr_s5 = (_document$getElementB55 = document.getElementById("slr_stop_5")) !== null && _document$getElementB55 !== void 0 && _document$getElementB55.checked ? CHECKED : UNCHECKED;
  const slr_s6 = (_document$getElementB56 = document.getElementById("slr_stop_6")) !== null && _document$getElementB56 !== void 0 && _document$getElementB56.checked ? CHECKED : UNCHECKED;
  let medTherapyControl = "";
  const selectedMedTherapyControl = document.querySelector('input[name="med_therapy"]:checked');
  if (selectedMedTherapyControl) medTherapyControl = selectedMedTherapyControl.value;
  const otherDrugs = ((_document$querySelect5 = document.querySelector('input[name="other_drugs"]:checked')) === null || _document$querySelect5 === void 0 ? void 0 : _document$querySelect5.value) || "";
  const med_t_y = medTherapyControl === "yes" ? CHECKED : UNCHECKED;
  const med_t_n = medTherapyControl === "no" ? CHECKED : UNCHECKED;
  const defib_model = ((_document$getElementB57 = document.getElementById("defib_model")) === null || _document$getElementB57 === void 0 ? void 0 : _document$getElementB57.value) || "";
  const reversible_causes_4g4t = ((_document$getElementB58 = document.getElementById("reverseCauses")) === null || _document$getElementB58 === void 0 ? void 0 : _document$getElementB58.value) || "";
  const post_resuscitation_therapy = ((_document$getElementB59 = document.getElementById("postResuscitationTherapy")) === null || _document$getElementB59 === void 0 ? void 0 : _document$getElementB59.value) || "";
  const comments = ((_document$getElementB60 = document.getElementById("comments")) === null || _document$getElementB60 === void 0 ? void 0 : _document$getElementB60.value) || "";
  const selectedEndResp = ((_document$querySelect6 = document.querySelector('input[name="end_resp"]:checked')) === null || _document$querySelect6 === void 0 ? void 0 : _document$querySelect6.value) || "";
  const end_resp_spont = selectedEndResp === "spont" ? CHECKED : UNCHECKED;
  const end_resp_ivl = selectedEndResp === "ivl" ? CHECKED : UNCHECKED;
  const end_h = normalizeTimePart((_document$getElementB61 = document.getElementById("end_h")) === null || _document$getElementB61 === void 0 ? void 0 : _document$getElementB61.value, 23);
  const end_m = normalizeTimePart((_document$getElementB62 = document.getElementById("end_m")) === null || _document$getElementB62 === void 0 ? void 0 : _document$getElementB62.value, 59);
  const end_transfer_doc_h = normalizeTimePart((_document$getElementB63 = document.getElementById("end_transfer_doc_h")) === null || _document$getElementB63 === void 0 ? void 0 : _document$getElementB63.value, 23);
  const end_transfer_doc_m = normalizeTimePart((_document$getElementB64 = document.getElementById("end_transfer_doc_m")) === null || _document$getElementB64 === void 0 ? void 0 : _document$getElementB64.value, 59);
  const end_transfer_team_h = normalizeTimePart((_document$getElementB65 = document.getElementById("end_transfer_team_h")) === null || _document$getElementB65 === void 0 ? void 0 : _document$getElementB65.value, 23);
  const end_transfer_team_m = normalizeTimePart((_document$getElementB66 = document.getElementById("end_transfer_team_m")) === null || _document$getElementB66 === void 0 ? void 0 : _document$getElementB66.value, 59);
  const end_date_iso = ((_document$getElementB67 = document.getElementById("end_date")) === null || _document$getElementB67 === void 0 ? void 0 : _document$getElementB67.value) || "";
  const end_date = formatDateForDocx(end_date_iso);
  const show_chrono = ((_document$querySelect7 = document.querySelector('input[name="show_chrono"]:checked')) === null || _document$querySelect7 === void 0 ? void 0 : _document$querySelect7.value) || "no";
  const last_name_raw = lastName;
  const first_name_raw = firstName;
  const middle_name_raw = middleName;
  const kv_num_tail_raw = kvNumber;
  const kv_prefix_raw = kvPrefixSelectValue;
  const fallbackYearSuffix = /^\d{4}-\d{2}-\d{2}$/.test(pr_date_iso) ? pr_date_iso.slice(2, 4) : String(new Date().getFullYear()).slice(-2);
  const kvPrefix = kvPrefixSelectValue || `100-${fallbackYearSuffix}`;
  const kvTail = String(kvNumber || "").trim();
  const kv_num = kvTail && kvPrefix ? `${kvPrefix}-${kvTail}` : "";
  const pr_date_iso_raw = pr_date_iso;
  const end_date_iso_raw = end_date_iso;
  const br_ruk_last_raw = br_ruk_last;
  const br_ruk_first_raw = br_ruk_first;
  const br_ruk_middle_raw = br_ruk_middle;
  const ver_ruk_last_raw = ver_ruk_last;
  const ver_ruk_first_raw = ver_ruk_first;
  const ver_ruk_middle_raw = ver_ruk_middle;
  return {
    brig: brigade,
    ps: pstation,
    fio_pac,
    last_name_raw,
    first_name_raw,
    middle_name_raw,
    kv_num_tail_raw,
    kv_prefix_raw,
    kv_num,
    pr_date,
    pr_date_iso_raw,
    pr_time_h,
    pr_time_m,
    pr_h,
    pr_m,
    d_h,
    d_m,
    witness: witnessValue,
    death_place: deathPlaceValue,
    slr: slr_value,
    r_start_nms,
    r_start_vent,
    r_start_defib,
    a_v,
    a_d,
    a1t,
    a1s: a1.s,
    a1f: a1.f,
    a2t,
    a2s: a2.s,
    a2f: a2.f,
    a3t,
    a3s: a3.s,
    a3f: a3.f,
    et_num,
    et_try,
    a4t,
    a4s: a4.s,
    a4f: a4.f,
    a5t,
    a5s: a5.s,
    a5f: a5.f,
    v_v,
    v_d,
    v1t,
    v1s: v1.s,
    v1f: v1.f,
    v1try,
    v2t,
    v2s: v2.s,
    v2f: v2.f,
    v2try,
    v3t,
    v3s: v3.s,
    v3f: v3.f,
    v3try,
    v4t,
    v4s: v4.s,
    v4f: v4.f,
    v4try,
    v_point,
    t_3,
    t_15,
    t_30,
    fr_m,
    o_air,
    o_o2,
    i_d,
    i_m,
    i_fr,
    i_t,
    vd_dev,
    vd_note,
    ch_cpr_m: grids.cprManual.getData(),
    slr_h: ((_document$getElementB68 = document.getElementById("slr_h")) === null || _document$getElementB68 === void 0 ? void 0 : _document$getElementB68.value) || "",
    slr_m: ((_document$getElementB69 = document.getElementById("slr_m")) === null || _document$getElementB69 === void 0 ? void 0 : _document$getElementB69.value) || "",
    fr_gr: ((_document$getElementB70 = document.getElementById("fr_gr")) === null || _document$getElementB70 === void 0 ? void 0 : _document$getElementB70.value) || "",
    ch_cpr_a_marks: grids.cprAuto.getData(),
    ch_cpr_a: "Арка",
    ch_vent_m_marks: grids.ventMask.getData(),
    ch_vent_a_marks: grids.ventAdvanced.getData(),
    ch_rhythm_as_marks: grids.rhythmAs.getData(),
    ch_rhythm_vf_marks: grids.rhythmVf.getData(),
    ch_rhythm_vt_marks: grids.rhythmVt.getData(),
    ch_rhythm_pea_marks: grids.rhythmPea.getData(),
    ch_rhythm_paced_marks: grids.rhythmPaced.getData(),
    ch_rhythm_organized_marks: grids.rhythmOrg.getData(),
    ch_rhythm_brady_ped_marks: grids.rhythmBradyPed.getData(),
    ch_rhythm_child_lt60_marks: grids.rhythmChildLt60.getData(),
    ch_defib_j_marks: grids.defibEnergy.getData(),
    defib_model,
    med_t_n,
    med_t_y,
    other_drugs: otherDrugs,
    ch_adr_nacl_ml_marks: grids.adrNaclMl.getData(),
    ch_adr_nacl_sum: normalizeMlInput((_document$getElementB71 = document.getElementById("ch_adr_nacl_sum")) === null || _document$getElementB71 === void 0 ? void 0 : _document$getElementB71.value),
    ch_amio_glu_ml_marks: grids.amioGluMl.getData(),
    ch_amio_glu_sum: normalizeMlInput((_document$getElementB72 = document.getElementById("ch_amio_glu_sum")) === null || _document$getElementB72 === void 0 ? void 0 : _document$getElementB72.value),
    ch_nacl_marks: grids.nacl.getData(),
    ch_nacl: ((_document$getElementB73 = document.getElementById("ch_nacl")) === null || _document$getElementB73 === void 0 ? void 0 : _document$getElementB73.value) || "",
    ch_drugs1_marks: grids.drugs1.getData(),
    ch_drugs1: ((_document$getElementB74 = document.getElementById("ch_drugs1")) === null || _document$getElementB74 === void 0 ? void 0 : _document$getElementB74.value) || "",
    ch_drugs2_marks: grids.drugs2.getData(),
    ch_drugs2: ((_document$getElementB75 = document.getElementById("ch_drugs2")) === null || _document$getElementB75 === void 0 ? void 0 : _document$getElementB75.value) || "",
    ch_manipulation1_marks: grids.manipulation1.getData(),
    ch_manipulation1: ((_document$getElementB76 = document.getElementById("ch_manipulation1")) === null || _document$getElementB76 === void 0 ? void 0 : _document$getElementB76.value) || "",
    ch_manipulation2_marks: grids.manipulation2.getData(),
    ch_manipulation2: ((_document$getElementB77 = document.getElementById("ch_manipulation2")) === null || _document$getElementB77 === void 0 ? void 0 : _document$getElementB77.value) || "",
    ch_pulse_carotid_marks: grids.chPulseCart.getData(),
    ch_pupil_reaction_marks: grids.chPupReact.getData(),
    reversible_causes_4g4t,
    post_resuscitation_therapy,
    comments,
    end_date,
    end_date_iso_raw,
    show_chrono,
    end_h,
    end_m,
    end_success_mark: (_document$getElementB78 = document.getElementById("end_success")) !== null && _document$getElementB78 !== void 0 && _document$getElementB78.checked ? CHECKED : UNCHECKED,
    end_ecg_rhythm: ((_document$getElementB79 = document.getElementById("end_ecg_rhythm")) === null || _document$getElementB79 === void 0 ? void 0 : _document$getElementB79.value) || "",
    end_hr: ((_document$getElementB80 = document.getElementById("end_hr")) === null || _document$getElementB80 === void 0 ? void 0 : _document$getElementB80.value) || "",
    end_conclusion: ((_document$getElementB81 = document.getElementById("end_conclusion")) === null || _document$getElementB81 === void 0 ? void 0 : _document$getElementB81.value) || "",
    end_gcs: ((_document$getElementB82 = document.getElementById("end_gcs")) === null || _document$getElementB82 === void 0 ? void 0 : _document$getElementB82.value) || "",
    end_resp: selectedEndResp,
    end_resp_spont,
    end_resp_ivl,
    end_rr: ((_document$getElementB83 = document.getElementById("end_rr")) === null || _document$getElementB83 === void 0 ? void 0 : _document$getElementB83.value) || "",
    end_bp: ((_document$getElementB84 = document.getElementById("end_bp")) === null || _document$getElementB84 === void 0 ? void 0 : _document$getElementB84.value) || "",
    end_pulse: ((_document$getElementB85 = document.getElementById("end_pulse")) === null || _document$getElementB85 === void 0 ? void 0 : _document$getElementB85.value) || "",
    end_spo2: ((_document$getElementB86 = document.getElementById("end_spo2")) === null || _document$getElementB86 === void 0 ? void 0 : _document$getElementB86.value) || "",
    end_transfer_doc_mark: (_document$getElementB87 = document.getElementById("end_transfer_doc")) !== null && _document$getElementB87 !== void 0 && _document$getElementB87.checked ? CHECKED : UNCHECKED,
    end_transfer_doc_fio: ((_document$getElementB88 = document.getElementById("end_transfer_doc_fio")) === null || _document$getElementB88 === void 0 ? void 0 : _document$getElementB88.value) || "",
    end_transfer_doc_h,
    end_transfer_doc_m,
    end_transfer_team_mark: (_document$getElementB89 = document.getElementById("end_transfer_team")) !== null && _document$getElementB89 !== void 0 && _document$getElementB89.checked ? CHECKED : UNCHECKED,
    end_transfer_team_num: ((_document$getElementB90 = document.getElementById("end_transfer_team_num")) === null || _document$getElementB90 === void 0 ? void 0 : _document$getElementB90.value) || "",
    end_transfer_team_h,
    end_transfer_team_m,
    slr_s1,
    slr_s2,
    slr_bel,
    slr_gip,
    slr_oth,
    slr_oth_txt,
    slr_s5,
    slr_s6,
    bio_d_h,
    bio_d_m,
    br_ruk,
    ver_ruk,
    br_ruk_last_raw,
    br_ruk_first_raw,
    br_ruk_middle_raw,
    ver_ruk_last_raw,
    ver_ruk_first_raw,
    ver_ruk_middle_raw
  };
}
//# sourceMappingURL=form-payload.js.map