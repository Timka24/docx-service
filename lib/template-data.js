const {
  MINUTES,
  pad2,
  normalizeRow70,
  normalizeMl70,
  normalizeDefibEnergy70
} = require("./normalize");
const { normalizeDateToIso } = require("./date-utils");

function buildTemplateData(body) {
  const {
    brig = "",
    ps = "",
    fio_pac = "",
    kv_num = "",
    pr_date = "",
    pr_time_h = "",
    pr_time_m = "",
    pr_h = "",
    pr_m = "",
    d_h = "",
    d_m = "",
    witness = "",
    death_place = "",
    slr = "",
    r_start_nms = "",
    r_start_vent = "",
    r_start_defib = "",
    a_v = "",
    a_d = "",
    a1t = "",
    a1s = "",
    a1f = "",
    a2t = "",
    a2s = "",
    a2f = "",
    a3t = "",
    a3s = "",
    a3f = "",
    et_num = "",
    et_try = "",
    a4t = "",
    a4s = "",
    a4f = "",
    a5t = "",
    a5s = "",
    a5f = "",
    v_v = "",
    v_d = "",
    v1t = "",
    v1s = "",
    v1f = "",
    v1try = "",
    v2t = "",
    v2s = "",
    v2f = "",
    v2try = "",
    v3t = "",
    v3s = "",
    v3f = "",
    v3try = "",
    v4t = "",
    v4s = "",
    v4f = "",
    v4try = "",
    v_point = "",
    t_3 = "",
    t_15 = "",
    t_30 = "",
    fr_m = "",
    o_air = "",
    o_o2 = "",
    i_d = "",
    i_m = "",
    i_fr = "",
    i_t = "",
    vd_dev = "",
    vd_note = "",
    ch_cpr_m = null,
    slr_h = "",
    slr_m = "",
    fr_gr = "",
    ch_cpr_a = "",
    ch_cpr_a_marks = null,
    ch_vent_m_marks = null,
    ch_vent_a_marks = null,
    ch_rhythm_as_marks = null,
    ch_rhythm_vf_marks = null,
    ch_rhythm_vt_marks = null,
    ch_rhythm_pea_marks = null,
    ch_rhythm_paced_marks = null,
    ch_rhythm_organized_marks = null,
    ch_rhythm_brady_ped_marks = null,
    ch_rhythm_child_lt60_marks = null,
    ch_defib_j_marks = null,
    defib_model = "",
    med_t_n = "",
    med_t_y = "",
    other_drugs = "",
    ch_adr_nacl_ml_marks = null,
    ch_adr_nacl_sum = "",
    ch_amio_glu_ml_marks = null,
    ch_amio_glu_sum = "",
    ch_nacl = "",
    ch_nacl_marks = null,
    ch_drugs1 = "",
    ch_drugs1_marks = null,
    ch_drugs2 = "",
    ch_drugs2_marks = null,
    ch_manipulation1 = "",
    ch_manipulation1_marks = null,
    ch_manipulation2 = "",
    ch_manipulation2_marks = null,
    ch_pulse_carotid_marks = null,
    ch_pupil_reaction_marks = null,
    reversible_causes_4g4t = "",
    post_resuscitation_therapy = "",
    comments = "",
    end_date = "",
    end_h = "",
    end_m = "",
    end_success_mark = "",
    end_ecg_rhythm = "",
    end_hr = "",
    end_conclusion = "",
    end_gcs = "",
    end_resp = "",
    end_resp_spont = "",
    end_resp_ivl = "",
    end_rr = "",
    end_bp = "",
    end_pulse = "",
    end_spo2 = "",
    end_transfer_doc_mark = "",
    end_transfer_doc_fio = "",
    end_transfer_doc_h = "",
    end_transfer_doc_m = "",
    end_transfer_team_mark = "",
    end_transfer_team_num = "",
    end_transfer_team_h = "",
    end_transfer_team_m = "",
    slr_s1 = "",
    slr_s2 = "",
    slr_bel = "",
    slr_gip = "",
    slr_oth = "",
    slr_oth_txt = "",
    slr_s5 = "",
    slr_s6 = "",
    bio_d_h = "",
    bio_d_m = "",
    br_ruk = "",
    ver_ruk = "",
  } = body || {};

  const CHECKED = "☑";
  const UNCHECKED = "☐";
  const normalizeMultiline = (value) => String(value || "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const normalizeTimePart = (value, max) => {
    const digits = String(value || "").replace(/\D/g, "");
    if (!digits) return "";
    const num = Number(digits);
    if (!Number.isFinite(num) || num < 0 || num > max) return "";
    return String(num).padStart(2, "0");
  };
  const normalizeClockTime = (value) => {
    const raw = String(value || "").trim();
    if (!raw) return "";
    const match = raw.match(/^(\d{1,2}):(\d{1,2})$/);
    if (!match) return "";
    const hours = Number(match[1]);
    const minutes = Number(match[2]);
    if (!Number.isInteger(hours) || !Number.isInteger(minutes)) return "";
    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return "";
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  };
  const toText = (value) => {
    if (value === null || value === undefined) return "";
    if (typeof value === "string") return value;
    if (typeof value === "number" || typeof value === "boolean") return String(value);
    return "";
  };
  const normalizeMlSummary = (value) => {
    const raw = toText(value).trim();
    if (!raw) return "";
    const normalized = raw.replace(/\s+/g, "").replace(",", ".");
    if (!/^\d+(?:\.\d+)?$/.test(normalized)) return "";
    return normalized.replace(".", ",");
  };

  const wit_cb = witness === "witness" ? CHECKED : UNCHECKED;
  const bri_cb = witness === "brigade" ? CHECKED : UNCHECKED;
  const no_cb = witness === "none" ? CHECKED : UNCHECKED;
  const d_lo = death_place === "location" ? CHECKED : UNCHECKED;
  const d_ev = death_place === "evac" ? CHECKED : UNCHECKED;

  const slr_none = slr === "none" ? CHECKED : UNCHECKED;
  const slr_comp = slr === "compress" ? CHECKED : UNCHECKED;
  const slr_comp_ivl = slr === "comp_ivl" ? CHECKED : UNCHECKED;
  const slr_and = slr === "and" ? CHECKED : UNCHECKED;

  const normalized_end_h = normalizeTimePart(end_h, 23);
  const normalized_end_m = normalizeTimePart(end_m, 59);
  const normalized_pr_time_h = normalizeTimePart(pr_time_h, 23);
  const normalized_pr_time_m = normalizeTimePart(pr_time_m, 59);
  const pr_time = normalized_pr_time_h !== "" || normalized_pr_time_m !== ""
    ? `${normalized_pr_time_h || "00"}:${normalized_pr_time_m || "00"}`
    : "";
  const normalized_bio_d_h = normalizeTimePart(bio_d_h, 23);
  const normalized_bio_d_m = normalizeTimePart(bio_d_m, 59);
  const normalized_end_transfer_doc_h = normalizeTimePart(end_transfer_doc_h, 23);
  const normalized_end_transfer_doc_m = normalizeTimePart(end_transfer_doc_m, 59);
  const normalized_end_transfer_team_h = normalizeTimePart(end_transfer_team_h, 23);
  const normalized_end_transfer_team_m = normalizeTimePart(end_transfer_team_m, 59);

  const normalized_end_success_mark = end_success_mark === CHECKED ? CHECKED : UNCHECKED;
  const normalized_end_transfer_doc_mark = end_transfer_doc_mark === CHECKED ? CHECKED : UNCHECKED;
  const normalized_end_transfer_team_mark = end_transfer_team_mark === CHECKED ? CHECKED : UNCHECKED;

  const normalized_slr_s1 = slr_s1 === CHECKED ? CHECKED : UNCHECKED;
  const normalized_slr_s2 = slr_s2 === CHECKED ? CHECKED : UNCHECKED;
  const normalized_slr_bel = slr_bel === CHECKED ? CHECKED : UNCHECKED;
  const normalized_slr_gip = slr_gip === CHECKED ? CHECKED : UNCHECKED;
  const normalized_slr_oth = slr_oth === CHECKED ? CHECKED : UNCHECKED;
  const normalized_slr_oth_txt = normalized_slr_oth === CHECKED ? toText(slr_oth_txt) : "";
  const normalized_slr_s5 = slr_s5 === CHECKED ? CHECKED : UNCHECKED;
  const normalized_slr_s6 = slr_s6 === CHECKED ? CHECKED : UNCHECKED;

  const normalized_end_resp_spont = end_resp === "spont" ? CHECKED : (end_resp_spont === CHECKED ? CHECKED : UNCHECKED);
  const normalized_end_resp_ivl = end_resp === "ivl" ? CHECKED : (end_resp_ivl === CHECKED ? CHECKED : UNCHECKED);
  
  const normalized_pr_date_iso = normalizeDateToIso(pr_date);

  const chDefibJRow = normalizeDefibEnergy70(ch_defib_j_marks);
  const chrono_defib_j = {};
  for (let i = 1; i <= MINUTES; i++) {
    chrono_defib_j[`ch_defib_j_${pad2(i)}`] = chDefibJRow[i - 1];
  }

  const chCprMRow = normalizeRow70(ch_cpr_m);
  const chCprARow = normalizeRow70(ch_cpr_a_marks);
  const chVentARow = normalizeRow70(ch_vent_a_marks);
  const chVentMRow = normalizeRow70(ch_vent_m_marks);
  const chRhyAsRow = normalizeRow70(ch_rhythm_as_marks);
  const chRhyVfRow = normalizeRow70(ch_rhythm_vf_marks);
  const chRhyVtRow = normalizeRow70(ch_rhythm_vt_marks);
  const chRhyPeaRow = normalizeRow70(ch_rhythm_pea_marks);
  const chRhyPacedRow = normalizeRow70(ch_rhythm_paced_marks);
  const chRhyOrgRow = normalizeRow70(ch_rhythm_organized_marks);
  const chRhyPedRow = normalizeRow70(ch_rhythm_brady_ped_marks);
  const chRhyChildRow = normalizeRow70(ch_rhythm_child_lt60_marks);
  const chNaclRow = normalizeRow70(ch_nacl_marks);
  const chDrugs1Row = normalizeRow70(ch_drugs1_marks);
  const chDrugs2Row = normalizeRow70(ch_drugs2_marks);
  const chManip1Row = normalizeRow70(ch_manipulation1_marks);
  const chManip2Row = normalizeRow70(ch_manipulation2_marks);
  const chPulseRow = normalizeRow70(ch_pulse_carotid_marks);
  const chPupRow = normalizeRow70(ch_pupil_reaction_marks);

  const chrono_cpr_manual = {};
  for (let i = 1; i <= MINUTES; i++) {
    chrono_cpr_manual[`ch_cpr_m_${pad2(i)}`] = chCprMRow[i - 1];
  }
  const chrono_cpr_auto = {};
  for (let i = 1; i <= MINUTES; i++) {
    chrono_cpr_auto[`ch_cpr_a_${pad2(i)}`] = chCprARow[i - 1];
  }
  const chrono_vent_auto = {};
  for (let i = 1; i <= MINUTES; i++) {
    chrono_vent_auto[`ch_vent_a_${pad2(i)}`] = chVentARow[i - 1];
  }
  const chrono_vent_manual = {};
  for (let i = 1; i <= MINUTES; i++) {
    chrono_vent_manual[`ch_vent_m_${pad2(i)}`] = chVentMRow[i - 1];
  }
  const chrono_rhytms_as = {};
  for (let i = 1; i <= MINUTES; i++) {
    chrono_rhytms_as[`ch_rhythm_as_${pad2(i)}`] = chRhyAsRow[i - 1];
  }
  const chrono_rhytms_vf = {};
  for (let i = 1; i <= MINUTES; i++) {
    chrono_rhytms_vf[`ch_rhythm_vf_${pad2(i)}`] = chRhyVfRow[i - 1];
  }
  const chrono_rhythms_vt = {};
  for (let i = 1; i <= MINUTES; i++) {
    chrono_rhythms_vt[`ch_rhythm_vt_${pad2(i)}`] = chRhyVtRow[i - 1];
  }
  const chrono_rhythms_pea = {};
  for (let i = 1; i <= MINUTES; i++) {
    chrono_rhythms_pea[`ch_rhythm_pea_${pad2(i)}`] = chRhyPeaRow[i - 1];
  }
  const chrono_rhythms_paced = {};
  for (let i = 1; i <= MINUTES; i++) {
    chrono_rhythms_paced[`ch_rhythm_paced_${pad2(i)}`] = chRhyPacedRow[i - 1];
  }
  const chrono_rhythms_org = {};
  for (let i = 1; i <= MINUTES; i++) {
    chrono_rhythms_org[`ch_rhythm_organized_${pad2(i)}`] = chRhyOrgRow[i - 1];
  }
  const chrono_rhythms_ped = {};
  for (let i = 1; i <= MINUTES; i++) {
    chrono_rhythms_ped[`ch_rhythm_brady_ped_${pad2(i)}`] = chRhyPedRow[i - 1];
  }
  const chrono_rhythms_child = {};
  for (let i = 1; i <= MINUTES; i++) {
    chrono_rhythms_child[`ch_rhythm_child_lt60_${pad2(i)}`] = chRhyChildRow[i - 1];
  }
  const chrono_nacl = {};
  for (let i = 1; i <= MINUTES; i++) {
    chrono_nacl[`ch_nacl_${pad2(i)}`] = chNaclRow[i - 1];
  }
  const chrono_drugs1 = {};
  for (let i = 1; i <= MINUTES; i++) {
    chrono_drugs1[`ch_drugs1_${pad2(i)}`] = chDrugs1Row[i - 1];
  }
   const chrono_drugs2 = {};
  for (let i = 1; i <= MINUTES; i++) {
    chrono_drugs2[`ch_drugs2_${pad2(i)}`] = chDrugs2Row[i - 1];
  }
  const chrono_manipulation1 = {};
  for (let i = 1; i <= MINUTES; i++) {
    chrono_manipulation1[`ch_manipulation1_${pad2(i)}`] = chManip1Row[i - 1];
  }
  const chrono_manipulation2 = {};
  for (let i = 1; i <= MINUTES; i++) {
    chrono_manipulation2[`ch_manipulation2_${pad2(i)}`] = chManip2Row[i - 1];
  }
  const chrono_pulse_carotid = {};
  for (let i = 1; i <= MINUTES; i++) {
    chrono_pulse_carotid[`ch_pulse_carotid_${pad2(i)}`] = chPulseRow[i - 1];
  }
  const chrono_pupil_reaction = {};
  for (let i = 1; i <= MINUTES; i++) {
    chrono_pupil_reaction[`ch_pupil_reaction_${pad2(i)}`] = chPupRow[i - 1];
  }

  const chAdrNaclRow = normalizeMl70(ch_adr_nacl_ml_marks);
  const chAmioGluRow = normalizeMl70(ch_amio_glu_ml_marks);

  const chrono_adr_nacl_ml = {};
  for (let i = 1; i <= MINUTES; i++) {
    chrono_adr_nacl_ml[`ch_adr_nacl_ml_${pad2(i)}`] = chAdrNaclRow[i - 1];
  }
  const chrono_amio_glu_ml = {};
  for (let i = 1; i <= MINUTES; i++) {
    chrono_amio_glu_ml[`ch_amio_glu_ml_${pad2(i)}`] = chAmioGluRow[i - 1];
  }
  return {
    brig,
    ps,
    fio_pac,
    kv_num,
    pr_date,
    pr_time,
    pr_date_iso: normalized_pr_date_iso,
    pr_h,
    pr_m,
    d_h,
    d_m,
    wit_cb,
    bri_cb,
    no_cb,
    d_lo,
    d_ev,
    slr_none,
    slr_comp,
    slr_comp_ivl,
    slr_and,
    r_start_nms,
    r_start_vent,
    r_start_defib,
    a_v,
    a_d,
    a1t,
    a1s,
    a1f,
    a2t,
    a2s,
    a2f,
    a3t,
    a3s,
    a3f,
    et_num,
    et_try,
    a4t,
    a4s,
    a4f,
    a5t,
    a5s,
    a5f,
    v_v,
    v_d,
    v1t,
    v1s,
    v1f,
    v1try,
    v2t,
    v2s,
    v2f,
    v2try,
    v3t,
    v3s,
    v3f,
    v3try,
    v4t,
    v4s,
    v4f,
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
    i_t: normalizeClockTime(i_t),
    vd_dev: toText(vd_dev),
    vd_note: normalizeMultiline(vd_note),
    ch_cpr_m: chCprMRow,
    ...chrono_cpr_manual,
    slr_h,
    slr_m,
    fr_gr,
    ch_cpr_a: toText(ch_cpr_a),
    ch_cpr_a_marks: chCprARow,
    ...chrono_cpr_auto,
    ch_vent_m: chVentMRow,
    ...chrono_vent_manual,
    ch_vent_a: chVentARow,
    ...chrono_vent_auto,
    ch_rhythm_as: chRhyAsRow,
    ...chrono_rhytms_as,
    ch_rhythm_vf: chRhyVfRow,
    ...chrono_rhytms_vf,
    ch_rhythm_vt: chRhyVtRow,
    ...chrono_rhythms_vt,
    ch_rhythm_pea: chRhyPeaRow,
    ...chrono_rhythms_pea,
    ch_rhythm_paced: chRhyPacedRow,
    ...chrono_rhythms_paced,
    ch_rhythm_org: chRhyOrgRow,
    ...chrono_rhythms_org,
    ch_rhythm_ped: chRhyPedRow,
    ...chrono_rhythms_ped,
    ch_rhythm_child: chRhyChildRow,
    ...chrono_rhythms_child,
    ch_defib_j_marks: chDefibJRow,
    ...chrono_defib_j,
    defib_model: toText(defib_model),
    med_t_n,
    med_t_y,
    ch_adr_nacl_ml_marks: chAdrNaclRow,
    ...chrono_adr_nacl_ml,
    ch_adr_nacl_sum: normalizeMlSummary(ch_adr_nacl_sum),
    ch_amio_glu_ml_marks: chAmioGluRow,
    ...chrono_amio_glu_ml,
    ch_amio_glu_sum: normalizeMlSummary(ch_amio_glu_sum),
    ch_nacl,
    ch_nacl_marks: chNaclRow,
    ...chrono_nacl,
      ch_drugs1,
    ch_drugs1_marks: chDrugs1Row,
    ...chrono_drugs1,
     ch_drugs2,
    ch_drugs2_marks: chDrugs2Row,
    ...chrono_drugs2,
    ch_manipulation1,
    ch_manipulation1_marks: chManip1Row,
    ...chrono_manipulation1,
    ch_manipulation2,
    ch_manipulation2_marks: chManip2Row,
    ...chrono_manipulation2,
    ch_pulse_carotid_marks: chPulseRow,
    ...chrono_pulse_carotid,
    ch_pupil_reaction_marks: chPupRow,
    ...chrono_pupil_reaction,
    reversible_causes_4g4t: normalizeMultiline(reversible_causes_4g4t),
    post_resuscitation_therapy: normalizeMultiline(post_resuscitation_therapy),
    comments: normalizeMultiline(comments),
    end_date: toText(end_date),
    end_h: normalized_end_h,
    end_m: normalized_end_m,
    end_success_mark: normalized_end_success_mark,
    end_ecg_rhythm: toText(end_ecg_rhythm),
    end_hr: toText(end_hr),
    end_conclusion: toText(end_conclusion),
    end_gcs: toText(end_gcs),
    end_resp_spont: normalized_end_resp_spont,
    end_resp_ivl: normalized_end_resp_ivl,
    end_rr: toText(end_rr),
    end_bp: toText(end_bp),
    end_pulse: toText(end_pulse),
    end_spo2: toText(end_spo2),
    end_transfer_doc_mark: normalized_end_transfer_doc_mark,
    end_transfer_doc_fio: toText(end_transfer_doc_fio),
    end_transfer_doc_h: normalized_end_transfer_doc_h,
    end_transfer_doc_m: normalized_end_transfer_doc_m,
    end_transfer_team_mark: normalized_end_transfer_team_mark,
    end_transfer_team_num: toText(end_transfer_team_num),
    end_transfer_team_h: normalized_end_transfer_team_h,
    end_transfer_team_m: normalized_end_transfer_team_m,
    slr_s1: normalized_slr_s1,
    slr_s2: normalized_slr_s2,
    slr_bel: normalized_slr_bel,
    slr_gip: normalized_slr_gip,
    slr_oth: normalized_slr_oth,
    slr_oth_txt: normalized_slr_oth_txt,
    slr_s5: normalized_slr_s5,
    slr_s6: normalized_slr_s6,
    bio_d_h: normalized_bio_d_h,
    bio_d_m: normalized_bio_d_m,
    br_ruk: toText(br_ruk),
    ver_ruk: toText(ver_ruk),
  };
  
}

module.exports = { buildTemplateData };
