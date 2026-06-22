// Fulfilled HQ — views + router. Reads window.DATA (data.js).
const D = window.DATA;
const $ = (s, r = document) => r.querySelector(s);
const fmt = (n) => n.toLocaleString('en-US');
let CHARTS = [];
const killCharts = () => { CHARTS.forEach((c) => c.destroy()); CHARTS = []; };

// Date-range selector (top-right). Switches the active tab and slices the trend
// charts to the chosen window so the dashboard visibly responds.
let RANGE = '30d';
const RANGE_PTS = { '7d': 4, '30d': 8, '90d': 12, 'All': 99 };
const sliceR = (a) => Array.isArray(a) ? a.slice(-(RANGE_PTS[RANGE] || a.length)) : a;
const rangeTabs = () => `<div class="range">${['7d', '30d', '90d', 'All'].map((r) =>
  `<button class="${r === RANGE ? 'on' : ''}" onclick="setRange('${r}')">${r}</button>`).join('')}</div>`;
window.setRange = (r) => { RANGE = r; render(); };

// ── chart helpers ──────────────────────────────────────────────────────
function area(id, series, color = '#8B5E2A') {
  const ctx = document.getElementById(id); if (!ctx) return;
  CHARTS.push(new Chart(ctx, {
    type: 'line',
    data: { labels: series.map(() => ''), datasets: [{
      data: series, borderColor: color, borderWidth: 2.5, tension: .4, fill: true, pointRadius: 0,
      backgroundColor: (c) => { const g = c.chart.ctx.createLinearGradient(0, 0, 0, c.chart.height); g.addColorStop(0, color + '47'); g.addColorStop(1, color + '00'); return g; },
    }] },
    options: { plugins: { legend: { display: false } }, scales: { x: { display: false }, y: { display: false } }, animation: false, responsive: true, maintainAspectRatio: false },
  }));
}

// ── shared bits ────────────────────────────────────────────────────────
const m = D.money;
const kpi = (k, v, d, up = true) => `<div class="kpi"><div class="k">${k}</div><div class="v">${v}</div><div class="d ${up ? 'u' : 'd'}">${d}</div></div>`;
const heroCard = () => `<section class="card"><div class="hero">
  <div><div class="lbl">Monthly Recurring Revenue ${D.money.live ? LIVE() : ''}</div><div class="big">$${m.mrr}</div>
    <div class="delta u">▲ ${m.mrrDelta}% vs last month</div>
    <div class="goalbar"><div class="gt"><span>North Star · $${fmt(m.goal)} MRR</span><span>${Math.round(m.mrr / m.goal * 100)}%</span></div>
    <div class="track"><i style="width:${Math.round(m.mrr / m.goal * 100)}%"></i></div></div>
  </div><div class="chartwrap"><canvas id="c-mrr"></canvas></div></div></section>`;
const alertsCard = () => `<section class="card"><h3>Alerts</h3><div class="feed">${D.alerts.map((a) =>
  `<div class="fitem"><span class="fd ${a.k}"></span><div>${a.text}<div class="ft">${a.t}</div></div></div>`).join('')}</div></section>`;
const LIVE = () => D.live ? '<span style="font-size:10px;font-weight:700;color:var(--up);background:rgba(62,125,84,.12);padding:2px 7px;border-radius:20px;letter-spacing:.5px">● LIVE</span>' : '';
function timeAgo(iso) { if (!iso) return ''; const s = (Date.now() - new Date(iso).getTime()) / 1000; if (s < 60) return 'just now'; if (s < 3600) return Math.floor(s / 60) + ' min ago'; if (s < 86400) return Math.floor(s / 3600) + 'h ago'; return Math.floor(s / 86400) + 'd ago'; }
const briefingCard = () => D.briefing ? `<section class="card"><h3>Today’s briefing ${LIVE()}<span class="more">Scout</span></h3><div style="font-size:13.5px;line-height:1.6;color:var(--muted)">${D.briefing.summary}</div></section>` : '';
const agentsCard = () => { const items = (D.runs && D.runs.length) ? D.runs.map((r) => ({ name: r.agent, text: r.summary, t: timeAgo(r.created_at), on: true })) : D.agents;
  return `<section class="card agent"><h3>Agent activity ${LIVE()}<span class="more">live</span></h3><div class="feed">${items.map((a) =>
  `<div class="fitem"><span class="fd ${a.on ? 'info' : 'warn'}"></span><div><span class="ai">${a.name}</span> ${a.text}<div class="ft">${a.t}</div></div></div>`).join('')}</div></section>`; };
