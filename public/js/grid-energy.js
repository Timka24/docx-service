export function createEnergyRow(cfg) {
  let btnByMinute = new Map();
  const minutes = cfg.minutes ?? 70;

  let data = new Array(minutes).fill("");
  let activeValue = "";
  let mode = "paint";
  let rangeStart = null;

  const elGrid = () => document.getElementById(cfg.gridId);
  const elHint = () => document.getElementById(cfg.hintId);
  const elInput = () => document.getElementById(cfg.inputId);
  const elSetBtn = () => document.getElementById(cfg.setBtnId);
  const elClearBtn = () => document.getElementById(cfg.clearBtnId);

  function setHint(text) {
    const el = elHint();
    if (el) el.textContent = text || "";
  }

  function setModeBtn(nextMode) {
    const paint = document.getElementById(cfg.modePaintBtnId);
    const range = document.getElementById(cfg.modeRangeBtnId);
    paint?.classList.toggle("active", nextMode === "paint");
    range?.classList.toggle("active", nextMode === "range");
  }

  function setActiveAux(btnId) {
    [cfg.setBtnId, cfg.clearBtnId].forEach((id) => {
      const b = document.getElementById(id);
      if (!b) return;
      b.classList.toggle("active", id === btnId);
    });
  }

  function normalizeEnergy(raw) {
    let s = (raw ?? "").toString().trim();
    if (s === "") return "";
    s = s.replace(/[^\d]/g, "");
    if (s === "") return "";
    return s;
  }

  function applyMinute(minute) {
    data[minute - 1] = activeValue;
  }

  function applyRange(a, b) {
    const from = Math.min(a, b);
    const to = Math.max(a, b);
    for (let m = from; m <= to; m++) applyMinute(m);
  }

  let prevFrom = null;
  let prevTo = null;

  function clearPreview() {
    if (prevFrom == null || prevTo == null) return;
    for (let m = prevFrom; m <= prevTo; m++) btnByMinute.get(m)?.classList.remove("is-preview");
    prevFrom = prevTo = null;
  }

  function setPreview(a, b) {
    if (a == null || b == null) return;
    const from = Math.min(a, b);
    const to = Math.max(a, b);
    if (prevFrom === from && prevTo === to) return;

    clearPreview();
    for (let m = from; m <= to; m++) btnByMinute.get(m)?.classList.add("is-preview");
    prevFrom = from;
    prevTo = to;
  }

  function minuteAtPoint(x, y) {
    const el = document.elementFromPoint(x, y);
    const cell = el?.closest?.(".cpr-cell");
    if (!cell) return null;
    const m = parseInt(cell.dataset.minute, 10);
    return Number.isFinite(m) ? m : null;
  }

  function bindPaintToContainer() {
    const grid = elGrid();
    if (!grid) return;

    grid.style.touchAction = "none";

    let pointerDown = false;
    let anchor = null;
    let last = null;

    function commit() {
      if (anchor != null && last != null) {
        const from = Math.min(anchor, last);
        const to = Math.max(anchor, last);
        applyRange(anchor, last);
        setHint("Готово: " + from + "–" + to + " (Дж: " + (activeValue || "Пусто") + ")");
        render();
      }
      pointerDown = false;
      anchor = null;
      last = null;
    }

    grid.addEventListener("pointerdown", (e) => {
      if (mode !== "paint") return;
      e.preventDefault();

      pointerDown = true;
      grid.setPointerCapture?.(e.pointerId);

      anchor = minuteAtPoint(e.clientX, e.clientY);
      last = anchor;

      if (anchor != null) {
        setPreview(anchor, anchor);
        setHint("Диапазон: " + anchor + "… (Дж: " + (activeValue || "Пусто") + ")");
      }
    });

    grid.addEventListener("pointermove", (e) => {
      if (!pointerDown || mode !== "paint") return;
      e.preventDefault();

      const m = minuteAtPoint(e.clientX, e.clientY);
      if (m == null || m === last) return;

      last = m;
      setPreview(anchor, last);
      setHint("Диапазон: " + Math.min(anchor, last) + "–" + Math.max(anchor, last) + " (Дж: " + (activeValue || "Пусто") + ")");
    });

    grid.addEventListener("pointerup", (e) => {
      if (!pointerDown) return;
      e.preventDefault();
      clearPreview();
      commit();
    });

    grid.addEventListener("pointercancel", () => {
      if (!pointerDown) return;
      clearPreview();
      commit();
    });
  }

  let rangeBind = null;
  function bindRangePreviewToContainer() {
    const grid = elGrid();
    if (!grid) return;

    let rangePointerDown = false;
    let last = null;
    let justCommitted = false;

    function commit(endMinute) {
      if (rangeStart == null || endMinute == null) return;

      const from = Math.min(rangeStart, endMinute);
      const to = Math.max(rangeStart, endMinute);

      applyRange(rangeStart, endMinute);
      rangeStart = null;

      clearPreview();
      setHint("Готово: " + from + "–" + to + " (Дж: " + (activeValue || "Пусто") + ")");

      justCommitted = true;
      render();
      setTimeout(() => { justCommitted = false; }, 0);
    }

    grid.addEventListener("pointermove", (e) => {
      if (mode !== "range" || rangeStart == null) return;
      if (!rangePointerDown && e.pointerType === "touch") return;

      const m = minuteAtPoint(e.clientX, e.clientY);
      if (m == null) return;

      last = m;
      setPreview(rangeStart, last);
      setHint("Предпросмотр: " + Math.min(rangeStart, last) + "–" + Math.max(rangeStart, last) + " (Дж: " + (activeValue || "Пусто") + ")");
    });

    grid.addEventListener("pointerdown", (e) => {
      if (mode !== "range" || rangeStart == null) return;
      e.preventDefault();
      rangePointerDown = true;
      grid.setPointerCapture?.(e.pointerId);

      const m = minuteAtPoint(e.clientX, e.clientY);
      if (m == null) return;

      last = m;
      setPreview(rangeStart, last);
      setHint("Предпросмотр: " + Math.min(rangeStart, last) + "–" + Math.max(rangeStart, last) + " (Дж: " + (activeValue || "Пусто") + ")");
    });

    grid.addEventListener("pointerup", (e) => {
      if (!rangePointerDown) return;
      e.preventDefault();
      rangePointerDown = false;
      commit(last);
    });

    grid.addEventListener("pointercancel", () => {
      rangePointerDown = false;
      clearPreview();
    });

    return { isJustCommitted: () => justCommitted };
  }

  function render() {
    const container = elGrid();
    if (!container) return;

    container.innerHTML = "";
    btnByMinute = new Map();

    for (let i = 1; i <= minutes; i++) {
      const wrap = document.createElement("div");
      wrap.className = "checkbox-container";

      const label = document.createElement("span");
      label.className = "checkbox-label";
      label.textContent = i;

      const btn = document.createElement("button");
      btnByMinute.set(i, btn);
      btn.type = "button";
      btn.className = "btn cpr-cell";
      btn.dataset.minute = String(i);
      btn.textContent = data[i - 1] || " ";

      if (mode === "range" && rangeStart === i) btn.classList.add("is-start");

      btn.addEventListener("click", () => {
        if (rangeBind?.isJustCommitted?.()) return;
        if (mode !== "range") return;

        if (rangeStart == null) {
          rangeStart = i;
          clearPreview();
          setHint("Старт: " + i + ". Тапни конечную минуту (Дж: " + (activeValue || "Пусто") + ")");
          render();
          return;
        }

        const from = Math.min(rangeStart, i);
        const to = Math.max(rangeStart, i);
        applyRange(rangeStart, i);
        rangeStart = null;

        clearPreview();
        setHint("Готово: " + from + "–" + to + " (Дж: " + (activeValue || "Пусто") + ")");
        render();
      });

      wrap.appendChild(label);
      wrap.appendChild(btn);
      container.appendChild(wrap);
    }
  }

  function init() {
    const input = elInput();
    const setBtn = elSetBtn();
    const clearBtn = elClearBtn();

    function useInputValue() {
      const v = normalizeEnergy(input?.value || "");
      if (input) input.value = v;
      activeValue = v;
      setActiveAux(v === "" ? cfg.clearBtnId : cfg.setBtnId);
      setHint("Выбрано: " + (activeValue || "Пусто") + " (теперь можно рисовать)");
    }

    input?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        useInputValue();
      }
    });

    setBtn?.addEventListener("click", () => useInputValue());

    clearBtn?.addEventListener("click", () => {
      if (input) input.value = "";
      activeValue = "";
      setActiveAux(cfg.clearBtnId);
      setHint("Выбрано: Пусто (очистка). Можно рисовать.");
    });

    document.getElementById(cfg.modePaintBtnId)?.addEventListener("click", () => {
      mode = "paint";
      rangeStart = null;
      clearPreview();
      setModeBtn("paint");
      setHint("");
      render();
    });

    document.getElementById(cfg.modeRangeBtnId)?.addEventListener("click", () => {
      mode = "range";
      rangeStart = null;
      clearPreview();
      setModeBtn("range");
      setHint("Тапни стартовую минуту");
      render();
    });

    if (input && (input.value || "").trim() === "" && cfg.defaultEnergy != null) {
      input.value = String(cfg.defaultEnergy);
    }
    useInputValue();

    setModeBtn("paint");
    bindPaintToContainer();
    rangeBind = bindRangePreviewToContainer();
    render();
  }

  return {
    init,
    clear() {
      data = new Array(minutes).fill("");
      rangeStart = null;
      clearPreview();
      setHint("");
      render();
    },
    setData(arr) {
      data = new Array(minutes).fill("").map((_, idx) => {
        const v = (arr?.[idx] ?? "").toString().trim();
        return normalizeEnergy(v);
      });
      render();
    },
    getData() {
      return data.slice();
    }
  };
}
