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
// Honest empty state — used everywhere there's no real data yet.
const empty = (msg) => `<div style="color:var(--muted);font-size:13.5px;line-height:1.6;padding:6px 2px">${msg}</div>`;
const heroCard = () => { const pct = m.goal ? Math.round(m.mrr / m.goal * 100) : 0;
  return `<section class="card"><div class="hero">
  <div><div class="lbl">Monthly Recurring Revenue ${m.live ? LIVE() : ''}</div><div class="big">$${fmt(m.mrr)}</div>
    <div class="delta ${m.mrr ? 'u' : ''}" style="${m.mrr ? '' : 'color:var(--faint)'}">${m.mrr ? '▲ live from RevenueCat' : 'Begins when you have your first subscriber'}</div>
    <div class="goalbar"><div class="gt"><span>North Star · $${fmt(m.goal)} MRR</span><span>${pct}%</span></div>
    <div class="track"><i style="width:${Math.max(0, pct)}%"></i></div></div>
  </div><div class="chartwrap">${m.mrrSeries.length ? '<canvas id="c-mrr"></canvas>' : empty('Revenue chart fills in as MRR grows.')}</div></div></section>`; };
const alertsCard = () => `<section class="card"><h3>Alerts ${D.alerts.length ? LIVE() : ''}</h3>${D.alerts.length ? `<div class="feed">${D.alerts.map((a) =>
  `<div class="fitem"><span class="fd ${a.k}"></span><div>${a.text}<div class="ft">${a.t}</div></div></div>`).join('')}</div>` : empty('No alerts yet — the Analyst flags wins and warnings here once there’s activity.')}</section>`;