const approveCard = () => { const v = D.content[0]; if (!v) return '';
  const thumb = v.thumb ? `<img src="${v.thumb}" alt="">` : `<div style="width:54px;height:96px;border-radius:8px;background:linear-gradient(160deg,#3a2f22,#17110a);display:flex;align-items:center;justify-content:center;color:#caa86f;font-size:22px">${(v.type || '')[0] === 'C' ? '❏' : (v.type || '')[0] === 'V' ? '▶' : '✍'}</div>`;
  return `<section class="card"><h3>Awaiting approval ${LIVE()}</h3><div class="approve">
  <div class="vid">${thumb}<div><div class="vt">${v.title}</div><div class="vs">By ${v.by || 'Writer'} · ${v.for}</div></div></div>
  <div class="btns"><button class="ok">Approve & schedule</button><button class="no">Tweak</button></div></div></section>`; };

// ── VIEWS ──────────────────────────────────────────────────────────────
const V = {};

V.overview = () => ({ title: 'Overview', sub: D.updated, note: true, init: () => area('c-mrr', sliceR(m.mrrSeries)),
  html: `<div class="grid"><div class="col">
    ${heroCard()}
    <section class="kpis six">
      ${kpi('Active subscribers', m.activeSubs, '▲ ' + m.subsDelta)}
      ${kpi('Free trials active', m.trials, '▲ ' + m.trialsDelta)}
      ${kpi('Trial → Paid', m.trialToPaid + '%', '▲ ' + m.t2pDelta + '%')}
      ${kpi('Churn (monthly)', m.churn + '%', '▼ ' + Math.abs(m.churnDelta) + '%')}
      ${kpi('Lifetime value', '$' + m.ltv, '▲ $' + m.ltvDelta)}
      ${kpi('Ad ROAS', D.ads.roas + '×', '▲ 0.3×')}
    </section>
    ${funnelCard()} ${adsCard()}
    <section><div class="card" style="padding-bottom:8px"><h3 style="margin-bottom:4px">Social · all platforms</h3></div>
      <div class="social" style="margin-top:14px">${socialTiles()}</div></section>
    <div class="three">${reviewsCard(true)} ${competitorsCard(true)}</div>
  </div><div class="col rail">${briefingCard()} ${approveCard()} ${alertsCard()} ${agentsCard()} ${commentsCard(true)}</div></div>` });

// Money
V.money = () => ({ title: 'Money', sub: 'Revenue, subscribers & retention', init: () => { area('c-mrr2', sliceR(m.mrrSeries)); area('c-subs', sliceR(m.subsSeries), '#3E7D54'); },
  html: `<div class="two" style="margin-bottom:20px">
    <section class="card"><h3>MRR · last 12 months</h3><div class="hero" style="grid-template-columns:1fr 1.4fr">
      <div><div class="big serif" style="font-size:62px">$${m.mrr}</div><div class="delta u">▲ ${m.mrrDelta}%</div>
        <div class="goalbar"><div class="gt"><span>to $${fmt(m.goal)}</span><span>${Math.round(m.mrr / m.goal * 100)}%</span></div><div class="track"><i style="width:${Math.round(m.mrr / m.goal * 100)}%"></i></div></div></div>
      <div class="chartwrap"><canvas id="c-mrr2"></canvas></div></div></section>
    <section class="card"><h3>Subscribers growing</h3><div class="hero" style="grid-template-columns:1fr 1.4fr">
      <div><div class="big serif" style="font-size:62px">${m.activeSubs}</div><div class="delta u">▲ ${m.subsDelta} this month</div></div>
      <div class="chartwrap"><canvas id="c-subs"></canvas></div></div></section></div>
    <section class="kpis six" style="margin-bottom:20px">
      ${kpi('Trial → Paid', m.trialToPaid + '%', '▲ ' + m.t2pDelta + '%')}
      ${kpi('Churn', m.churn + '%', '▼ ' + Math.abs(m.churnDelta) + '%')}
      ${kpi('Lifetime value', '$' + m.ltv, '▲ $' + m.ltvDelta)}
      ${kpi('ARPU', '$' + m.arpu.toFixed(2), 'per user')}
      ${kpi('Active trials', m.trials, '▲ ' + m.trialsDelta)}
      ${kpi('Refund rate', '1.8%', '▼ 0.4%')}
    </section>
    <div class="two">
      <section class="card"><h3>Retention · how long people stay</h3><div class="funnel">
        ${['Day 0', 'Day 1', 'Day 3', 'Day 7', 'Day 14', 'Day 30', 'Day 60'].map((d, i) =>
          `<div class="fstage"><div class="fn">${d}</div><div class="fbar" style="width:${m.retention[i]}%">${m.retention[i]}%</div><div class="fv"></div></div>`).join('')}
      </div></section>
      <section class="card"><h3>Recent transactions</h3><table class="table"><tbody>
        ${m.transactions.map((t) => `<tr><td><b>${t.who}</b><br><span style="color:var(--muted);font-size:12px">${t.what}</span></td><td class="num" style="color:${t.neg ? 'var(--down)' : 'var(--up)'}">${t.amt}</td><td class="num">${t.t}</td></tr>`).join('')}
      </tbody></table></section>
    </div>` });

