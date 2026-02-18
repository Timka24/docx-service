export function createChronoRow(cfg) {
  let btnByMinute = new Map();
  const minutes = cfg.minutes ?? 70;
  const states = cfg.states ?? ["", "+", "-", "■"];

  let data = new Array(minutes).fill("");
  let activeSymbol = cfg.defaultSymbol ?? "■";
  let rangeBind = null;
  let mode = "paint";
  let rangeStart = null;
  let isPainting = false;

  const elGrid = () => document.getElementById(cfg.gridId);
  const elHint = () => document.getElementById(cfg.hintId);

  function setHint(text) {
    const el = elHint();
    if (el) el.textContent = text || "";
  }

  function resolveActiveSymbol() {
    if (typeof cfg.getActiveSymbol === "function") {
      const symbol = cfg.getActiveSymbol();
      if (symbol === null) {
        setHint(cfg.invalidSymbolHint || "Некорректное значение");
        return null;
      }
      return symbol;
    }

    return activeSymbol;
  }

  function applyMinute(minute, symbol = activeSymbol) {
    data[minute - 1] = symbol;
  }

  function applyRange(a, b, symbol = activeSymbol) {
    const from = Math.min(a, b);
    const to = Math.max(a, b);
    for (let m = from; m <= to; m++) applyMinute(m, symbol);
  }

  function setActiveBtn(btnId) {
    (cfg.symbolBtns || []).forEach((id) => {
      const b = document.getElementById(id);
      if (!b) return;
      b.classList.toggle("active", id === btnId);
    });
  }

  function setModeBtn(nextMode) {
    const paint = document.getElementById(cfg.modePaintBtnId);
    const range = document.getElementById(cfg.modeRangeBtnId);
    paint?.classList.toggle("active", nextMode === "paint");
    range?.classList.toggle("active", nextMode === "range");
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

  function bindPaintToContainer() {
    setPreview();
    clearPreview();

    const grid = elGrid();
    if (!grid) return;

    grid.style.touchAction = "none";

    let pointerDown = false;
    let anchor = null;
    let last = null;

    function minuteAtPoint(x, y) {
      const el = document.elementFromPoint(x, y);
      const cell = el?.closest?.(".cpr-cell");
      if (!cell) return null;
      const m = parseInt(cell.dataset.minute, 10);
      return Number.isFinite(m) ? m : null;
    }

    function commit() {
      const symbol = resolveActiveSymbol();
      if (symbol === null) {
        pointerDown = false;
        anchor = null;
        last = null;
        return;
      }

      if (anchor != null && last != null) {
        const from = Math.min(anchor, last);
        const to = Math.max(anchor, last);
        for (let m = from; m <= to; m++) data[m - 1] = symbol;

        setHint(`Готово: ${from}–${to}`);
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
      if (anchor != null) setPreview(anchor, anchor);

      if (anchor != null) setHint(`Диапазон: ${anchor}…`);
    });

    grid.addEventListener("pointermove", (e) => {
      if (!pointerDown || mode !== "paint") return;
      e.preventDefault();

      const m = minuteAtPoint(e.clientX, e.clientY);
      if (m == null || m === last) return;

      last = m;
      setPreview(anchor, last);
      setHint(`Диапазон: ${Math.min(anchor, last)}–${Math.max(anchor, last)}`);
    });

    grid.addEventListener("pointerup", (e) => {
      clearPreview();
      if (!pointerDown) return;
      e.preventDefault();
      commit();
    });

    grid.addEventListener("pointercancel", () => {
      clearPreview();
      if (!pointerDown) return;
      commit();
    });
  }

  function bindRangePreviewToContainer() {
    const grid = elGrid();
    if (!grid) return;

    let rangePointerDown = false;
    let last = null;
    let justCommitted = false;

    function minuteAtPoint(x, y) {
      const el = document.elementFromPoint(x, y);
      const cell = el?.closest?.(".cpr-cell");
      if (!cell) return null;
      const m = parseInt(cell.dataset.minute, 10);
      return Number.isFinite(m) ? m : null;
    }

    function commit(endMinute) {
      if (rangeStart == null || endMinute == null) return;
      const symbol = resolveActiveSymbol();
      if (symbol === null) return;

      applyRange(rangeStart, endMinute, symbol);
      const from = Math.min(rangeStart, endMinute);
      const to = Math.max(rangeStart, endMinute);

      rangeStart = null;
      clearPreview();
      setHint(`Готово: ${from}–${to}`);
      justCommitted = true;
      render();

      setTimeout(() => {
        justCommitted = false;
      }, 0);
    }

    grid.addEventListener("pointermove", (e) => {
      if (mode !== "range" || rangeStart == null) return;
      if (!rangePointerDown && e.pointerType === "touch") return;
      const m = minuteAtPoint(e.clientX, e.clientY);
      if (m == null) return;
      last = m;
      setPreview(rangeStart, last);
      setHint(`Предпросмотр: ${Math.min(rangeStart, last)}–${Math.max(rangeStart, last)}`);
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
      setHint(`Предпросмотр: ${Math.min(rangeStart, last)}–${Math.max(rangeStart, last)}`);
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
          setHint(`Старт: ${i}. Тапни конечную минуту`);
          render();
          return;
        }

        const symbol = resolveActiveSymbol();
        if (symbol === null) return;

        applyRange(rangeStart, i, symbol);
        rangeStart = null;
        clearPreview();
        setHint("Готово. Тапни новый старт");
        render();
      });

      wrap.appendChild(label);
      wrap.appendChild(btn);
      container.appendChild(wrap);
    }
  }

  function init() {
    if (cfg.symPlusBtnId) {
      document.getElementById(cfg.symPlusBtnId)?.addEventListener("click", () => {
        activeSymbol = "+";
        setActiveBtn(cfg.symPlusBtnId);
      });
    }
    if (cfg.symMinusBtnId) {
      document.getElementById(cfg.symMinusBtnId)?.addEventListener("click", () => {
        activeSymbol = "-";
        setActiveBtn(cfg.symMinusBtnId);
      });
    }
    if (cfg.symFillBtnId) {
      document.getElementById(cfg.symFillBtnId)?.addEventListener("click", () => {
        activeSymbol = "■";
        setActiveBtn(cfg.symFillBtnId);
      });
    }
    if (cfg.symClearBtnId) {
      document.getElementById(cfg.symClearBtnId)?.addEventListener("click", () => {
        activeSymbol = "";
        setActiveBtn(cfg.symClearBtnId);
      });
    }

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

    setModeBtn("paint");
    if (cfg.symFillBtnId) setActiveBtn(cfg.symFillBtnId);

    bindPaintToContainer();
    rangeBind = bindRangePreviewToContainer();

    render();
  }

  return {
    init,
    render,
    clear() {
      data = new Array(minutes).fill("");
      rangeStart = null;
      setHint("");
      render();
    },
    setData(arr) {
      data = new Array(minutes).fill("").map((_, idx) => {
        const v = (arr?.[idx] ?? "").toString().trim();
        return states.includes(v) ? v : "";
      });
      render();
    },
    getData() {
      return data.slice();
    }
  };
}
