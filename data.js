// Fulfilled HQ — local defaults / honest empty states.
// Real numbers come from the backend (loadLive() in app.js): the agent briefing,
// content drafts, run log, the $ budget/cap, RevenueCat money, Apple stats, and
// scouted creators. Anything with NO live source yet sits EMPTY here on purpose
// — no fake numbers. Instagram / TikTok / Facebook / Ads stay empty until those
// accounts are connected (needs the adult-owned Meta/TikTok setup).

window.DATA = {
  updated: 'Live · ' + new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }),

  // Money — filled by RevenueCat once you have subscribers. $0 before launch.
  money: {
    mrr: 0, goal: 1000, activeSubs: 0, trials: 0,
    mrrSeries: [], subsSeries: [], plans: [], retention: [], transactions: [],
  },

  // Funnel — needs ads + installs flowing. Empty until then.
  funnel: [],

  // Ads — needs Meta Ads connected (adult account). Not running ads yet.
  ads: { connected: false, spend: 0, cpi: 0, cps: 0, roas: 0, spendSeries: [], creatives: [] },

  social: {
    instagram: { connected: false, followers: 0, delta: 0, reach: '—', eng: '—', series: [], posts: [] },
    tiktok:    { connected: false, followers: 0, delta: 0, reach: '—', eng: '—', series: [], posts: [] },
    facebook:  { connected: false, followers: 0, delta: 0, reach: '—', eng: '—', series: [], posts: [] },
    // Apple is real — loadLive() fills testers / builds / rating from hq-apple.
    apple:     { live: false, testers: 0, builds: 0, downloads: 0, rating: 0, reviews: 0, delta: 0, conv: 0, series: [], posts: [] },
  },

  // Reviews — pulled from the App Store once the app is live + has reviews.
  reviews: { breakdown: { pos: 0, neu: 0, neg: 0 }, items: [] },

  // Competitor watch (Meta Ad Library) — not wired up yet.
  competitors: [],

  // Comments — needs IG/TikTok connected.
  comments: [],

  // Content drafts — filled by the agents (real). Tap "Generate content now".
  content: [],

  // Creators — filled by the Scout (real). Tap "Find creators now".
  creators: [],

  // Alerts — filled by the Analyst (real) once there's activity to flag.
  alerts: [],

  // The agent fleet. Scout + Writer are live (on-demand). The rest are not built
  // yet (Studio/Analyst/Planner = later phases; Publisher = Phase 3 posting).
  agents: [
    { name: 'Scout',     text: 'Trend research → daily briefing', t: '', on: true },
    { name: 'Writer',    text: 'Hooks, captions, scripts, ad copy', t: '', on: true },
    { name: 'Studio',    text: 'Builds videos & carousels',        t: '', on: false },
    { name: 'Analyst',   text: 'Watches MRR / ROAS / post perf',   t: '', on: false },
    { name: 'Planner',   text: 'Calendar + budget split',          t: '', on: false },
    { name: 'Publisher', text: 'Approved posting',                 t: '', on: false },
  ],

  connections: [
    { name: 'RevenueCat',         what: 'MRR, subscribers, trials',  status: 'on' },
    { name: 'App Store Connect',  what: 'TestFlight, builds, rating', status: 'on' },
    { name: 'Instagram',          what: 'Followers, reach, posts',    status: 'off' },
    { name: 'TikTok',             what: 'Followers, views, posts',    status: 'off' },
    { name: 'Facebook + Meta Ads', what: 'Ad spend, ROAS',           status: 'off' },
  ],

  // Real cap comes from the backend ($5/mo). This is just the pre-load default.
  budget: { cap: 5, used: 0 },
};