// Funnel
function funnelCard() { return `<section class="card"><h3>Funnel · where people drop off <span class="more">last 30 days</span></h3><div class="funnel">${D.funnel.map((s) =>
  `<div class="fstage"><div class="fn">${s.stage}${s.sub ? `<small>${s.sub}</small>` : ''}</div><div class="fbar" style="width:${s.w}%">${fmt(s.n)}</div><div class="fv"><b>${s.note}</b></div></div>`).join('')}</div></section>`; }
V.funnel = () => ({ title: 'Funnel', sub: 'The journey from ad to paid subscriber',
  html: `<div style="max-width:840px">${funnelCard()}
    <section class="card" style="margin-top:20px"><h3>What this tells you</h3>
      <div style="font-size:14px;line-height:1.7;color:var(--muted)">
      • Of <b style="color:var(--ink)">48,200</b> people who saw an ad, <b style="color:var(--ink)">2.6%</b> installed — healthy for this category.<br>
      • <b style="color:var(--ink)">25%</b> of installs start a trial. The biggest leak is here — worth testing the onboarding.<br>
      • <b style="color:var(--ink)">41%</b> of trials become paying. Strong — your 3-day trial is converting.<br>
      • Every paying subscriber costs <b style="color:var(--ink)">$3.28</b> in ads and is worth <b style="color:var(--ink)">$43</b> over their lifetime. That's the whole game.</div></section></div>` });

// Ads
function adsCard() { const a = D.ads; return `<section class="card"><h3>Ads · Meta (Instagram + Facebook) <span class="more">June</span></h3>
  <div class="adsum"><div>Spend<b>$${a.spend}</b></div><div>Cost / install<b>$${a.cpi}</b></div><div>Cost / sub<b>$${a.cps}</b></div><div>ROAS<b>${a.roas}×</b></div></div>
  <div class="adrow h"><span>Creative</span><span class="num">Installs</span><span class="num">Spend</span><span class="num">ROAS</span><span></span></div>
  ${a.creatives.map((c) => `<div class="adrow"><span class="an">${c.name}<small>${c.plat}</small></span><span class="num">${c.installs}</span><span class="num">$${c.spend}</span><span class="num">${c.roas}×</span><span class="tag ${c.tag}">${c.tag === 'scale' ? 'Scale ↑' : c.tag === 'cut' ? 'Cut ↓' : 'Watch'}</span></div>`).join('')}</section>`; }
