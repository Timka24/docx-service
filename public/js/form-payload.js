const CHECKED = "☑";
const UNCHECKED = "☐";

function normalizeTimePart(value, max) {
  const digits = String(value || "").replace(/\D/g, "");
  if (!digits) return "";
  const num = Number(digits);
  if (!Number.isFinite(num) || num < 0 || num > max) return "";
  return String(num).padStart(2, "0");
}

export function formatDateForDocx(iso) {
  if (!iso) return "";
  const [yyyy, mm, dd] = iso.split("-");
  if (!yyyy || !mm || !dd) return "";
  return `${dd}.${mm}.${yyyy}`;
}

export function marksFromResult(name) {
  const chosen = document.querySelector(`input[name="${name}"]:checked`)?.value || "";
  return {
    s: chosen === "s" ? CHECKED : UNCHECKED,
    f: chosen === "f" ? CHECKED : UNCHECKED
  };
}

export function buildPayload(grids) {
  const brigade = document.getElementById("brigade")?.value || "";
  const pstation = document.getElementById("pstation")?.value || "";
  const lastName = document.getElementById("lastName")?.value || "";
  const firstName = document.getElementById("firstName")?.value || "";
  const middleName = document.getElementById("middleName")?.value || "";
  const kvNumber = document.getElementById("kvNumber")?.value || "";

  const fio_pac = [lastName, firstName, middleName].map((s) => s.trim()).filter(Boolean).join(" ");

  const pr_m_raw = document.getElementById("arrivalMinutes")?.value || "";
  const d_m_raw = document.getElementById("deathMinutes")?.value || "";
  const bio_d_h_raw = document.getElementById("bio_d_h")?.value || "";
  const bio_d_m_raw = document.getElementById("bio_d_m")?.value || "";
  const pr_h = document.getElementById("arrivalHours")?.value || "";
  const pr_m = pr_m_raw === "" ? "" : String(pr_m_raw).padStart(2, "0");
  const d_h = document.getElementById("deathHours")?.value || "";
  const d_m = d_m_raw === "" ? "" : String(d_m_raw).padStart(2, "0");
  const bio_d_h = bio_d_h_raw === "" ? "" : String(bio_d_h_raw).padStart(2, "0");
  const bio_d_m = bio_d_m_raw === "" ? "" : String(bio_d_m_raw).padStart(2, "0");

  const br_ruk_last = document.getElementById("br_ruk_last")?.value || "";
  const br_ruk_first = document.getElementById("br_ruk_first")?.value || "";
  const br_ruk_middle = document.getElementById("br_ruk_middle")?.value || "";
  const br_ruk = [br_ruk_last, br_ruk_first, br_ruk_middle].map((s) => s.trim()).filter(Boolean).join(" ");

  const ver_ruk_last = document.getElementById("ver_ruk_last")?.value || "";
  const ver_ruk_first = document.getElementById("ver_ruk_first")?.value || "";
  const ver_ruk_middle = document.getElementById("ver_ruk_middle")?.value || "";
  const ver_ruk = [ver_ruk_last, ver_ruk_first, ver_ruk_middle].map((s) => s.trim()).filter(Boolean).join(" ");

  const pr_date_iso = document.getElementById("nowDate")?.value || "";
  const pr_date = formatDateForDocx(pr_date_iso);

  let witnessValue = "";
  const selectedWitness = document.querySelector('input[name="witness"]:checked');
  if (selectedWitness) witnessValue = selectedWitness.value;

  let slr_value = "";
  const selectedCpr = document.querySelector('input[name="slr"]:checked');
  if (selectedCpr) slr_value = selectedCpr.value;

  const r_start_nms = document.getElementById("r_start_nms")?.checked ? CHECKED : UNCHECKED;
  const r_start_vent = document.getElementById("r_start_vent")?.checked ? CHECKED : UNCHECKED;
  const r_start_defib = document.getElementById("r_start_defib")?.checked ? CHECKED : UNCHECKED;

  const airwayPhase = document.querySelector('input[name="airway_phase"]:checked')?.value || "";
  const a_v = airwayPhase === "during" ? CHECKED : UNCHECKED;
  const a_d = airwayPhase === "before" ? CHECKED : UNCHECKED;

  const a1 = marksFromResult("a1_result");
  const a2 = marksFromResult("a2_result");
  const a3 = marksFromResult("a3_result");
  const a4 = marksFromResult("a4_result");
  const a5 = marksFromResult("a5_result");

  const a1t = document.getElementById("a1t")?.value || "";
  const a2t = document.getElementById("a2t")?.value || "";
  const a3t = document.getElementById("a3t")?.value || "";
  const a4t = document.getElementById("a4t")?.value || "";
  const a5t = document.getElementById("a5t")?.value || "";

  const et_num = document.getElementById("et_num")?.value || "";
  const et_try = document.getElementById("et_try")?.value || "";

  const vascularPhase = document.querySelector('input[name="vascular_phase"]:checked')?.value || "";
  const v_v = vascularPhase === "during" ? CHECKED : UNCHECKED;
  const v_d = vascularPhase === "before" ? CHECKED : UNCHECKED;

  const v1 = marksFromResult("v1_result");
  const v2 = marksFromResult("v2_result");
  const v3 = marksFromResult("v3_result");
  const v4 = marksFromResult("v4_result");

  const v1t = document.getElementById("v1t")?.value || "";
  const v2t = document.getElementById("v2t")?.value || "";
  const v3t = document.getElementById("v3t")?.value || "";
  const v4t = document.getElementById("v4t")?.value || "";
  const v1try = document.getElementById("v1try")?.value || "";
  const v2try = document.getElementById("v2try")?.value || "";
  const v3try = document.getElementById("v3try")?.value || "";
  const v4try = document.getElementById("v4try")?.value || "";
  const v_point = document.getElementById("v_point")?.value || "";

  const ivlAlt = document.querySelector('input[name="ivl_alt"]:checked')?.value || "";
  const t_3 = ivlAlt === "3" ? CHECKED : UNCHECKED;
  const t_15 = ivlAlt === "15" ? CHECKED : UNCHECKED;
  const t_30 = ivlAlt === "30" ? CHECKED : UNCHECKED;

  const fr_m = document.getElementById("fr_m")?.value || "";

  const o_air = document.getElementById("o_air")?.checked ? CHECKED : UNCHECKED;
  const o_o2 = document.getElementById("o_o2")?.checked ? CHECKED : UNCHECKED;

  const i_d = document.getElementById("i_d")?.value || "";
  const i_m = document.getElementById("i_m")?.value || "";
  const i_fr = document.getElementById("i_fr")?.value || "";
  const i_t = document.getElementById("i_t")?.value || "";

  let slrControl = "";
  const selectedSlrControl = document.querySelector('input[name="slr_control"]:checked');
  if (selectedSlrControl) slrControl = selectedSlrControl.value;

  const slr_c_y = slrControl === "yes" ? CHECKED : UNCHECKED;
  const slr_c_n = slrControl === "no" ? CHECKED : UNCHECKED;

  const slr_s1 = document.getElementById("slr_stop_1")?.checked ? CHECKED : UNCHECKED;
  const slr_bel = document.getElementById("slr_stop_bel")?.checked ? CHECKED : UNCHECKED;
  const slr_gip = document.getElementById("slr_stop_gip")?.checked ? CHECKED : UNCHECKED;
  const slr_oth = document.getElementById("slr_stop_oth")?.checked ? CHECKED : UNCHECKED;
  const slr_oth_txt = slr_oth === CHECKED ? (document.getElementById("slr_stop_oth_txt")?.value || "") : "";
  const slr_s5 = document.getElementById("slr_stop_5")?.checked ? CHECKED : UNCHECKED;


  let medTherapyControl = "";
  const selectedMedTherapyControl = document.querySelector('input[name="med_therapy"]:checked');
  if (selectedMedTherapyControl) medTherapyControl = selectedMedTherapyControl.value;

  const med_t_y = medTherapyControl === "yes" ? CHECKED : UNCHECKED;
  const med_t_n = medTherapyControl === "no" ? CHECKED : UNCHECKED;

  const defib_model = document.getElementById("defib_model")?.value || "";

  const reversible_causes_4g4t = document.getElementById("reverseCauses")?.value || "";
  const post_resuscitation_therapy = document.getElementById("postResuscitationTherapy")?.value || "";
  const comments = document.getElementById("comments")?.value || "";

  const selectedEndResp = document.querySelector('input[name="end_resp"]:checked')?.value || "";
  const end_resp_spont = selectedEndResp === "spont" ? CHECKED : UNCHECKED;
  const end_resp_ivl = selectedEndResp === "ivl" ? CHECKED : UNCHECKED;

  const end_h = normalizeTimePart(document.getElementById("end_h")?.value, 23);
  const end_m = normalizeTimePart(document.getElementById("end_m")?.value, 59);
  const end_transfer_doc_h = normalizeTimePart(document.getElementById("end_transfer_doc_h")?.value, 23);
  const end_transfer_doc_m = normalizeTimePart(document.getElementById("end_transfer_doc_m")?.value, 59);
  const end_transfer_team_h = normalizeTimePart(document.getElementById("end_transfer_team_h")?.value, 23);
  const end_transfer_team_m = normalizeTimePart(document.getElementById("end_transfer_team_m")?.value, 59);

  const end_date_iso = document.getElementById("end_date")?.value || "";
  const end_date = formatDateForDocx(end_date_iso);

  const last_name_raw = lastName;
  const first_name_raw = firstName;
  const middle_name_raw = middleName;
  const kv_num_tail_raw = kvNumber;
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
    kv_num: kvNumber ? `100-26-${kvNumber}` : "",
    pr_date,
    pr_date_iso_raw,
    pr_h,
    pr_m,
    d_h,
    d_m,
    witness: witnessValue,
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
    slr_c_y,
    slr_c_n,
    ch_cpr_m: grids.cprManual.getData(),
    slr_h: document.getElementById("slr_h")?.value || "",
    slr_m: document.getElementById("slr_m")?.value || "",
    fr_gr: document.getElementById("fr_gr")?.value || "",
    ch_cpr_a_marks: grids.cprAuto.getData(),
    ch_cpr_a: document.getElementById("ch_cpr_a")?.value || "",
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
    ch_adr_nacl_ml_marks: grids.adrNaclMl.getData(),
    ch_amio_glu_ml_marks: grids.amioGluMl.getData(),
    ch_nacl_marks: grids.nacl.getData(),
    ch_nacl: document.getElementById("ch_nacl")?.value || "",
    ch_drugs1_marks: grids.drugs1.getData(),
    ch_drugs1: document.getElementById("ch_drugs1")?.value || "",
    ch_drugs2_marks: grids.drugs2.getData(),
    ch_drugs2: document.getElementById("ch_drugs2")?.value || "",
    ch_manipulation1_marks: grids.manipulation1.getData(),
    ch_manipulation1: document.getElementById("ch_manipulation1")?.value || "",
    ch_manipulation2_marks: grids.manipulation2.getData(),
    ch_manipulation2: document.getElementById("ch_manipulation2")?.value || "",
    ch_pulse_carotid_marks: grids.chPulseCart.getData(),
    ch_pupil_reaction_marks: grids.chPupReact.getData(),
    reversible_causes_4g4t,
    post_resuscitation_therapy,
    comments,
    end_date,
    end_date_iso_raw,
    end_h,
    end_m,
    end_success_mark: document.getElementById("end_success")?.checked ? CHECKED : UNCHECKED,
    end_ecg_rhythm: document.getElementById("end_ecg_rhythm")?.value || "",
    end_hr: document.getElementById("end_hr")?.value || "",
    end_conclusion: document.getElementById("end_conclusion")?.value || "",
    end_gcs: document.getElementById("end_gcs")?.value || "",
    end_resp: selectedEndResp,
    end_resp_spont,
    end_resp_ivl,
    end_rr: document.getElementById("end_rr")?.value || "",
    end_bp: document.getElementById("end_bp")?.value || "",
    end_pulse: document.getElementById("end_pulse")?.value || "",
    end_spo2: document.getElementById("end_spo2")?.value || "",
    end_transfer_doc_mark: document.getElementById("end_transfer_doc")?.checked ? CHECKED : UNCHECKED,
    end_transfer_doc_fio: document.getElementById("end_transfer_doc_fio")?.value || "",
    end_transfer_doc_h,
    end_transfer_doc_m,
    end_transfer_team_mark: document.getElementById("end_transfer_team")?.checked ? CHECKED : UNCHECKED,
    end_transfer_team_num: document.getElementById("end_transfer_team_num")?.value || "",
    end_transfer_team_h,
    end_transfer_team_m,
    slr_s1,
    slr_bel,
    slr_gip,
    slr_oth,
    slr_oth_txt,
    slr_s5,
    bio_d_h,
    bio_d_m,
    br_ruk,
    ver_ruk,
    br_ruk_last_raw,
    br_ruk_first_raw,
    br_ruk_middle_raw,
    ver_ruk_last_raw,
    ver_ruk_first_raw,
    ver_ruk_middle_raw,
  };
}
