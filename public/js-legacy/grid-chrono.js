export function createChronoRow(cfg) {
  var _cfg$minutes, _cfg$states, _cfg$defaultSymbol;
  let btnByMinute = new Map();
  const minutes = (_cfg$minutes = cfg.minutes) !== null && _cfg$minutes !== void 0 ? _cfg$minutes : 70;
  const states = (_cfg$states = cfg.states) !== null && _cfg$states !== void 0 ? _cfg$states : ["", "+", "-", "■"];
  let data = new Array(minutes).fill("");
  let activeSymbol = (_cfg$defaultSymbol = cfg.defaultSymbol) !== null && _cfg$defaultSymbol !== void 0 ? _cfg$defaultSymbol : "+";
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
  function applyMinute(minute) {
    data[minute - 1] = activeSymbol;
  }
  function applyRange(a, b) {
    const from = Math.min(a, b);
    const to = Math.max(a, b);
    for (let m = from; m <= to; m++) applyMinute(m);
  }
  function setActiveBtn(btnId) {
    (cfg.symbolBtns || []).forEach(id => {
      const b = document.getElementById(id);
      if (!b) return;
      b.classList.toggle("active", id === btnId);
    });
  }
  function setModeBtn(nextMode) {
    const paint = document.getElementById(cfg.modePaintBtnId);
    const range = document.getElementById(cfg.modeRangeBtnId);
    paint === null || paint === void 0 || paint.classList.toggle("active", nextMode === "paint");
    range === null || range === void 0 || range.classList.toggle("active", nextMode === "range");
  }
  let prevFrom = null;
  let prevTo = null;
  function clearPreview() {
    if (prevFrom == null || prevTo == null) return;
    for (let m = prevFrom; m <= prevTo; m++) {
      var _btnByMinute$get;
      (_btnByMinute$get = btnByMinute.get(m)) === null || _btnByMinute$get === void 0 || _btnByMinute$get.classList.remove("is-preview");
    }
    prevFrom = prevTo = null;
  }
  function setPreview(a, b) {
    if (a == null || b == null) return;
    const from = Math.min(a, b);
    const to = Math.max(a, b);
    if (prevFrom === from && prevTo === to) return;
    clearPreview();
    for (let m = from; m <= to; m++) {
      var _btnByMinute$get2;
      (_btnByMinute$get2 = btnByMinute.get(m)) === null || _btnByMinute$get2 === void 0 || _btnByMinute$get2.classList.add("is-preview");
    }
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
      var _el$closest;
      const el = document.elementFromPoint(x, y);
      const cell = el === null || el === void 0 || (_el$closest = el.closest) === null || _el$closest === void 0 ? void 0 : _el$closest.call(el, ".cpr-cell");
      if (!cell) return null;
      const m = parseInt(cell.dataset.minute, 10);
      return Number.isFinite(m) ? m : null;
    }
    function commit() {
      if (anchor != null && last != null) {
        const from = Math.min(anchor, last);
        const to = Math.max(anchor, last);
        for (let m = from; m <= to; m++) data[m - 1] = activeSymbol;
        setHint(`Готово: ${from}–${to}`);
        render();
      }
      pointerDown = false;
      anchor = null;
      last = null;
    }
    grid.addEventListener("pointerdown", e => {
      var _grid$setPointerCaptu;
      if (mode !== "paint") return;
      e.preventDefault();
      pointerDown = true;
      (_grid$setPointerCaptu = grid.setPointerCapture) === null || _grid$setPointerCaptu === void 0 || _grid$setPointerCaptu.call(grid, e.pointerId);
      anchor = minuteAtPoint(e.clientX, e.clientY);
      last = anchor;
      if (anchor != null) setPreview(anchor, anchor);
      if (anchor != null) setHint(`Диапазон: ${anchor}…`);
    });
    grid.addEventListener("pointermove", e => {
      if (!pointerDown || mode !== "paint") return;
      e.preventDefault();
      const m = minuteAtPoint(e.clientX, e.clientY);
      if (m == null || m === last) return;
      last = m;
      setPreview(anchor, last);
      setHint(`Диапазон: ${Math.min(anchor, last)}–${Math.max(anchor, last)}`);
    });
    grid.addEventListener("pointerup", e => {
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
      var _el$closest2;
      const el = document.elementFromPoint(x, y);
      const cell = el === null || el === void 0 || (_el$closest2 = el.closest) === null || _el$closest2 === void 0 ? void 0 : _el$closest2.call(el, ".cpr-cell");
      if (!cell) return null;
      const m = parseInt(cell.dataset.minute, 10);
      return Number.isFinite(m) ? m : null;
    }
    function commit(endMinute) {
      if (rangeStart == null || endMinute == null) return;
      applyRange(rangeStart, endMinute);
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
    grid.addEventListener("pointermove", e => {
      if (mode !== "range" || rangeStart == null) return;
      if (!rangePointerDown && e.pointerType === "touch") return;
      const m = minuteAtPoint(e.clientX, e.clientY);
      if (m == null) return;
      last = m;
      setPreview(rangeStart, last);
      setHint(`Предпросмотр: ${Math.min(rangeStart, last)}–${Math.max(rangeStart, last)}`);
    });
    grid.addEventListener("pointerdown", e => {
      var _grid$setPointerCaptu2;
      if (mode !== "range" || rangeStart == null) return;
      e.preventDefault();
      rangePointerDown = true;
      (_grid$setPointerCaptu2 = grid.setPointerCapture) === null || _grid$setPointerCaptu2 === void 0 || _grid$setPointerCaptu2.call(grid, e.pointerId);
      const m = minuteAtPoint(e.clientX, e.clientY);
      if (m == null) return;
      last = m;
      setPreview(rangeStart, last);
      setHint(`Предпросмотр: ${Math.min(rangeStart, last)}–${Math.max(rangeStart, last)}`);
    });
    grid.addEventListener("pointerup", e => {
      if (!rangePointerDown) return;
      e.preventDefault();
      rangePointerDown = false;
      commit(last);
    });
    grid.addEventListener("pointercancel", () => {
      rangePointerDown = false;
      clearPreview();
    });
    return {
      isJustCommitted: () => justCommitted
    };
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
        var _rangeBind, _rangeBind$isJustComm;
        if ((_rangeBind = rangeBind) !== null && _rangeBind !== void 0 && (_rangeBind$isJustComm = _rangeBind.isJustCommitted) !== null && _rangeBind$isJustComm !== void 0 && _rangeBind$isJustComm.call(_rangeBind)) return;
        if (mode !== "range") return;
        if (rangeStart == null) {
          rangeStart = i;
          clearPreview();
          setHint(`Старт: ${i}. Тапни конечную минуту`);
          render();
          return;
        }
        applyRange(rangeStart, i);
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
    var _document$getElementB4, _document$getElementB5;
    if (cfg.symPlusBtnId) {
      var _document$getElementB;
      (_document$getElementB = document.getElementById(cfg.symPlusBtnId)) === null || _document$getElementB === void 0 || _document$getElementB.addEventListener("click", () => {
        activeSymbol = "+";
        setActiveBtn(cfg.symPlusBtnId);
      });
    }
    if (cfg.symMinusBtnId) {
      var _document$getElementB2;
      (_document$getElementB2 = document.getElementById(cfg.symMinusBtnId)) === null || _document$getElementB2 === void 0 || _document$getElementB2.addEventListener("click", () => {
        activeSymbol = "-";
        setActiveBtn(cfg.symMinusBtnId);
      });
    }
    if (cfg.symFillBtnId) {
      const fillBtn = document.getElementById(cfg.symFillBtnId);
      if (fillBtn) {
        fillBtn.disabled = true;
        fillBtn.hidden = true;
      }
    }
    if (cfg.symClearBtnId) {
      var _document$getElementB3;
      (_document$getElementB3 = document.getElementById(cfg.symClearBtnId)) === null || _document$getElementB3 === void 0 || _document$getElementB3.addEventListener("click", () => {
        activeSymbol = "";
        setActiveBtn(cfg.symClearBtnId);
      });
    }
    (_document$getElementB4 = document.getElementById(cfg.modePaintBtnId)) === null || _document$getElementB4 === void 0 || _document$getElementB4.addEventListener("click", () => {
      mode = "paint";
      rangeStart = null;
      clearPreview();
      setModeBtn("paint");
      setHint("");
      render();
    });
    (_document$getElementB5 = document.getElementById(cfg.modeRangeBtnId)) === null || _document$getElementB5 === void 0 || _document$getElementB5.addEventListener("click", () => {
      mode = "range";
      rangeStart = null;
      clearPreview();
      setModeBtn("range");
      setHint("Тапни стартовую минуту");
      render();
    });
    setModeBtn("paint");
    if (cfg.symPlusBtnId) setActiveBtn(cfg.symPlusBtnId);
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
        var _arr$idx;
        const v = ((_arr$idx = arr === null || arr === void 0 ? void 0 : arr[idx]) !== null && _arr$idx !== void 0 ? _arr$idx : "").toString().trim();
        return states.includes(v) ? v : "";
      });
      render();
    },
    getData() {
      return data.slice();
    }
  };
}
//# sourceMappingURL=grid-chrono.js.map