V.ads = () => ({ title: 'Ads', sub: 'Spend, return, and which creative is winning', init: () => area('c-spend', sliceR(D.ads.spendSeries), '#B07A33'),
  html: `<div style="max-width:900px">
    <section class="card" style="margin-bottom:20px"><h3>Daily spend · last 14 days</h3><div class="chartwrap tall"><canvas id="c-spend"></canvas></div></section>
    ${adsCard()}
    <section class="card" style="margin-top:20px"><h3>Planner suggests</h3><div style="font-size:14px;line-height:1.7;color:var(--muted)">
      • Move budget from <b style="color:var(--ink)">“Day 1→30”</b> (1.1× — losing money) into <b style="color:var(--ink)">“Overthinking”</b> (2.4×).<br>
      • Test a 4th creative this week — Writer has 4 hooks ready in your Content queue.<br>
      • At 1.7× blended ROAS, every $10/day spent ≈ <b style="color:var(--ink)">$17 back</b>. Safe to scale slowly.</div></section></div>` });

// Social
function socialTiles() { const s = D.social;
  const t = (cls, ic, name, val, dl, l1, l2) => `<div class="stile"><div class="sh"><span class="si ${cls}">${ic}</span>${name}</div><div class="sv">${val}</div><div class="sd">▲ ${dl} this week</div><div class="meta">${l1}<br>${l2}</div></div>`;
  return t('ig', '◙', 'Instagram', fmt(s.instagram.followers), s.instagram.delta, `Reach <b>${s.instagram.reach}</b>`, `Top: <b>${s.instagram.posts[0].t}</b> · ${s.instagram.posts[0].v}`)
    + t('tk', '♪', 'TikTok', fmt(s.tiktok.followers), s.tiktok.delta, `Views <b>${s.tiktok.reach}</b>`, `Top: <b>${s.tiktok.posts[0].t}</b> · ${s.tiktok.posts[0].v}`)
    + t('fb', 'f', 'Facebook', fmt(s.facebook.followers), s.facebook.delta, `Reach <b>${s.facebook.reach}</b>`, `Mostly from ads`)
    + t('ap', '', 'App Store', fmt(s.apple.downloads), s.apple.delta, `Rating <b>${s.apple.rating}★</b>`, `Search conv. <b>${s.apple.conv}%</b>`); }
const SOCIAL_META = { instagram: ['ig', '◙', 'Instagram'], tiktok: ['tk', '♪', 'TikTok'], facebook: ['fb', 'f', 'Facebook'], apple: ['ap', '', 'App Store'] };
let socialTab = 'instagram';
V.social = () => { const key = socialTab, p = D.social[key], [cls, ic, name] = SOCIAL_META[key];
  const metric = key === 'apple' ? `${fmt(p.downloads)}` : `${fmt(p.followers)}`;
  const ml = key === 'apple' ? 'downloads' : 'followers';
  return ({ title: 'Social', sub: 'All four platforms in one place', init: () => area('c-soc', sliceR(p.series), key === 'tiktok' ? '#111' : key === 'facebook' ? '#1877F2' : '#8B5E2A'),
  html: `<div class="social" style="margin-bottom:20px">${socialTiles()}</div>
    <div class="range" style="display:inline-flex;margin-bottom:16px">${Object.keys(SOCIAL_META).map((k) => `<button class="${k === key ? 'on' : ''}" onclick="setSocial('${k}')">${SOCIAL_META[k][2]}</button>`).join('')}</div>
    <div class="two">
      <section class="card"><h3><span class="si ${cls}" style="display:inline-flex;vertical-align:middle;margin-right:6px">${ic}</span>${name} · ${ml} growth</h3>
        <div class="hero" style="grid-template-columns:1fr 1.5fr"><div><div class="big serif" style="font-size:54px">${metric}</div><div class="delta u">▲ ${p.delta} this week</div>
        <div class="meta" style="margin-top:14px;font-size:13px;color:var(--muted)">${key === 'apple' ? `Rating ${p.rating}★ · search conv ${p.conv}%` : `Reach/views ${p.reach} · engagement ${p.eng}`}</div></div>
        <div class="chartwrap"><canvas id="c-soc"></canvas></div></div></section>
      <section class="card"><h3>Top ${key === 'apple' ? 'search terms' : 'posts'}</h3><div class="postgrid">${p.posts.map((x) =>
        `<div class="post"><div class="pt">${x.t}</div><div class="pv">${x.v}<small>${x.s}</small></div></div>`).join('')}</div></section>
    </div>` }); };
