// Fulfilled HQ — mock data layer.
// This is the ONLY file that changes when we connect real accounts: each block
// below gets replaced by a live fetch (RevenueCat, Meta, TikTok, App Store).
// Until then these realistic sample numbers let us build + see every screen.

window.DATA = {
  updated: 'Saturday, June 21 · 10:24pm',

  money: {
    mrr: 312, mrrDelta: 18, goal: 1000,
    activeSubs: 78, subsDelta: 12,
    trials: 24, trialsDelta: 6,
    trialToPaid: 41, t2pDelta: 4,
    churn: 6.2, churnDelta: -1.1,
    ltv: 43, ltvDelta: 3,
    arpu: 4.0,
    mrrSeries: [96,112,108,134,150,168,190,210,238,262,290,312],
    subsSeries: [22,28,31,38,44,51,58,63,68,71,74,78],
    plans: [
      { name: 'Weekly · $3.99', subs: 71, pct: 91 },
      { name: 'Trials converting', subs: 7, pct: 9 },
    ],
    retention: [100, 82, 71, 64, 58, 54, 51], // day 0,1,3,7,14,30,60 %
    transactions: [
      { who: '@dreaming_clearly', what: 'Trial → Paid', amt: '+$3.99', t: '2h ago' },
      { who: '@quietgrowth', what: 'Renewal', amt: '+$3.99', t: '4h ago' },
      { who: '@m.calderon', what: 'Refund', amt: '-$3.99', t: '1d ago', neg: true },
      { who: '@late.bloomer', what: 'New trial', amt: '$0.00', t: '1d ago' },
    ],
  },

  funnel: [
    { stage: 'Ad impressions', n: 48200, w: 100, note: '—' },
    { stage: 'Installs', n: 1240, w: 34, sub: '2.6% of impressions', note: '$0.34 / install' },
    { stage: 'Free trials', n: 312, w: 18, sub: '25% of installs', note: '25% start trial' },
    { stage: 'Paid', n: 128, w: 11, sub: '41% of trials', note: '$3.28 / sub' },
  ],

  ads: {
    spend: 420, cpi: 0.34, cps: 3.28, roas: 1.7,
    spendSeries: [8,10,9,12,14,13,15,16,14,18,20,22,19,21],
    creatives: [
      { name: '“Overthinking” · 10s', spend: 180, roas: 2.4, installs: 96, tag: 'scale', plat: 'IG + TikTok' },
      { name: '“The Two Yous” · 10s', spend: 140, roas: 1.9, installs: 72, tag: 'watch', plat: 'IG' },
      { name: '“Day 1 → Day 30” · 10s', spend: 100, roas: 1.1, installs: 38, tag: 'cut', plat: 'TikTok' },
    ],
  },

  social: {
    instagram: { followers: 2140, delta: 182, reach: '64.1k', eng: '7.8%', series:[1180,1320,1450,1610,1740,1880,1990,2140],
      posts: [ {t:'“3 a.m. again”', v:'38k', s:'2.1k saves'}, {t:'“Become the one…”', v:'21k', s:'940 saves'}, {t:'Carousel · Belief', v:'12k', s:'610 saves'} ] },
    tiktok: { followers: 5720, delta: 910, reach: '221k', eng: '11.2%', series:[2100,2680,3150,3700,4200,4810,5240,5720],
      posts: [ {t:'“Day 1 → 30”', v:'86k', s:'4.4k likes'}, {t:'“3 a.m. again”', v:'52k', s:'3.1k likes'}, {t:'POV: you start', v:'31k', s:'1.8k likes'} ] },
    facebook: { followers: 412, delta: 28, reach: '12.0k', eng: '3.1%', series:[210,250,280,300,330,360,390,412],
      posts: [ {t:'Boosted: Overthinking', v:'9.4k', s:'from ads'}, {t:'Link: download', v:'2.1k', s:'88 clicks'} ] },
    apple: { downloads: 1240, delta: 96, rating: 4.7, conv: 2.1, series:[120,260,410,560,720,910,1080,1240],
      posts: [ {t:'Search: “manifest”', v:'rank 24', s:'↑6'}, {t:'Search: “affirmations”', v:'rank 41', s:'↑3'} ] },
  },

  reviews: {
    breakdown: { pos: 72, neu: 18, neg: 10 },
    items: [
      { stars: 5, chip: 'pos', text: 'The morning scripts actually feel like me. First app that didn’t feel cheesy.', who: '@dreaming_clearly', t: '2h ago' },
      { stars: 4, chip: 'idea', text: 'Love it. Wish the widget showed my streak.', who: '@quietgrowth', t: '6h ago' },
      { stars: 2, chip: 'neg', text: 'Got charged after the trial, didn’t realize.', who: '@m.calderon', t: '1d ago' },
      { stars: 5, chip: 'pos', text: 'Day 12 and I actually believe it now. The belief tracker is genius.', who: '@steady_rise', t: '2d ago' },
    ],
  },

  competitors: [
    { name: 'Mindset', ads: 14, note: 'Pushing a “21-day” hook · mostly testimonial UGC', spend: 'High' },
    { name: 'Affirm Daily', ads: 6, note: 'New $2.99/wk price point · text-on-gradient ads', spend: 'Medium' },
    { name: 'Mantra', ads: 9, note: 'Heavy faceless UGC · trending audios', spend: 'Medium' },
    { name: 'RisingYou', ads: 3, note: 'Just launched · copying the before/after format', spend: 'Low' },
  ],

  comments: [
    { who: '@late.bloomer', plat: 'IG', chip: 'idea', text: 'is this just affirmations or does it actually do more?' },
    { who: '@bigdreams22', plat: 'TikTok', chip: 'pos', text: 'downloaded immediately 😭 the 3am one got me' },
    { who: '@skeptic_sam', plat: 'TikTok', chip: 'neg', text: 'manifestation isn’t real lol' },
    { who: '@nina.k', plat: 'IG', chip: 'idea', text: 'does it work if I’ve never done this before?' },
    { who: '@coachmarc', plat: 'IG', chip: 'pos', text: 'recommending this to my whole client list' },
  ],

  content: [
    { type: 'Video · 10s', title: '“Overthinking”', by: 'Studio', for: 'IG + TikTok', status: 'ready', thumb: 'thumb-overthinking.png',
      caption: 'The 3am spiral, or a script for who you’re becoming. Which one wins tomorrow? ✨ #manifest #fulfilled' },
    { type: 'Carousel · 6', title: 'Belief, day by day', by: 'Studio', for: 'Instagram', status: 'ready', thumb: '',
      caption: 'Watch belief grow. Day 1 → Day 30. Save this for when you doubt yourself.' },
    { type: 'Hooks · 4', title: 'New hook variations', by: 'Writer', for: 'Scripts', status: 'review', thumb: '',
      caption: '1) “You’re not behind.”  2) “Read this at 3am.”  3) “The you that already has it.”  4) “Stop rehearsing the worst case.”' },
    { type: 'Ad copy · 3', title: 'Meta ad headlines', by: 'Writer', for: 'Ads', status: 'review', thumb: '',
      caption: 'Become the person who already has it · A 90-second script, written for you · Doubt less. Become more.' },
  ],

  creators: [
    { handle: '@manifestwithmahe', followers: '~18k', tier: '10–50k', reply: 'High', pay: 'Free Pro + 30% affiliate, ~$50–120/post', why: 'Warm, personal subconscious-reprogramming content — real voice, engaged niche.', dm_draft: 'Hey Mahe — your framing around subconscious reprogramming genuinely stands out. We’re building Fulfilled, an AI manifestation coach that writes your full daily practice and tracks belief as it grows — we’d love to offer you free Pro + an affiliate partnership. Open to a quick chat?', status: 'new' },
    { handle: '@dreamingclearly', followers: '~31k', tier: '10–50k', reply: 'High', pay: 'Free Pro + 30% affiliate, ~$80–180/post', why: 'Daily law-of-attraction reflections to camera, strong saves on routine posts.', dm_draft: 'Hi! Your daily reflections feel so genuine — exactly the energy we love. We made Fulfilled, an app that writes your whole manifestation practice for you. We’d love to gift you free Pro + set up an affiliate deal. Up for trying it?', status: 'new' },
    { handle: '@thequietmanifestor', followers: '~74k', tier: '50–100k', reply: 'Medium', pay: 'Free Pro + 25% affiliate, ~$200–400/Reel', why: 'Calm, cinematic Reels on self-concept — high production, loyal audience.', dm_draft: 'Hi! The calm, cinematic feel of your Reels is exactly the vibe of what we’re building — Fulfilled, an AI coach that writes your daily manifestation practice. We’d love to gift you Pro and set up a paid + affiliate partnership. Could I send more?', status: 'new' },
    { handle: '@risingfrequency', followers: '~140k', tier: '100–200k', reply: 'Medium', pay: 'Free Pro + 20% affiliate + ~$400–700/Reel', why: 'Mindset + neuroscience angle, broad reach, frequent brand collabs.', dm_draft: 'Hey! Your mindset + neuroscience angle is such a strong fit for Fulfilled — an app that writes your whole daily manifestation practice. We’d love to put together a paid partnership + affiliate deal. Who’s best to talk numbers with?', status: 'new' },
  ],

  alerts: [
    { k: 'win', text: 'MRR crossed <b>$300</b> 🎉', t: '26 min ago' },
    { k: 'viral', text: 'TikTok “Day 1→30” is taking off — <b>86k views</b>', t: '1h ago' },
    { k: 'win', text: '“Overthinking” ad hit <b>2.4× ROAS</b> — Analyst says scale', t: '3h ago' },
    { k: 'warn', text: '“Day 1→30” ad ROAS under <b>1.2×</b> — consider cutting', t: '3h ago' },
    { k: 'info', text: '<b>3 new</b> App Store reviews (avg 4.0★)', t: '5h ago' },
  ],

  agents: [
    { name: 'Scout', text: 'found 6 trending audios + 3 competitor hooks', t: '12 min ago', on: true },
    { name: 'Writer', text: 'drafted 4 new hooks for “Overthinking”', t: '40 min ago', on: true },
    { name: 'Studio', text: 'rendered 1 video — awaiting your approval', t: '1h ago', on: true },
    { name: 'Analyst', text: 'flagged 1 ad to scale, 1 to cut', t: '3h ago', on: true },
    { name: 'Planner', text: 'proposed next week’s posting calendar', t: '5h ago', on: true },
    { name: 'Publisher', text: 'idle — turns on in Phase 3', t: '—', on: false },
  ],

  connections: [
    { name: 'RevenueCat', what: 'MRR, subscribers, trials', status: 'off' },
    { name: 'App Store Connect', what: 'Downloads, ratings, search', status: 'off' },
    { name: 'Instagram', what: 'Followers, reach, posts', status: 'off' },
    { name: 'TikTok', what: 'Followers, views, posts', status: 'off' },
    { name: 'Facebook + Meta Ads', what: 'Ad spend, ROAS', status: 'off' },
  ],

  budget: { cap: 25, used: 0 },
};
