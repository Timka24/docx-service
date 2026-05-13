function parseStrictDate(value) {
  if (typeof value !== "string") return null;

  const raw = value.trim();
  if (!raw) return null;

  let yyyy;
  let mm;
  let dd;

  const iso = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (iso) {
    [, yyyy, mm, dd] = iso;
  } else {
    const ru = raw.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
    if (!ru) return null;
    [, dd, mm, yyyy] = ru;
  }

  const date = new Date(`${yyyy}-${mm}-${dd}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return null;
  if (date.toISOString().slice(0, 10) !== `${yyyy}-${mm}-${dd}`) return null;

  return { yyyy, mm, dd, iso: `${yyyy}-${mm}-${dd}` };
}

function normalizeDateToIso(value) {
  return parseStrictDate(value)?.iso || "";
}

module.exports = {
  normalizeDateToIso,
  parseStrictDate,
};