window.setSocial = (k) => { socialTab = k; render(); };

// Reviews
function reviewsCard(short) { const r = D.reviews; const items = short ? r.items.slice(0, 3) : r.items;
  return `<section class="card"><h3>App Store reviews <span class="more">${r.items.length} recent</span></h3>
  ${short ? '' : `<div class="sentibar"><i class="p" style="width:${r.breakdown.pos}%"></i><i class="n" style="width:${r.breakdown.neu}%"></i><i class="g" style="width:${r.breakdown.neg}%"></i></div>`}
  <div class="rev">${items.map((x) => `<div class="r"><div class="rh"><span class="stars">${'★'.repeat(x.stars)}${'☆'.repeat(5 - x.stars)}</span><span class="chip ${x.chip}">${x.chip === 'pos' ? 'Positive' : x.chip === 'neg' ? 'Needs reply' : 'Feature idea'}</span></div><div class="rt">“${x.text}”</div><div class="rmeta">${x.who} · ${x.t}</div><span class="draft">✍️ Draft reply →</span></div>`).join('')}</div></section>`; }
V.reviews = () => ({ title: 'Reviews', sub: 'Every App Store review, sorted by sentiment',
  html: `<div style="max-width:760px">${reviewsCard(false)}</div>` });

// Competitors
function competitorsCard(short) { const list = short ? D.competitors.slice(0, 3) : D.competitors;
  return `<section class="card"><h3>Competitor watch · Meta Ad Library <span class="more">public · free</span></h3><div class="comp">${list.map((c) =>
    `<div class="c"><div><div class="cn">${c.name}</div><div class="cs">${c.ads} ads running · ${c.note}</div></div><div class="cb">See ads</div></div>`).join('')}</div></section>`; }
V.competitors = () => ({ title: 'Competitors', sub: 'What rival apps are actually running — free from Meta',
  html: `<div style="max-width:760px">${competitorsCard(false)}
    <section class="card" style="margin-top:20px"><h3>Scout noticed</h3><div style="font-size:14px;line-height:1.7;color:var(--muted)">
    • Two competitors just moved to <b style="color:var(--ink)">$2.99/wk</b> — your $3.99 is still fine given your trial converts at 41%.<br>
    • <b style="color:var(--ink)">Faceless UGC + trending audio</b> is the dominant format right now. Your “Overthinking” ad already fits it.<br>
    • “RisingYou” is copying the before/after format — worth getting ahead with fresh angles.</div></section></div>` });

// Comments
function commentsCard(short) { const list = short ? D.comments.slice(0, 3) : D.comments;
  return `<section class="card"><h3>Comments · sentiment</h3><div class="cmt">${list.map((c) =>
    `<div class="cm"><div class="cmh"><span>${c.who} · ${c.plat}</span><span class="chip ${c.chip}">${c.chip === 'pos' ? 'Positive' : c.chip === 'neg' ? 'Objection' : 'Question'}</span></div><div class="cmt2">“${c.text}”</div>${c.chip !== 'pos' ? '<span class="draft">✍️ Draft reply →</span>' : ''}</div>`).join('')}</div></section>`; }
V.comments = () => ({ title: 'Comments', sub: 'Your IG + TikTok comments, with draft replies',
  html: `<div style="max-width:760px">${commentsCard(false)}</div>` });

// Content queue
V.content = () => ({ title: 'Content queue', sub: 'What the agents built — nothing posts until you approve',
  html: `${D.briefing ? `<div style="margin-bottom:20px;max-width:980px">${briefingCard()}</div>` : ''}<div class="two">${D.content.map((c) => `<div class="contentcard">
    <div class="ch"><div class="thumb">${c.thumb ? `<img src="${c.thumb}" class="thumb">` : (c.type[0] === 'V' ? '▶' : c.type[0] === 'C' ? '❏' : '✍')}</div>
      <div><div class="meta">${c.type} · ${c.by} → ${c.for}</div><div class="ti">${c.title}</div></div></div>
    <span class="statuspill ${c.status}">${c.status === 'ready' ? 'Ready to post' : 'Needs your review'}</span>
    <div class="cap">${c.caption}</div>
    <div class="btns"><button class="ok">${c.status === 'ready' ? 'Approve & schedule' : 'Approve'}</button><button class="no">Tweak</button></div>
  </div>`).join('')}</div>` });

