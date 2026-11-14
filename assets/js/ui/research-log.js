// Week chips and call cards for the Monday research log.
function el(tag, cls, text) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
}

const HORIZON = { wks: 'weeks', '1-6mo': '1 to 6 months', '6mo+': '6 months or more', '12mo+': '12 months or more' };

export function mountResearchLog(root, log) {
  if (!root || !log?.length) return;
  root.textContent = '';
  const chips = el('div', 'log__weeks');
  chips.setAttribute('role', 'group');
  chips.setAttribute('aria-label', 'Choose a week');
  const calls = el('div', 'log__calls');
  calls.setAttribute('aria-live', 'polite');
  const note = el('p', 'log__note', 'Calls as logged by the script, before any review. Not advice.');
  root.append(chips, calls, note);

  function card(c, wi, ci) {
    const wrap = el('div', 'call');
    const id = `call-${wi}-${ci}`;
    const btn = el('button', 'call__btn');
    btn.type = 'button';
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-controls', id);
    btn.append(el('span', 'call__ticker', c.ticker), el('span', `call__tag call__tag--${c.call}`, c.call), el('span', 'call__asset', `${c.asset} · ${HORIZON[c.horizon] || c.horizon}`));
    const more = el('div', 'call__more');
    more.id = id;
    const inner = el('div');
    const dl = el('dl');
    const rows = [['Why', c.why], ['Risk', c.risk], ['Exit', c.kill || 'No exit level set (no position)']];
    for (const [k, v] of rows) dl.append(el('dt', null, k), el('dd', null, v));
    inner.append(dl);
    more.append(inner);
    btn.addEventListener('click', () => {
      const open = wrap.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', String(open));
    });
    wrap.append(btn, more);
    return wrap;
  }

  function show(wi) {
    [...chips.children].forEach((b, i) => b.setAttribute('aria-pressed', String(i === wi)));
    calls.textContent = '';
    log[wi].calls.forEach((c, ci) => calls.append(card(c, wi, ci)));
  }

  log.forEach((w, wi) => {
    const b = el('button', 'chip', w.label);
    b.type = 'button';
    b.addEventListener('click', () => show(wi));
    chips.append(b);
  });
  show(log.length - 1);
}
