// Minimal stand-in for the dashboard runtime: loads the JSON data files,
// runs the calculations and redraws on filter or width changes.
(function () {
  const SOURCES = {stints: 'data/kentucky_lineup_stints.json', schedule: 'data/kentucky_schedule.json'};
  const DEFAULTS = {scope: 'all', minmin: 5};
  const raw = {}, calcs = {}, draws = {}, onDatas = [], cache = {};
  let status = 'loading', params = Object.assign({}, DEFAULTS);
  try { const q = new URLSearchParams(location.search); if (q.get('scope')) params.scope = q.get('scope'); if (q.get('min')) params.minmin = Number(q.get('min')); } catch (e) {}
  const css = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  const dash = {
    get colors() { return [css('--series-1') || css('--accent'), '#e07b39', '#2a9d8f', '#8e6cc9', '#d1495b', '#6a994e', '#c9a227', '#577590']; },
    data(id) {
      if (status !== 'ok') return {status, data: []};
      if (id in raw) return {status: 'ok', data: raw[id]};
      if (id in calcs) {
        if (!(id in cache)) cache[id] = calcs[id].fn(...calcs[id].inputs.map((i) => dash.data(i).data));
        return {status: 'ok', data: cache[id]};
      }
      return {status: 'missing', data: []};
    },
    calc(id, o) { calcs[id] = o; },
    loader() {},
    onData(fn) { onDatas.push(fn); if (status === 'ok') fn(); },
    draw(name, fn) {
      if (fn) { draws[name] = fn; if (status === 'ok') run(name); } else run(name);
    },
    params() { return Object.assign({}, params); },
    setParams(p) {
      Object.assign(params, p);
      try { const q = new URLSearchParams(); if (params.scope !== 'all') q.set('scope', params.scope); if (params.minmin !== 5) q.set('min', params.minmin); history.replaceState(null, '', location.pathname + (q.toString() ? '?' + q : '') + location.hash); } catch (e) {}
      render();
    },
    resetParams() { params = Object.assign({}, DEFAULTS); render(); },
    setLink() {}, refresh() {},
  };
  function run(name) {
    document.querySelectorAll('[data-draw="' + name + '"]').forEach((el) => {
      try { draws[name](el); } catch (e) { console.error(name, e); }
    });
  }
  function render() { onDatas.forEach((f) => { try { f(); } catch (e) { console.error(e); } }); Object.keys(draws).forEach(run); }
  window.dash = dash;
  let w = 0;
  window.addEventListener('resize', () => { if (Math.abs(window.innerWidth - w) > 20 && status === 'ok') { w = window.innerWidth; render(); } });
  window.addEventListener('DOMContentLoaded', async () => {
    try {
      await Promise.all(Object.entries(SOURCES).map(async ([id, url]) => { raw[id] = await fetch(url + '?v=' + Date.now()).then((r) => r.json()); }));
      status = 'ok'; w = window.innerWidth; render();
    } catch (e) { status = 'error'; document.body.classList.add('kl-failed'); console.error(e); }
  });
})();