// Settings
V.settings = () => ({ title: 'Settings', sub: 'Connections, agents & spending cap',
  html: `<div class="two">
    <section class="card"><h3>Connections</h3>${D.connections.map((c) =>
      `<div class="conn"><div><div class="cl">${c.name}</div><div class="cw">${c.what}</div></div><button class="connbtn ${c.status === 'on' ? 'done' : ''}">${c.status === 'on' ? '✓ Connected' : 'Connect'}</button></div>`).join('')}</section>
    <div class="col">
      <section class="card"><h3>Spending cap</h3>
        <div class="big serif" style="font-size:46px">$${D.budget.cap}<span style="font-size:18px;color:var(--muted)"> / month</span></div>
        <div class="goalbar"><div class="gt"><span>Used this month ${LIVE()}</span><span>$${Number(D.budget.used).toFixed(2)} of $${D.budget.cap}</span></div><div class="track"><i style="width:${Math.max(1, D.budget.used / D.budget.cap * 100)}%"></i></div></div>
        <div style="font-size:12.5px;color:var(--muted);margin-top:12px;line-height:1.5">The agents physically stop when they hit this cap. Everything else (hosting, data, video) is free.</div></section>
      <section class="card"><h3>Agents</h3>${D.agents.map((a) =>
        `<div class="toggle"><div><div class="cl" style="font-weight:700;font-size:14px">${a.name}</div><div class="cw" style="font-size:12px;color:var(--muted)">${a.on ? 'Running on schedule' : 'Turns on in Phase 3'}</div></div><div class="sw ${a.on ? '' : 'off'}"><i></i></div></div>`).join('')}</section>
    </div></div>` });

// ── nav + router ───────────────────────────────────────────────────────
const NAV = [
  { v: 'overview', ic: '◎', label: 'Overview' },
  { group: 'GROW' }, { v: 'money', ic: '$', label: 'Money' }, { v: 'funnel', ic: '⛢', label: 'Funnel' }, { v: 'ads', ic: '◈', label: 'Ads' },
  { group: 'REACH' }, { v: 'social', ic: '❋', label: 'Social' }, { v: 'reviews', ic: '★', label: 'Reviews' }, { v: 'competitors', ic: '⚑', label: 'Competitors' }, { v: 'comments', ic: '❝', label: 'Comments' },
  { group: 'AGENTS' }, { v: 'content', ic: '▶', label: 'Content queue' }, { v: 'settings', ic: '⚙', label: 'Settings' },
];
function renderNav(active) {
  return NAV.map((n) => n.group ? `<div class="grouplbl">${n.group}</div>` :
    `<a class="${n.v === active ? 'on' : ''}" onclick="go('${n.v}')"><span class="ic">${n.ic}</span>${n.label}</a>`).join('');
}
window.go = (v) => { location.hash = v; };