const LIVE = () => D.live ? '<span style="font-size:10px;font-weight:700;color:var(--up);background:rgba(62,125,84,.12);padding:2px 7px;border-radius:20px;letter-spacing:.5px">● LIVE</span>' : '';
function timeAgo(iso) { if (!iso) return ''; const s = (Date.now() - new Date(iso).getTime()) / 1000; if (s < 60) return 'just now'; if (s < 3600) return Math.floor(s / 60) + ' min ago'; if (s < 86400) return Math.floor(s / 3600) + 'h ago'; return Math.floor(s / 86400) + 'd ago'; }
const briefingCard = () => D.briefing ? `<section class="card"><h3>Today’s briefing ${LIVE()}<span class="more">Scout</span></h3><div style="font-size:13.5px;line-height:1.6;color:var(--muted)">${D.briefing.summary}</div></section>` : '';
const agentsCard = () => { const runs = (D.runs && D.runs.length) ? D.runs.map((r) => ({ name: r.agent, text: r.summary, t: timeAgo(r.created_at), on: true })) : [];
  return `<section class="card agent"><h3>Agent activity ${runs.length ? LIVE() : ''}<span class="more">${runs.length ? 'live' : ''}</span></h3>${runs.length ? `<div class="feed">${runs.map((a) =>
  `<div class="fitem"><span class="fd ${a.on ? 'info' : 'warn'}"></span><div><span class="ai">${a.name}</span> ${a.text}<div class="ft">${a.t}</div></div></div>`).join('')}</div>` : empty('No agent runs yet — tap “Generate content now” in the Content queue.')}</section>`; };
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
      ${kpi('Active subscribers', fmt(m.activeSubs), m.activeSubs ? 'live' : 'after launch')}
      ${kpi('Free trials active', fmt(m.trials), m.trials ? 'live' : 'after launch')}
      ${kpi('Trial → Paid', '—', 'after launch')}
      ${kpi('Churn (monthly)', '—', 'after launch')}
      ${kpi('Lifetime value', '—', 'after launch')}
      ${kpi('Ad ROAS', '—', 'connect Ads')}
    </section>
    ${funnelCard()} ${adsCard()}
    <section><div class="card" style="padding-bottom:8px"><h3 style="margin-bottom:4px">Social · all platforms</h3></div>
      <div class="social" style="margin-top:14px">${socialTiles()}</div></section>
    <div class="three">${reviewsCard(true)} ${competitorsCard(true)}</div>
  </div><div class="col rail">${briefingCard()} ${approveCard()} ${alertsCard()} ${agentsCard()} ${commentsCard(true)}</div></div>` });

// Money
V.money = () => { const pct = m.goal ? Math.round(m.mrr / m.goal * 100) : 0;
  return ({ title: 'Money', sub: 'Revenue, subscribers & retention', init: () => { if (m.mrrSeries.length) area('c-mrr2', sliceR(m.mrrSeries)); if (m.subsSeries.length) area('c-subs', sliceR(m.subsSeries), '#3E7D54'); },
  html: `<div class="two" style="margin-bottom:20px">
    <section class="card"><h3>MRR ${m.live ? LIVE() : ''}</h3><div class="hero" style="grid-template-columns:1fr 1.4fr">
      <div><div class="big serif" style="font-size:62px">$${fmt(m.mrr)}</div><div class="delta ${m.mrr ? 'u' : ''}" style="${m.mrr ? '' : 'color:var(--faint)'}">${m.mrr ? 'live from RevenueCat' : 'starts at first sale'}</div>
        <div class="goalbar"><div class="gt"><span>to $${fmt(m.goal)}</span><span>${pct}%</span></div><div class="track"><i style="width:${Math.max(0, pct)}%"></i></div></div></div>
      <div class="chartwrap">${m.mrrSeries.length ? '<canvas id="c-mrr2"></canvas>' : empty('Chart builds as MRR grows.')}</div></div></section>
    <section class="card"><h3>Subscribers ${m.live ? LIVE() : ''}</h3><div class="hero" style="grid-template-columns:1fr 1.4fr">
      <div><div class="big serif" style="font-size:62px">${fmt(m.activeSubs)}</div><div class="delta ${m.activeSubs ? 'u' : ''}" style="${m.activeSubs ? '' : 'color:var(--faint)'}">${m.activeSubs ? 'active now' : 'none yet — launch first'}</div></div>
      <div class="chartwrap">${m.subsSeries.length ? '<canvas id="c-subs"></canvas>' : empty('Chart builds as subscribers grow.')}</div></div></section></div>
    <section class="kpis six" style="margin-bottom:20px">
      ${kpi('Trial → Paid', '—', 'after launch')}
      ${kpi('Churn', '—', 'after launch')}
      ${kpi('Lifetime value', '—', 'after launch')}
      ${kpi('ARPU', '—', 'after launch')}
      ${kpi('Active trials', fmt(m.trials), m.trials ? 'live' : 'after launch')}
      ${kpi('Refund rate', '—', 'after launch')}
    </section>
    <div class="two">
      <section class="card"><h3>Retention · how long people stay</h3>${m.retention.length ? `<div class="funnel">
        ${['Day 0', 'Day 1', 'Day 3', 'Day 7', 'Day 14', 'Day 30', 'Day 60'].map((d, i) =>
          `<div class="fstage"><div class="fn">${d}</div><div class="fbar" style="width:${m.retention[i]}%">${m.retention[i]}%</div><div class="fv"></div></div>`).join('')}
      </div>` : empty('Retention shows up once people have used the app over time (post-launch).')}</section>
      <section class="card"><h3>Recent transactions ${m.transactions.length ? LIVE() : ''}</h3>${m.transactions.length ? `<table class="table"><tbody>
        ${m.transactions.map((t) => `<tr><td><b>${t.who}</b><br><span style="color:var(--muted);font-size:12px">${t.what}</span></td><td class="num" style="color:${t.neg ? 'var(--down)' : 'var(--up)'}">${t.amt}</td><td class="num">${t.t}</td></tr>`).join('')}
      </tbody></table>` : empty('Trials, renewals and refunds will list here as they happen.')}</section>
    </div>` }); };

// Funnel
function funnelCard() { return `<section class="card"><h3>Funnel · where people drop off</h3>${D.funnel.length ? `<div class="funnel">${D.funnel.map((s) =>
  `<div class="fstage"><div class="fn">${s.stage}${s.sub ? `<small>${s.sub}</small>` : ''}</div><div class="fbar" style="width:${s.w}%">${fmt(s.n)}</div><div class="fv"><b>${s.note}</b></div></div>`).join('')}</div>` : empty('No funnel yet. This fills in once ads are running and installs → trials → paid start flowing (after launch + Ads connected).')}</section>`; }
V.funnel = () => ({ title: 'Funnel', sub: 'The journey from ad to paid subscriber',
  html: `<div style="max-width:840px">${funnelCard()}</div>` });

// Ads
function adsCard() { const a = D.ads; if (!a.connected || !a.creatives.length) return `<section class="card"><h3>Ads · Meta (Instagram + Facebook)</h3>${empty('Ads aren’t connected yet. This needs a Meta Ads account (adult-owned) and an active campaign. Once you’re running ads, spend, cost-per-install, ROAS and per-creative results show here.')}</section>`;
  return `<section class="card"><h3>Ads · Meta (Instagram + Facebook) ${LIVE()}</h3>
  <div class="adsum"><div>Spend<b>$${a.spend}</b></div><div>Cost / install<b>$${a.cpi}</b></div><div>Cost / sub<b>$${a.cps}</b></div><div>ROAS<b>${a.roas}×</b></div></div>
  <div class="adrow h"><span>Creative</span><span class="num">Installs</span><span class="num">Spend</span><span class="num">ROAS</span><span></span></div>
  ${a.creatives.map((c) => `<div class="adrow"><span class="an">${c.name}<small>${c.plat}</small></span><span class="num">${c.installs}</span><span class="num">$${c.spend}</span><span class="num">${c.roas}×</span><span class="tag ${c.tag}">${c.tag === 'scale' ? 'Scale ↑' : c.tag === 'cut' ? 'Cut ↓' : 'Watch'}</span></div>`).join('')}</section>`; }
V.ads = () => ({ title: 'Ads', sub: 'Spend, return, and which creative is winning',
  html: `<div style="max-width:900px">${adsCard()}</div>` });

// Social
function socialTiles() { const s = D.social;
  // Not-connected platforms show an honest placeholder instead of fake numbers.
  const off = (cls, ic, name) => `<div class="stile" style="opacity:.72"><div class="sh"><span class="si ${cls}">${ic}</span>${name}</div><div class="sv" style="font-size:22px;color:var(--faint)">Not connected</div><div class="sd" style="color:var(--faint)">needs account setup</div><div class="meta">Followers, reach & posts appear once connected.</div></div>`;
  return off('ig', '◙', 'Instagram')
    + off('tk', '♪', 'TikTok')
    + off('fb', 'f', 'Facebook')
    + appleTile(s.apple); }
function appleTile(ap) {
  if (!ap.live) return `<div class="stile"><div class="sh"><span class="si ap"></span>App Store</div><div class="sv" style="font-size:22px;color:var(--faint)">Loading…</div><div class="sd" style="color:var(--faint)">tap “Refresh Apple data”</div><div class="meta">TestFlight testers, builds & rating appear here.</div></div>`;
  return `<div class="stile"><div class="sh"><span class="si ap"></span>App Store ${LIVE()}</div><div class="sv">${ap.testers ?? 0}</div><div class="sd" style="color:var(--gold)">TestFlight testers</div><div class="meta">${ap.builds ?? 0} builds uploaded<br>${ap.downloads ? `Downloads <b>${fmt(ap.downloads)}</b>` : 'Downloads begin at launch'}</div></div>`;
}
const SOCIAL_META = { instagram: ['ig', '◙', 'Instagram'], tiktok: ['tk', '♪', 'TikTok'], facebook: ['fb', 'f', 'Facebook'], apple: ['ap', '', 'App Store'] };
let socialTab = 'instagram';
V.social = () => { const key = socialTab, p = D.social[key], [cls, ic, name] = SOCIAL_META[key];
  const isApple = key === 'apple';
  const connected = isApple ? true : !!p.connected;
  const metric = isApple ? `${p.testers ?? 0}` : `${fmt(p.followers)}`;
  const head = `<div style="margin-bottom:14px"><button onclick="refreshApple(this)" style="border:0;border-radius:10px;background:var(--ink);color:#F7F3EE;font:inherit;font-weight:700;font-size:12.5px;padding:9px 15px;cursor:pointer">↻ Refresh Apple data</button> <span style="color:var(--faint);font-size:12px;margin-left:6px">App Store is connected — Instagram/TikTok/Facebook need account setup.</span></div>
    <div class="social" style="margin-bottom:20px">${socialTiles()}</div>
    <div class="range" style="display:inline-flex;margin-bottom:16px">${Object.keys(SOCIAL_META).map((k) => `<button class="${k === key ? 'on' : ''}" onclick="setSocial('${k}')">${SOCIAL_META[k][2]}</button>`).join('')}</div>`;
  // Non-Apple, not connected → honest connect prompt, no fake detail.
  if (!connected) return ({ title: 'Social', sub: 'All four platforms in one place',
    html: `${head}<section class="card"><h3><span class="si ${cls}" style="display:inline-flex;vertical-align:middle;margin-right:6px">${ic}</span>${name}</h3>${empty(`${name} isn’t connected yet. Connecting it needs an adult-owned ${key === 'tiktok' ? 'TikTok' : 'Meta'} developer account and a one-time app approval. Once connected, followers, reach and top posts show here.`)}</section>` });
  // Apple — real data.
  return ({ title: 'Social', sub: 'All four platforms in one place', init: () => { if (p.series.length) area('c-soc', sliceR(p.series), '#8B5E2A'); },
  html: `${head}
    <div class="two">
      <section class="card"><h3><span class="si ${cls}" style="display:inline-flex;vertical-align:middle;margin-right:6px">${ic}</span>${name} ${p.live ? LIVE() : ''}</h3>
        <div class="hero" style="grid-template-columns:1fr 1.5fr"><div><div class="big serif" style="font-size:54px">${metric}</div><div class="delta" style="color:var(--gold)">TestFlight testers</div>
        <div class="meta" style="margin-top:14px;font-size:13px;color:var(--muted)">${p.builds ?? 0} builds uploaded${p.rating ? ` · Rating ${p.rating}★` : ''}<br>${p.downloads ? `Downloads <b>${fmt(p.downloads)}</b>` : 'Downloads begin at launch'}</div></div>
        <div class="chartwrap">${p.series.length ? '<canvas id="c-soc"></canvas>' : empty('Growth chart begins at launch.')}</div></div></section>
      <section class="card"><h3>App Store</h3>${p.posts.length ? `<div class="postgrid">${p.posts.map((x) =>
        `<div class="post"><div class="pt">${x.t}</div><div class="pv">${x.v}<small>${x.s}</small></div></div>`).join('')}</div>` : empty('Search-term rankings appear once the app is live in the store.')}</section>
    </div>` }); };
window.setSocial = (k) => { socialTab = k; render(); };

// Reviews
function reviewsCard(short) { const r = D.reviews; const items = short ? r.items.slice(0, 3) : r.items;
  if (!items.length) return `<section class="card"><h3>App Store reviews</h3>${empty('No reviews yet. Once the app is live and people start rating it, reviews land here sorted by sentiment, with draft replies.')}</section>`;
  return `<section class="card"><h3>App Store reviews <span class="more">${r.items.length} recent</span></h3>
  ${short ? '' : `<div class="sentibar"><i class="p" style="width:${r.breakdown.pos}%"></i><i class="n" style="width:${r.breakdown.neu}%"></i><i class="g" style="width:${r.breakdown.neg}%"></i></div>`}
  <div class="rev">${items.map((x) => `<div class="r"><div class="rh"><span class="stars">${'★'.repeat(x.stars)}${'☆'.repeat(5 - x.stars)}</span><span class="chip ${x.chip}">${x.chip === 'pos' ? 'Positive' : x.chip === 'neg' ? 'Needs reply' : 'Feature idea'}</span></div><div class="rt">“${x.text}”</div><div class="rmeta">${x.who} · ${x.t}</div><span class="draft">✍️ Draft reply →</span></div>`).join('')}</div></section>`; }
V.reviews = () => ({ title: 'Reviews', sub: 'Every App Store review, sorted by sentiment',
  html: `<div style="max-width:760px">${reviewsCard(false)}</div>` });

// Competitors
function competitorsCard(short) { const list = short ? D.competitors.slice(0, 3) : D.competitors;
  if (!list.length) return `<section class="card"><h3>Competitor watch · Meta Ad Library</h3>${empty('Not set up yet. The Meta Ad Library is public and free — once wired up, this shows which rival apps are running ads and what angles they’re testing.')}</section>`;
  return `<section class="card"><h3>Competitor watch · Meta Ad Library <span class="more">public · free</span></h3><div class="comp">${list.map((c) =>
    `<div class="c"><div><div class="cn">${c.name}</div><div class="cs">${c.ads} ads running · ${c.note}</div></div><div class="cb">See ads</div></div>`).join('')}</div></section>`; }
V.competitors = () => ({ title: 'Competitors', sub: 'What rival apps are actually running — free from Meta',
  html: `<div style="max-width:760px">${competitorsCard(false)}</div>` });

// Comments
function commentsCard(short) { const list = short ? D.comments.slice(0, 3) : D.comments;
  if (!list.length) return `<section class="card"><h3>Comments · sentiment</h3>${empty('Needs Instagram/TikTok connected. Once they’re linked, your post comments show here grouped by sentiment, with draft replies for questions and objections.')}</section>`;
  return `<section class="card"><h3>Comments · sentiment</h3><div class="cmt">${list.map((c) =>
    `<div class="cm"><div class="cmh"><span>${c.who} · ${c.plat}</span><span class="chip ${c.chip}">${c.chip === 'pos' ? 'Positive' : c.chip === 'neg' ? 'Objection' : 'Question'}</span></div><div class="cmt2">“${c.text}”</div>${c.chip !== 'pos' ? '<span class="draft">✍️ Draft reply →</span>' : ''}</div>`).join('')}</div></section>`; }
V.comments = () => ({ title: 'Comments', sub: 'Your IG + TikTok comments, with draft replies',
  html: `<div style="max-width:760px">${commentsCard(false)}</div>` });

// Creators — partnership targets the Creator Scout found (you DM them by hand).
let CREATOR_TIER = 'All';
const CR_TIERS = ['All', '10–50k', '50–100k', '100–200k', '200k+'];
const REPLY_COL = { High: 'var(--up)', Medium: 'var(--goldB)', Low: 'var(--faint)' };
const REPLY_BG = { High: 'rgba(62,125,84,.12)', Medium: 'rgba(176,122,51,.14)', Low: 'rgba(26,18,10,.07)' };
V.creators = () => {
  const all = (D.creators || []).map((c, idx) => ({ ...c, _i: idx }));
  const cnt = (t) => t === 'All' ? all.length : all.filter((c) => (c.tier || '') === t).length;
  const list = CREATOR_TIER === 'All' ? all : all.filter((c) => (c.tier || '') === CREATOR_TIER);
  return ({ title: 'Creators', sub: 'Partnership targets — Scout finds them, you send the DM',
  html: `<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:16px;margin-bottom:14px;max-width:1020px">
    <div class="note" style="margin:0;flex:1">⚠️ <b>Send these yourself</b> (auto-DM breaks Instagram’s rules). Follower counts, reply odds & pay are <b>estimates</b> — verify before reaching out. ${LIVE()}</div>
    <button onclick="findCreators(this)" style="flex:none;border:0;border-radius:11px;background:var(--ink);color:#F7F3EE;font:inherit;font-weight:700;font-size:13.5px;padding:12px 18px;cursor:pointer;white-space:nowrap">🔎 Find creators now</button>
  </div>
  <div class="range" style="display:inline-flex;margin-bottom:18px;flex-wrap:wrap">${CR_TIERS.map((t) => `<button class="${t === CREATOR_TIER ? 'on' : ''}" onclick="setCreatorTier('${t}')">${t}${cnt(t) ? ` · ${cnt(t)}` : ''}</button>`).join('')}</div>
  ${list.length ? `<div class="two">${list.map((c) => `<div class="contentcard">
    <div style="display:flex;justify-content:space-between;align-items:center">
      <span class="chip" style="background:rgba(176,122,51,.12);color:var(--goldB)">${c.tier || '—'}</span>
      ${c.reply ? `<span style="font-size:11px;font-weight:700;padding:3px 10px;border-radius:20px;background:${REPLY_BG[c.reply] || 'rgba(26,18,10,.07)'};color:${REPLY_COL[c.reply] || 'var(--muted)'}">${c.reply} reply odds</span>` : ''}
    </div>
    <div class="ch"><div><div class="meta">Instagram · ${c.followers || '—'} followers (est.)</div><div class="ti">${c.handle}</div></div></div>
    <div style="font-size:12.5px;color:var(--muted);line-height:1.5">${c.why || ''}</div>
    ${c.pay ? `<div style="font-size:12.5px;color:var(--ink);background:var(--bone);border-radius:10px;padding:9px 12px">💰 <b>Suggested:</b> ${c.pay}</div>` : ''}
    <div class="cap" id="dm-${c._i}">${c.dm_draft || ''}</div>
    <div class="btns"><button class="ok" onclick="copyDM(${c._i})">Copy DM</button><button class="no" onclick="openIG('${c.handle}')">Open profile ↗</button></div>
    <div style="display:flex;gap:8px"><button onclick="creatorStatus('${c.handle}','contacted')" style="flex:1;border:0;border-radius:9px;background:rgba(62,125,84,.12);color:var(--up);font:inherit;font-weight:700;font-size:12px;padding:8px;cursor:pointer">✓ Contacted</button><button onclick="creatorStatus('${c.handle}','skip')" style="flex:none;border:1px solid var(--line);background:transparent;color:var(--muted);font:inherit;font-weight:600;font-size:12px;padding:8px 14px;border-radius:9px;cursor:pointer">Skip</button></div>
  </div>`).join('')}</div>` : `<div style="color:var(--muted);font-size:14px;max-width:600px">No creators in this category yet — tap <b>“Find creators now.”</b> The Scout searches the web for real manifestation creators and tags each with size, reply odds & suggested pay (~1 min, then refresh).</div>`}` }); };
window.setCreatorTier = (t) => { CREATOR_TIER = t; render(); };
window.runAgents = async (btn) => {
  if (btn) { btn.textContent = '🔄 Working…'; btn.disabled = true; }
  try {
    await fetch(window.HQ_CONFIG.url + '/hq-agents', { method: 'POST', headers: { Authorization: 'Bearer ' + window.HQ_CONFIG.anon, 'Content-Type': 'application/json' }, body: '{}' });
    alert('🔄 Generating fresh content… new drafts land in a few seconds — refresh to see them.');
  } catch (e) { alert('Could not run the agents — try again.'); }
  if (btn) { btn.textContent = '🔄 Generate content now'; btn.disabled = false; }
};
window.refreshApple = async (btn) => {
  if (btn) { btn.textContent = '↻ Refreshing…'; btn.disabled = true; }
  try {
    await fetch(window.HQ_CONFIG.url + '/hq-apple', { method: 'POST', headers: { Authorization: 'Bearer ' + window.HQ_CONFIG.anon, 'Content-Type': 'application/json' } });
    await loadLive(); render();
  } catch (e) { alert('Could not refresh Apple data — try again.'); }
};

window.findCreators = async (btn) => {
  if (btn) { btn.textContent = '🔎 Scouting…'; btn.disabled = true; }
  try {
    await fetch(window.HQ_CONFIG.url + '/hq-creator-scout', { method: 'POST', headers: { Authorization: 'Bearer ' + window.HQ_CONFIG.anon, 'Content-Type': 'application/json' }, body: '{}' });
    alert('🔎 Scouting for creators…\n\nNew ones appear here in about a minute — refresh the page to see them.');
  } catch (e) { alert('Could not start the scout — try again.'); }
  if (btn) { btn.textContent = '🔎 Find creators now'; btn.disabled = false; }
};
window.copyDM = (i) => {
  const t = (D.creators[i] || {}).dm_draft || '';
  if (navigator.clipboard) navigator.clipboard.writeText(t);
  const el = document.getElementById('dm-' + i);
  if (el) { el.style.background = 'rgba(62,125,84,.16)'; setTimeout(() => { el.style.background = ''; }, 700); }
};
window.openIG = (h) => window.open('https://instagram.com/' + String(h).replace('@', ''), '_blank');
window.creatorStatus = async (handle, status) => {
  try { await fetch(window.HQ_CONFIG.url + '/hq-creator-scout', { method: 'POST', headers: { Authorization: 'Bearer ' + window.HQ_CONFIG.anon, 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'status', handle, status }) }); } catch (e) { /* best-effort */ }
  D.creators = (D.creators || []).filter((x) => x.handle !== handle);
  render();
};

// Content queue
V.content = () => ({ title: 'Content queue', sub: 'What the agents built — nothing posts until you approve',
  html: `<div style="margin-bottom:18px"><button onclick="runAgents(this)" style="border:0;border-radius:11px;background:var(--ink);color:#F7F3EE;font:inherit;font-weight:700;font-size:13.5px;padding:12px 18px;cursor:pointer">🔄 Generate content now</button> <span style="color:var(--faint);font-size:12.5px;margin-left:8px">On-demand only — ~0.3¢ per run, nothing runs on its own.</span></div>
  ${D.briefing ? `<div style="margin-bottom:20px;max-width:980px">${briefingCard()}</div>` : ''}${!D.content.length ? empty('No drafts yet — tap “Generate content now.” The agents write a briefing + 3 on-brand drafts (~0.3¢) for you to review here. Nothing posts until you approve.') : ''}<div class="two">${D.content.map((c) => `<div class="contentcard">
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
        `<div class="toggle"><div><div class="cl" style="font-weight:700;font-size:14px">${a.name}</div><div class="cw" style="font-size:12px;color:var(--muted)">${a.text}${a.on ? ' · on-demand' : ' · not active yet'}</div></div><div class="sw ${a.on ? '' : 'off'}"><i></i></div></div>`).join('')}</section>
    </div></div>` });

