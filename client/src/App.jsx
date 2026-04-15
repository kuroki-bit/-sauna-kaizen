import { useState, useEffect } from "react";
import "./index.css";

const AREA_GROUPS = [
  {
    label: "東京都",
    options: ["新宿", "渋谷", "赤坂", "神田", "錦糸町", "後楽園", "両国", "下北沢", "代官山", "代々木上原", "麻布十番", "四谷三丁目", "大井町", "高輪"],
  },
  {
    label: "神奈川県",
    options: ["横浜", "川崎", "相模原", "藤沢", "厚木", "小田原"],
  },
  {
    label: "埼玉県",
    options: ["さいたま", "川越", "浦和", "大宮", "所沢", "越谷"],
  },
  {
    label: "千葉県",
    options: ["千葉", "船橋", "柏", "松戸", "市川", "成田"],
  },
  {
    label: "茨城県",
    options: ["水戸", "つくば", "土浦", "日立"],
  },
  {
    label: "栃木県",
    options: ["宇都宮", "小山", "栃木", "那須塩原"],
  },
  {
    label: "群馬県",
    options: ["前橋", "高崎", "太田", "伊勢崎"],
  },
];

function App() {
  const [page, setPage] = useState("landing"); // landing | certified | detail | apply
  const [saunas, setSaunas] = useState([]);
  const [selected, setSelected] = useState(null);
  const [stats, setStats] = useState(null);
  const [area, setArea] = useState("all");
  const [loading, setLoading] = useState(false);

  // Only show certified saunas (kaizenScore >= 75)
  const fetchCertified = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/saunas?sort=kaizen&area=${area}`);
      const data = await res.json();
      setSaunas(data.filter((s) => s.kaizenScore >= 75));
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/stats");
      setStats(await res.json());
    } catch (e) { console.error(e); }
  };

  const openDetail = async (slug) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/saunas/${slug}`);
      setSelected(await res.json());
      setPage("detail");
      window.scrollTo(0, 0);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => {
    if (page === "certified") fetchCertified();
  }, [page, area]);

  useEffect(() => { fetchStats(); }, []);

  const goCertified = () => { setPage("certified"); };

  const scoreColor = (score) => {
    if (score >= 90) return "text-emerald-400";
    if (score >= 80) return "text-amber-400";
    return "text-orange-400";
  };
  const scoreBg = (score) => {
    if (score >= 90) return "from-emerald-500 to-teal-500";
    if (score >= 80) return "from-amber-500 to-orange-500";
    return "from-orange-500 to-red-500";
  };
  const tierLabel = (score) => {
    if (score >= 90) return { label: "GOLD", color: "text-amber-300", bg: "bg-amber-500/15 border-amber-500/30" };
    if (score >= 80) return { label: "SILVER", color: "text-slate-300", bg: "bg-slate-500/15 border-slate-400/30" };
    return { label: "CERTIFIED", color: "text-orange-300", bg: "bg-orange-500/15 border-orange-500/30" };
  };

  const DarkBg = ({ children }) => (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(120,40,0,0.15)_0%,_transparent_50%),radial-gradient(ellipse_at_bottom_left,_rgba(100,30,0,0.1)_0%,_transparent_40%)] bg-slate-950" />
      <div className="absolute top-[40%] left-[5%] w-72 h-72 bg-orange-950/20 rounded-full blur-3xl animate-float" />
      <div className="absolute top-[70%] right-[5%] w-96 h-96 bg-red-950/20 rounded-full blur-[120px] animate-float-delay" />
      <div className="absolute bottom-[10%] left-[40%] w-80 h-80 bg-amber-950/15 rounded-full blur-3xl animate-float-delay-2" />
      <div className="absolute inset-0 opacity-[0.01]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
      {/* Steam layers */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="steam-layer steam-a" />
        <div className="steam-layer steam-b" />
        <div className="steam-layer steam-c" />
        <div className="steam-layer steam-d" />
        <div className="steam-fog" />
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  );

  const Nav = ({ children }) => (
    <nav className="glass border-b border-white/[0.06] sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <button onClick={() => setPage("landing")} className="flex items-center gap-2">
          <span className="text-2xl">🔥</span>
          <span className="text-xl font-bold text-white tracking-tight">タルコットサウナガイド</span>
        </button>
        <div className="flex items-center gap-3">{children}</div>
      </div>
    </nav>
  );

  // ========================
  // LANDING PAGE
  // ========================
  if (page === "landing") return (
    <DarkBg>
      <nav className="relative z-10 max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🔥</span>
          <span className="text-xl font-bold text-white">タルコットサウナガイド</span>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => setPage("apply")} className="text-sm text-white/50 hover:text-white transition-colors">施設の掲載申請</button>
          <button onClick={goCertified} className="text-sm px-5 py-2 bg-white/[0.06] border border-white/10 text-white rounded-full hover:bg-white/20 transition-all">
            認定施設を見る
          </button>
        </div>
      </nav>

      <section className="relative z-10 max-w-6xl mx-auto px-6 pt-24 pb-32 lg:pt-32 lg:pb-40">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/[0.03] border border-white/[0.06] rounded-full text-sm text-orange-300 mb-8 animate-fade-in-up">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            声に応える施設だけを掲載
          </div>
          <h1 className="text-5xl lg:text-7xl font-extrabold text-white leading-tight mb-6 animate-fade-in-up">
            居心地は、<br />
            <span className="shimmer-text">声から始まる。</span>
          </h1>
          <p className="text-lg lg:text-xl text-white/60 leading-relaxed mb-10 max-w-xl animate-fade-in-up-delay">
            Google評価だけでは分からない。<br />
            お客さんの声に応え、一緒に進化する施設だけを紹介。<br />
            独自の「改善力」指標で認定されたサウナガイドです。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up-delay-2">
            <button onClick={goCertified} className="group relative px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-2xl text-lg hover:shadow-2xl hover:shadow-orange-500/25 transition-all duration-300 hover:-translate-y-0.5">
              <span className="flex items-center justify-center gap-2">
                認定施設を見る
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
              </span>
            </button>
            <a href="#about" className="px-8 py-4 border border-white/10 text-white/80 font-medium rounded-2xl text-lg hover:bg-white/[0.03] transition-all text-center">
              改善力認定とは
            </a>
          </div>
        </div>

        {/* Floating cards */}
        <div className="hidden lg:block absolute top-24 right-0 w-[340px]">
          <div className="glass-dark border border-amber-500/20 rounded-2xl p-6 rotate-2 animate-float">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs px-2.5 py-1 bg-amber-500/15 border border-amber-500/30 text-amber-300 rounded-full font-bold tracking-wider">GOLD</span>
              <span className="text-white/30 text-xs">改善力認定</span>
            </div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center text-white font-bold text-sm">96</div>
              <div>
                <p className="text-white font-semibold text-sm">オールドルーキーサウナ</p>
                <p className="text-white/40 text-xs">麻布十番</p>
              </div>
            </div>
          </div>
          <div className="glass-dark border border-slate-400/20 rounded-2xl p-6 -rotate-2 mt-4 ml-8 animate-float-delay">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs px-2.5 py-1 bg-slate-500/15 border border-slate-400/30 text-slate-300 rounded-full font-bold tracking-wider">SILVER</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center text-white font-bold text-sm">88</div>
              <div>
                <p className="text-white font-semibold text-sm">由縁別邸 代田</p>
                <p className="text-white/40 text-xs">下北沢</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tier Explanation */}
      <section id="about" className="relative z-10 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-6 py-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">改善力認定とは</h2>
            <p className="text-white/50 text-lg">お客さんの声に真摯に向き合うサウナを、3つのティアで認定</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {[
              { tier: "GOLD", score: "90+", color: "amber", desc: "業界トップクラスの改善力。お客さんの声にほぼ全て応え、常に進化し続けている施設。", border: "border-amber-500/30", bg: "bg-amber-500/10" },
              { tier: "SILVER", score: "80-89", color: "slate", desc: "高い改善意識を持ち、積極的にフィードバックを活かしている施設。", border: "border-slate-400/30", bg: "bg-slate-500/10" },
              { tier: "CERTIFIED", score: "75-79", color: "orange", desc: "改善力の基準を満たし、お客さんの声を大切にしている施設。", border: "border-orange-500/30", bg: "bg-orange-500/10" },
            ].map((t) => (
              <div key={t.tier} className={`glass-dark border ${t.border} rounded-2xl p-8 text-center hover:scale-105 transition-all duration-300`}>
                <span className={`inline-block text-sm px-4 py-1.5 ${t.bg} border ${t.border} text-${t.color}-300 rounded-full font-bold tracking-wider mb-4`}>{t.tier}</span>
                <p className="text-3xl font-black text-white mb-2">{t.score}</p>
                <p className="text-white/40 text-sm">{t.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mb-16">
            <h3 className="text-2xl font-bold text-white mb-8">5つの評価軸</h3>
          </div>
          <div className="grid md:grid-cols-5 gap-6">
            {[
              { icon: "📣", title: "応答率", desc: "お客さんの声にどれだけ反応しているか" },
              { icon: "⚡", title: "改善速度", desc: "指摘からどれだけ早く改善しているか" },
              { icon: "📈", title: "満足度推移", desc: "満足度が向上傾向にあるか" },
              { icon: "🔄", title: "リピート率", desc: "常連がどれだけ定着しているか" },
              { icon: "✨", title: "独自性", desc: "他にない体験を提供しているか" },
            ].map((item, i) => (
              <div key={i} className="glass-dark border border-white/[0.06] rounded-2xl p-6 text-center hover:border-white/10 transition-all">
                <span className="text-3xl block mb-3">{item.icon}</span>
                <h3 className="text-white font-bold mb-1">{item.title}</h3>
                <p className="text-white/40 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA for owners */}
      <section className="relative z-10 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-6 py-24 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">あなたのサウナも認定しませんか？</h2>
          <p className="text-white/50 text-lg mb-8 max-w-2xl mx-auto">
            改善力認定を受けた施設は、タルコットサウナガイドに掲載されます。<br />
            お客さんの匿名フィードバックを集めて、改善力を可視化しましょう。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => setPage("apply")} className="px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-2xl text-lg hover:shadow-2xl hover:shadow-orange-500/25 transition-all duration-300 hover:-translate-y-0.5">
              掲載を申請する（無料）
            </button>
          </div>
          <p className="text-white/30 text-sm mt-4">Revvö導入施設は自動的に改善力スコアが算出されます</p>
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-6 py-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">🔥</span>
            <span className="text-sm font-semibold text-white/60">タルコットサウナガイド</span>
          </div>
          <p className="text-xs text-white/30">Powered by Revvö Analytics</p>
        </div>
      </footer>
    </DarkBg>
  );

  // ========================
  // CERTIFIED SAUNAS PAGE
  // ========================
  if (page === "certified") return (
    <DarkBg>
      <Nav>
        <button onClick={() => setPage("apply")} className="text-sm text-white/50 hover:text-white transition-colors">掲載申請</button>
        <button onClick={goCertified} className="text-sm text-orange-400 font-medium">認定施設</button>
      </Nav>
      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-10 animate-fade-in-up">
          <h2 className="text-3xl font-bold text-white mb-2">改善力認定サウナ</h2>
          <p className="text-white/50">お客さんの声に真摯に向き合う、認定されたサウナだけを掲載</p>
        </div>

        {/* Sample data notice */}
        <div className="max-w-5xl mx-auto mb-8">
          <div className="flex items-center gap-3 px-5 py-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-sm text-amber-300/80">
            <span className="text-lg shrink-0">🔔</span>
            <p>現在掲載中の施設はRevvö導入後のイメージです。実際の認定施設は順次掲載予定。掲載をご希望の施設オーナー様は<button onClick={() => setPage("apply")} className="underline underline-offset-2 hover:text-amber-200 transition-colors">こちら</button>からご確認ください。</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-8 justify-center animate-fade-in-up-delay">
          <select value={area} onChange={(e) => setArea(e.target.value)} className="text-sm px-4 py-2 rounded-full bg-white/[0.03] text-white/70 border border-white/[0.06] outline-none [color-scheme:dark]">
            <option value="all">全関東</option>
            {AREA_GROUPS.map((group) => (
              <optgroup key={group.label} label={group.label}>
                <option value={group.label}>{group.label}（全域）</option>
                {group.options.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-orange-500 to-red-500 animate-pulse-ring" />
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {saunas.map((s, i) => {
              const tier = tierLabel(s.kaizenScore);
              return (
                <button key={s.slug} onClick={() => openDetail(s.slug)} className="text-left glass-dark border border-white/[0.06] rounded-2xl overflow-hidden hover:border-white/10 transition-all duration-300 hover:-translate-y-1 group" style={{ animation: `fadeInUp 0.5s ease-out ${i * 80}ms forwards`, opacity: 0 }}>
                  {/* Tier bar */}
                  <div className={`h-1.5 bg-gradient-to-r ${scoreBg(s.kaizenScore)}`} />
                  <div className="p-6">
                    {/* Tier badge */}
                    <div className="flex items-center justify-between mb-4">
                      <span className={`text-xs px-2.5 py-1 ${tier.bg} border rounded-full font-bold tracking-wider ${tier.color}`}>{tier.label}</span>
                      <span className={`text-2xl font-black ${scoreColor(s.kaizenScore)}`}>{s.kaizenScore}</span>
                    </div>

                    {/* Name */}
                    <h3 className="font-bold text-white text-lg mb-1">{s.name}</h3>
                    <p className="text-xs text-white/40 mb-2">{s.area}</p>
                    {s.tags.includes("Revvö導入中") && (
                      <span className="inline-block text-[10px] px-2.5 py-1 bg-teal-500/15 border border-teal-500/30 text-teal-300 rounded-full font-bold mb-3">✦ Revvö導入中（イメージ）</span>
                    )}

                    {/* Description */}
                    <p className="text-sm text-white/50 leading-relaxed mb-4 line-clamp-2">{s.description}</p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {s.tags.map((t) => (
                        <span key={t} className="text-[10px] px-2 py-0.5 bg-orange-500/10 text-orange-300/70 rounded-full">{t}</span>
                      ))}
                    </div>

                    {/* Strengths preview */}
                    <div className="space-y-1 mb-4">
                      {s.strengths.slice(0, 2).map((str, j) => (
                        <div key={j} className="flex items-center gap-1.5">
                          <span className="text-emerald-400 text-xs">+</span>
                          <span className="text-xs text-white/40 truncate">{str}</span>
                        </div>
                      ))}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-white/5">
                      <div className="text-xs text-white/30">
                        Google <strong className="text-white/50">{s.googleScore}</strong> ({s.googleReviews}件)
                      </div>
                      <span className="text-xs text-orange-400 font-medium group-hover:underline">詳細 →</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* CTA for owners */}
        <div className="mt-16 text-center glass-dark border border-orange-500/20 rounded-3xl p-8 max-w-2xl mx-auto">
          <h3 className="text-xl font-bold text-white mb-2">あなたのサウナも掲載しませんか？</h3>
          <p className="text-white/50 mb-4 text-sm">改善力認定を受けると、タルコットサウナガイドに無料で掲載されます。</p>
          <button onClick={() => setPage("apply")} className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-orange-500/25 transition-all">
            掲載を申請する →
          </button>
        </div>
      </main>
    </DarkBg>
  );

  // ========================
  // DETAIL PAGE
  // ========================
  if (page === "detail" && selected) {
    const s = selected;
    const d = s.kaizenDetails;
    const tier = tierLabel(s.kaizenScore);
    const metrics = [
      { key: "応答率", val: d.responseRate, icon: "📣" },
      { key: "改善速度", val: d.improvementSpeed, icon: "⚡" },
      { key: "満足度推移", val: d.customerSatisfactionTrend, icon: "📈" },
      { key: "リピート率", val: d.repeatRate, icon: "🔄" },
      { key: "独自性", val: d.uniqueness, icon: "✨" },
    ];

    return (
      <DarkBg>
        <Nav>
          <button onClick={goCertified} className="text-sm text-white/50 hover:text-white transition-colors">← 認定施設一覧</button>
        </Nav>
        <main className="max-w-4xl mx-auto px-6 py-12">
          {/* Header */}
          <div className="glass-dark border border-white/[0.06] rounded-3xl p-8 mb-8 animate-fade-in-up">
            <div className="flex items-start gap-6 flex-wrap">
              <div className={`w-20 h-20 bg-gradient-to-br ${scoreBg(s.kaizenScore)} rounded-3xl flex items-center justify-center shrink-0`}>
                <span className="text-white font-black text-3xl">{s.kaizenScore}</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <span className={`text-xs px-2.5 py-1 ${tier.bg} border rounded-full font-bold tracking-wider ${tier.color}`}>{tier.label}</span>
                  <span className="text-sm text-white/30">改善力認定</span>
                </div>
                <h1 className="text-2xl lg:text-3xl font-bold text-white mb-1">{s.name}</h1>
                {s.tags.includes("Revvö導入中") && (
                  <span className="inline-block text-xs px-3 py-1 bg-teal-500/15 border border-teal-500/30 text-teal-300 rounded-full font-bold mb-2">✦ Revvö導入中（イメージ）</span>
                )}
                <p className="text-sm text-white/40 mb-3">{s.area} ・ {s.address}</p>
                <p className="text-white/50 leading-relaxed">{s.description}</p>
              </div>
            </div>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-5 gap-3 mb-8 animate-fade-in-up-delay">
            {metrics.map((m) => (
              <div key={m.key} className="glass-dark border border-white/[0.06] rounded-2xl p-4 text-center">
                <span className="text-2xl block mb-1">{m.icon}</span>
                <p className={`text-2xl font-bold ${scoreColor(m.val)}`}>{m.val}</p>
                <p className="text-xs text-white/40 mt-1">{m.key}</p>
              </div>
            ))}
          </div>

          {/* Strengths only (no "improvements" to avoid negativity) */}
          <div className="glass-dark border border-emerald-500/20 rounded-2xl p-6 mb-8 animate-fade-in-up">
            <h3 className="font-bold text-emerald-400 mb-4 flex items-center gap-2"><span className="text-xl">💪</span> この施設の強み</h3>
            <ul className="space-y-2">
              {s.strengths.map((str, i) => (
                <li key={i} className="text-sm text-white/60 flex items-start gap-2">
                  <span className="text-emerald-400 mt-0.5">+</span>{str}
                </li>
              ))}
            </ul>
          </div>

          {/* Voice Examples (positive framing) */}
          <div className="glass-dark border border-white/[0.06] rounded-2xl p-6 mb-8 animate-fade-in-up-delay">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2"><span className="text-xl">💬</span> お客さんの声</h3>
            <div className="space-y-3">
              {s.voiceExamples.map((v, i) => (
                <div key={i} className="bg-white/[0.03] border border-white/5 rounded-xl px-4 py-3 text-sm text-white/60">
                  「{v}」
                </div>
              ))}
            </div>
            <p className="text-xs text-white/20 mt-4">※ 公開口コミから抽出した代表的な声です</p>
          </div>

          {/* Google info */}
          <div className="glass-dark border border-white/[0.06] rounded-2xl p-6 mb-8 flex items-center justify-between">
            <div>
              <p className="text-white/40 text-sm">Google評価</p>
              <p className="text-2xl font-bold text-white">{s.googleScore} <span className="text-sm text-white/30">/ 5.0</span></p>
            </div>
            <div>
              <p className="text-white/40 text-sm">口コミ件数</p>
              <p className="text-2xl font-bold text-white">{s.googleReviews.toLocaleString()} <span className="text-sm text-white/30">件</span></p>
            </div>
            <div className="flex gap-1.5">
              {s.tags.map((t) => (
                <span key={t} className="text-xs px-2.5 py-1 bg-orange-500/10 text-orange-300/70 rounded-full">{t}</span>
              ))}
            </div>
          </div>

          {/* Owner CTA */}
          <div className="glass-dark border border-orange-500/20 rounded-3xl p-8 text-center animate-fade-in-up">
            <p className="text-white/40 text-sm mb-2">施設オーナーの方へ</p>
            <h3 className="text-xl font-bold text-white mb-3">あなたの施設も改善力を可視化しませんか？</h3>
            <p className="text-white/50 text-sm mb-6 max-w-md mx-auto">
              Revvöを導入すると、お客さんの匿名フィードバックが届き、改善力スコアが自動で算出されます。スコア75以上でタルコットサウナガイドに無料掲載。
            </p>
            <a
              href="https://revvo-sooty.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-2xl text-lg hover:shadow-2xl hover:shadow-orange-500/25 transition-all duration-300 hover:-translate-y-0.5"
            >
              Revvöを3ヶ月無料で始める →
            </a>
            <p className="text-white/25 text-xs mt-4">トライアル期間中も改善力スコアが算出されます</p>
          </div>
        </main>
      </DarkBg>
    );
  }

  // ========================
  // APPLY PAGE
  // ========================
  if (page === "apply") return (
    <DarkBg>
      <Nav>
        <button onClick={goCertified} className="text-sm text-white/50 hover:text-white transition-colors">認定施設</button>
      </Nav>
      <main className="max-w-2xl mx-auto px-6 py-12">
        <div className="text-center mb-10 animate-fade-in-up">
          <h2 className="text-3xl font-bold text-white mb-2">掲載を申請する</h2>
          <p className="text-white/50">改善力認定を受けて、タルコットサウナガイドに掲載されましょう</p>
        </div>

        <div className="glass-dark border border-white/[0.06] rounded-3xl p-8 mb-8 animate-fade-in-up-delay">
          {/* Steps */}
          <div className="space-y-8 mb-10">
            {[
              { step: "01", title: "Revvöを導入", desc: "QRコードを設置するだけ。お客さんの匿名フィードバックが届きます。", color: "text-orange-400" },
              { step: "02", title: "改善力スコアが自動算出", desc: "フィードバックへの応答率・改善速度などから、AIが自動でスコアを算出。", color: "text-amber-400" },
              { step: "03", title: "認定基準を満たせば掲載", desc: "改善力スコア75以上で自動的に「改善力認定サウナ」として掲載されます。", color: "text-emerald-400" },
            ].map((s) => (
              <div key={s.step} className="flex gap-5">
                <div className={`text-4xl font-black ${s.color} opacity-30 shrink-0 w-12`}>{s.step}</div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">{s.title}</h3>
                  <p className="text-sm text-white/50">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Benefits */}
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 mb-8">
            <h3 className="font-bold text-white mb-3">掲載のメリット</h3>
            <ul className="space-y-2">
              {[
                "タルコットサウナガイドからの集客（サウナ好きユーザーに直接リーチ）",
                "改善力認定バッジを店頭・SNSで使用可能",
                "お客さんの本音が匿名で届き、サービス改善に直結",
                "掲載料は無料（Revvö Standard ¥9,800/月のみ）",
              ].map((b, i) => (
                <li key={i} className="text-sm text-white/60 flex items-start gap-2">
                  <span className="text-emerald-400 mt-0.5">&#x2713;</span>{b}
                </li>
              ))}
            </ul>
          </div>

          {/* CTA */}
          <div className="text-center">
            <a href="https://revvo-sooty.vercel.app/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-2xl text-lg hover:shadow-2xl hover:shadow-orange-500/25 transition-all duration-300 hover:-translate-y-0.5">
              Revvö を3ヶ月無料で始める →
            </a>
            <p className="text-white/30 text-sm mt-4">3ヶ月無料トライアル中も改善力スコアが算出されます</p>
          </div>
        </div>

        {/* After signup flow */}
        <div className="glass-dark border border-white/[0.06] rounded-3xl p-8 animate-fade-in-up-delay">
          <h3 className="font-bold text-white mb-6 flex items-center gap-2">
            <span className="text-lg">📋</span> Revvö導入後の掲載までの流れ
          </h3>
          <div className="space-y-5">
            {[
              { icon: "📲", title: "Revvöに登録・QRを設置", desc: "登録後、QRコードを施設内に貼るだけで利用開始できます。" },
              { icon: "💬", title: "お客さんの声が届き始める", desc: "来店したお客さんがQRから匿名で投稿。声への対応を続けることでスコアが上がっていきます。" },
              { icon: "📈", title: "改善力スコアが75を超えたら", desc: "スコアが認定基準（75点）を超えたタイミングで、タルコットサウナガイドへの掲載を申請できます。" },
              { icon: "✉️", title: "掲載申請はこちらに連絡", desc: "スコアが基準を超えたら、Revvöの担当者までご連絡ください。確認後、順次掲載します。" },
            ].map((item, i) => (
              <div key={i} className="flex gap-4 items-start">
                <span className="text-2xl shrink-0">{item.icon}</span>
                <div>
                  <p className="text-white font-semibold text-sm mb-0.5">{item.title}</p>
                  <p className="text-white/40 text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </DarkBg>
  );

  return null;
}

export default App;
