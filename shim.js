// Minimal stand-in for the dashboard runtime: loads the JSON data files,
// runs the calculations and redraws on filter or width changes.
// The From/To date range (public page only) narrows the lineup data that the
// lineup, combination, player and totals calculations see. The game log,
// exhibition status and notable dates always use the full season.
(function () {
  const SOURCES = {stints: 'data/kentucky_lineup_stints.json', schedule: 'data/kentucky_schedule.json', players: 'data/kentucky_player_games.json', team: 'data/kentucky_team_games.json'};
  const DATE_FILTERED = new Set(['scopes', 'lineup_stats', 'combos', 'player_stats', 'scope_totals', 'player_box', 'rotation']);
  const DEFAULTS = {scope: 'all', minmin: 0, combo: 2, rate: 'pg', from: null, to: null};
  const raw = {}, calcs = {}, draws = {}, onDatas = [];
  let cache = {}, status = 'loading', params = Object.assign({}, DEFAULTS);
  try {
    const q = new URLSearchParams(location.search);
    if (q.get('scope')) params.scope = q.get('scope');
    if (q.get('min')) params.minmin = Number(q.get('min'));
    if (q.get('combo')) params.combo = Number(q.get('combo'));
    if (['40', 'tot'].includes(q.get('rate'))) params.rate = q.get('rate');
    if (/^\d{4}-\d\d-\d\d$/.test(q.get('from') || '')) params.from = q.get('from');
    if (/^\d{4}-\d\d-\d\d$/.test(q.get('to') || '')) params.to = q.get('to');
  } catch (e) {}
  const css = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  const inRange = (r) => (!params.from || r.date >= params.from) && (!params.to || r.date <= params.to);
  const input = (id, forCalc) => (['stints', 'players', 'team'].includes(id) && DATE_FILTERED.has(forCalc)) ? raw[id].filter(inRange) : dash.data(id).data;
  const dash = {
    get colors() { return [css('--series-1') || css('--accent'), '#e07b39', '#2a9d8f', '#8e6cc9', '#d1495b', '#6a994e', '#c9a227', '#577590']; },
    data(id) {
      if (status !== 'ok') return {status, data: []};
      if (id in raw) return {status: 'ok', data: raw[id]};
      if (id in calcs) {
        if (!(id in cache)) cache[id] = calcs[id].fn(...calcs[id].inputs.map((i) => input(i, id)));
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
      const datesChanged = ('from' in p && p.from !== params.from) || ('to' in p && p.to !== params.to);
      Object.assign(params, p);
      if (datesChanged) cache = {};
      try {
        const q = new URLSearchParams();
        if (params.scope !== 'all') q.set('scope', params.scope);
        if (params.minmin !== 0) q.set('min', params.minmin);
        if (params.combo !== 2) q.set('combo', params.combo);
        if (params.rate !== 'pg') q.set('rate', params.rate);
        if (params.from) q.set('from', params.from);
        if (params.to) q.set('to', params.to);
        history.replaceState(null, '', location.pathname + (q.toString() ? '?' + q : '') + location.hash);
      } catch (e) {}
      render();
    },
    resetParams() { params = Object.assign({}, DEFAULTS); cache = {}; render(); },
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