function render() {
  killCharts();
  const view = (location.hash.replace('#', '') || 'overview');
  const fn = V[view] || V.overview;
  const r = fn();
  $('#nav').innerHTML = renderNav(view);
  $('#main').innerHTML = `<div class="top"><div><h1>${r.title}</h1><div class="sub">${r.sub}</div></div>
    ${rangeTabs()}</div>
    ${r.note ? `<div class="note">⚠️ <b>Preview with sample numbers.</b> The next step is connecting your real accounts (Settings → Connect). Then every number here goes live.</div>` : ''}
    ${r.html}`;
  if (r.init) setTimeout(r.init, 30);
  $('#main').scrollTop = 0; window.scrollTo(0, 0);
}
// ── live data ──────────────────────────────────────────────────────────
// Pulls real agent output + budget from the HQ backend and merges it over the
// sample data. Metrics not yet connected (MRR, social, ads) keep their samples.
const KIND = { video: ['Video · 10s', '▶'], carousel: ['Carousel', '❏'], hooks: ['Hooks', '✍'], ad_copy: ['Ad copy', '✍'] };
const PLAT = { instagram: 'Instagram', tiktok: 'TikTok', ads: 'Ads', facebook: 'Facebook', scripts: 'Scripts' };
let PASS = '';
async function loadLive() {
  const c = window.HQ_CONFIG; if (!c) return true;
  try {
    const res = await fetch(c.url + '/hq-data', { method: 'POST', headers: { Authorization: 'Bearer ' + c.anon, 'Content-Type': 'application/json' }, body: JSON.stringify({ pass: PASS }) });
    if (res.status === 401) return false;        // wrong password
    if (!res.ok) return true;                     // other error: keep samples
    const d = await res.json(); if (d.error) return true;
    D.live = true;
    if (d.content && d.content.length) D.content = d.content.map((r) => {
      const k = KIND[r.kind] || ['Draft', '❏'];
      return { type: k[0], typeIcon: k[1], title: r.title, by: r.created_by, for: PLAT[r.platform] || r.platform || 'Instagram',
        status: r.status === 'ready' ? 'ready' : 'review', thumb: r.kind === 'video' ? 'thumb-overthinking.png' : '', caption: r.body };
    });
    if (d.briefing) D.briefing = d.briefing;
    if (d.runs && d.runs.length) D.runs = d.runs;
    if (d.alerts && d.alerts.length) D.alerts = d.alerts.map((a) => ({ k: a.kind, text: a.text, t: timeAgo(a.created_at) }));
    if (d.budget) D.budget = { cap: d.budget.cap_cents / 100, used: d.budget.used_cents / 100 };
    // Real money numbers from RevenueCat (latest value per metric — rows arrive
    // newest-first). Overrides the sample MRR/subs/trials once data flows.
    if (d.metrics && d.metrics.length) {
      const rc = {};
      d.metrics.forEach((x) => { if (x.source === 'revenuecat' && !(x.metric in rc)) rc[x.metric] = Number(x.value); });
      if (rc.mrr != null) { D.money.mrr = rc.mrr; D.money.live = true; }
      if (rc.active_subs != null) D.money.activeSubs = rc.active_subs;
      if (rc.trials != null) D.money.trials = rc.trials;
    }
    return true;
  } catch (e) { return true; /* offline → keep samples */ }
}

// ── password gate ───────────────────────────────────────────────────────
// The static page is public; the data is not. We send the password to hq-data
// (checked server-side). A correct one is remembered on this device.
function showGate(msg) {
  document.body.innerHTML = `<div style="position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:var(--bone);font-family:'DM Sans',sans-serif">
    <div style="background:#fff;border:1px solid var(--line);border-radius:20px;padding:38px 40px;width:360px;text-align:center;box-shadow:0 24px 60px rgba(26,18,10,.08)">
      <div style="font-family:'Cormorant Garamond',serif;font-size:34px;color:var(--gold);font-weight:600">Fulfilled <span style="font-size:13px;letter-spacing:3px;color:var(--faint);font-weight:700">HQ</span></div>
      <div style="color:var(--muted);font-size:13.5px;margin:6px 0 22px">Enter your password</div>
      ${msg ? `<div style="color:var(--down);font-size:12.5px;margin-bottom:12px">${msg}</div>` : ''}
      <input id="pw" type="password" autofocus placeholder="Password"
        style="width:100%;padding:12px 14px;border:1px solid var(--line);border-radius:11px;font:inherit;font-size:15px;margin-bottom:12px"
        onkeydown="if(event.key==='Enter')submitPass()">
      <button onclick="submitPass()" style="width:100%;padding:12px;border:0;border-radius:11px;background:var(--ink);color:#F7F3EE;font:inherit;font-weight:700;font-size:14px;cursor:pointer">Enter</button>
    </div></div>`;
}
window.submitPass = () => {
  const v = (document.getElementById('pw') || {}).value || '';
  localStorage.setItem('hq_pass', v);
  location.reload();
};

async function boot() {
  PASS = localStorage.getItem('hq_pass') || '';
  if (!PASS) return showGate();
  const ok = await loadLive();
  if (ok === false) { localStorage.removeItem('hq_pass'); return showGate('Wrong password — try again'); }
  render();
}

window.addEventListener('hashchange', render);
window.addEventListener('DOMContentLoaded', boot);