// ── nav + router ───────────────────────────────────────────────────────
const NAV = [
  { v: 'overview', ic: '◎', label: 'Overview' },
  { group: 'GROW' }, { v: 'money', ic: '$', label: 'Money' }, { v: 'funnel', ic: '⛢', label: 'Funnel' }, { v: 'ads', ic: '◈', label: 'Ads' },
  { group: 'REACH' }, { v: 'social', ic: '❋', label: 'Social' }, { v: 'reviews', ic: '★', label: 'Reviews' }, { v: 'competitors', ic: '⚑', label: 'Competitors' }, { v: 'comments', ic: '❝', label: 'Comments' }, { v: 'creators', ic: '✦', label: 'Creators' },
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
    ${r.note ? `<div class="note">✅ <b>Live data only.</b> RevenueCat, App Store & the agents are connected. Empty sections fill in as you launch, grow, and connect Instagram/TikTok/Ads (Settings → Connect).</div>` : ''}
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
      const ap = {};
      d.metrics.forEach((x) => { if (x.source === 'apple' && !(x.metric in ap)) ap[x.metric] = Number(x.value); });
      if (Object.keys(ap).length) {
        D.social.apple.live = true;
        if (ap.testflight_testers != null) D.social.apple.testers = ap.testflight_testers;
        if (ap.builds != null) D.social.apple.builds = ap.builds;
        D.social.apple.downloads = ap.downloads ?? 0; // real (0 pre-launch), not the sample

        if (ap.rating) D.social.apple.rating = ap.rating;
        if (ap.reviews != null) D.social.apple.reviews = ap.reviews;
      }
    }
    if (d.creators) D.creators = d.creators.map((c) => ({ handle: c.handle, followers: c.followers, tier: c.tier, reply: c.reply_likelihood, pay: c.pay, why: c.why, dm_draft: c.dm_draft, status: c.status }));
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
