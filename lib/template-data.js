const {
  MINUTES,
  pad2,
  normalizeRow70,
  normalizeMl70,
  parseMlToNumber,
  formatSumRu,
  sumRange,
  normalizeDefibEnergy70
} = require("./normalize");

function buildTemplateData(body) {
  const {
    brig = "",
    ps = "",
    fio_pac = "",
    kv_num = "",
    pr_date = "",
    pr_h = "",
    pr_m = "",
    d_h = "",
    d_m = "",
    witness = "",
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
    slr_c_y = "",
    slr_c_n = "",
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
    ch_adr_nacl_ml_marks = null,
    ch_amio_glu_ml_marks = null,
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
  } = body || {};

  const CHECKED = "☑";
  const UNCHECKED = "☐";

  const witness_cb = witness === "witness" ? CHECKED : UNCHECKED;
  const brigade_cb = witness === "brigade" ? CHECKED : UNCHECKED;
  const none_cb = witness === "none" ? CHECKED : UNCHECKED;

  const slr_none = slr === "none" ? CHECKED : UNCHECKED;
  const slr_comp = slr === "compress" ? CHECKED : UNCHECKED;
  const slr_comp_ivl = slr === "comp_ivl" ? CHECKED : UNCHECKED;

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


  const chAdrNaclRow = normalizeMl70(ch_adr_nacl_ml_marks);
  const chAmioGluRow = normalizeMl70(ch_amio_glu_ml_marks);

  const ch_adr_nacl_sum_1_35 = formatSumRu(sumRange(chAdrNaclRow, 1, 35));
  const ch_adr_nacl_sum_36_70 = formatSumRu(sumRange(chAdrNaclRow, 36, 70));
  const ch_amio_glu_sum_1_35 = formatSumRu(sumRange(chAmioGluRow, 1, 35));
  const ch_amio_glu_sum_36_70 = formatSumRu(sumRange(chAmioGluRow, 36, 70));

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
    pr_h,
    pr_m,
    d_h,
    d_m,
    witness_cb,
    brigade_cb,
    none_cb,
    slr_none,
    slr_comp,
    slr_comp_ivl,
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
    i_t,
    slr_c_y,
    slr_c_n,
    ch_cpr_m: chCprMRow,
    ...chrono_cpr_manual,
    slr_h,
    slr_m,
    fr_gr,
    ch_cpr_a,
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
    defib_model,
    med_t_n,
    med_t_y,
    ch_adr_nacl_ml_marks: chAdrNaclRow,
    ...chrono_adr_nacl_ml,
    ch_adr_nacl_sum_1_35,
    ch_adr_nacl_sum_36_70,
    ch_amio_glu_ml_marks: chAmioGluRow,
    ...chrono_amio_glu_ml,
    ch_amio_glu_sum_1_35,
    ch_amio_glu_sum_36_70,
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
  };
}

module.exports = { buildTemplateData };
