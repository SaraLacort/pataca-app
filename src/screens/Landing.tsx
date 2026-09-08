import React, { useEffect, useRef, useState } from "react";

/**
 * Pataca — Landing page (single-file React component)
 * Self-contained: uses Tailwind arbitrary values + a tiny <style> block.
 * Drop this file into your site and render <PatacaLanding />.
 */

const GOLD = "#d4af37";
const GOLD_LIGHT = "#eebc3f";
const INK_950 = "#0a0a0a";
const INK_900 = "#0c0c0c";
const INK_850 = "#121212";
const INK_800 = "#1a1a1a";
const INK_600 = "#2a2a2a";
const MUTED = "#a0a0a0";
const MUTED_DARK = "#808080";

const SCREENS = [
  {
    id: "dashboard",
    tag: "Visão geral",
    title: "Seu acervo em um painel",
    desc: "Veja quantas moedas diferentes você tem, quantas está buscando e quantas coleções estão ativas. Acompanhe o progresso de cada país com barras visuais e acesse suas coleções em um clique.",
    bullets: ["Cards de estatísticas em tempo real", "Progresso por país com barras", "Atalho direto para suas coleções"],
    img: "https://media.base44.com/images/public/6aa03ed3a9f5127b8e02dcc3/b466a6d81_image.png",
    alt: "Tela de Visão geral do Pataca",
  },
  {
    id: "colecoes",
    tag: "Minhas coleções",
    title: "Cada moeda no lugar certo",
    desc: "Filtre por país e por status — Tenho, Buscando ou Favoritas. Cada moeda mostra foto, ano, moeda e a quantidade de repetidas, com um selo verde para o que já está no seu acervo.",
    bullets: ["Grade responsiva de moedas", "Filtros por país e status", "Contagem de repetidas"],
    img: "https://media.base44.com/images/public/6aa03ed3a9f5127b8e02dcc3/5cefa0a2f_image.png",
    alt: "Tela de Minhas coleções do Pataca",
  },
  {
    id: "catalogo",
    tag: "Catálogo",
    title: "Busque qualquer moeda",
    desc: "Pesquise por nome, ano, valor, país ou material. Use os filtros de plano monetário, país, ano e status para encontrar exatamente o que procura.",
    bullets: ["Busca por texto livre", "Filtros laterais por país, ano e status", "Estado vazio elegante"],
    img: "https://media.base44.com/images/public/6aa03ed3a9f5127b8e02dcc3/394a1f4ae_image.png",
    alt: "Tela de Catálogo do Pataca",
  },
  {
    id: "perfil",
    tag: "Meu perfil",
    title: "Seu espaço de colecionador",
    desc: "Gerencie seus dados, exporte sua coleção em PDF ou CSV e acompanhe sua posição no ranking dos colecionadores do Pataca.",
    bullets: ["Exportação em PDF e CSV", "Ranking com sua posição destacada", "Edição de perfil e logout"],
    img: "https://media.base44.com/images/public/6aa03ed3a9f5127b8e02dcc3/02b05e84e_image.png",
    alt: "Tela de Meu perfil do Pataca",
  },
];

const FEATURES = [
  { icon: "🗂️", title: "Catálogo geral", desc: "Busque por nome, ano, valor, país ou material. Filtre por plano monetário e encontre qualquer moeda em segundos." },
  { icon: "📚", title: "Minhas coleções", desc: "Organize suas moedas por país, marque o que você já tem e o que está buscando. Acompanhe o progresso de cada série." },
  { icon: "🏆", title: "Ranking de colecionadores", desc: "Veja sua posição entre milhares de colecionadores e acompanhe quem está montando os maiores acervos." },
  { icon: "📊", title: "Visão geral do acervo", desc: "Moedas diferentes, quantas você busca, coleções ativas e progresso — tudo em um painel limpo e direto." },
  { icon: "📤", title: "Exportar coleção", desc: "Baixe seu acervo em PDF ou CSV quando quiser. Sua coleção é sua — leve-a com você." },
  { icon: "👤", title: "Perfil dedicado", desc: "Edite seus dados, acompanhe suas estatísticas e sua posição no ranking dos colecionadores." },
];

const FAQS = [
  { q: "O Pataca é realmente gratuito?", a: "Sim! Você pode se cadastrar, montar suas coleções e usar o catálogo gratuitamente." },
  { q: "Posso cadastrar moedas de qualquer país?", a: "Pode. O Pataca já inclui catálogos de vários países, como Brasil e Reino Unido, e você pode organizar coleções por país." },
  { q: "Como funciona o ranking de colecionadores?", a: "O ranking ordena os usuários pelo número de moedas diferentes em suas coleções. Sua posição aparece destacada no seu perfil." },
  { q: "Posso exportar minha coleção?", a: "Sim. No seu perfil você exporta toda a coleção em PDF ou CSV com um clique." },
  { q: "Meus dados estão seguros?", a: "Sim. Sua conta e sua coleção são privadas e protegidas. Você pode sair da conta a qualquer momento." },
];

const NAV = [
  { label: "Visão geral", href: "#dashboard" },
  { label: "Catálogo", href: "#catalogo" },
  { label: "Minhas coleções", href: "#colecoes" },
  { label: "Meu perfil", href: "#perfil" },
];

// hooks
function useReveal() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("pl-reveal-in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    document.querySelectorAll(".pl-reveal").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

function useCountUp(target: number, suffix = "", runRef: React.RefObject<boolean>) {
  const [val, setVal] = useState("0");
  useEffect(() => {
    if (!runRef.current) return;
    let cur = 0;
    const step = Math.max(1, Math.floor(target / 60));
    const t = setInterval(() => {
      cur += step;
      if (cur >= target) {
        cur = target;
        clearInterval(t);
      }
      setVal((cur >= 1000 ? cur.toLocaleString("pt-BR") : String(cur)) + suffix);
    }, 24);
    return () => clearInterval(t);
  }, [target, suffix, runRef]);
  return val;
}

function Stat({ value, suffix, label }: { value: number; suffix?: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [run, setRun] = useState(false);
  const runRef = useRef(false);
  useEffect(() => {
    if (!ref.current) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          runRef.current = true;
          setRun(true);
          io.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  const display = useCountUp(value, suffix, runRef);
  return (
    <div ref={ref} className="pl-reveal text-center">
      <div className="text-4xl font-bold pl-gold-text">{run ? display : "0"}</div>
      <p className="mt-1 text-xs uppercase tracking-wider" style={{ color: MUTED }}>{label}</p>
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="pl-reveal pl-card rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left font-medium"
      >
        <span>{q}</span>
        <span className="text-xl transition-transform" style={{ color: GOLD_LIGHT, transform: open ? "rotate(45deg)" : "none" }}>+</span>
      </button>
      <div className="overflow-hidden transition-all duration-300" style={{ maxHeight: open ? "200px" : "0px" }}>
        <p className="px-5 pb-4 text-sm" style={{ color: MUTED }}>{a}</p>
      </div>
    </div>
  );
}

export default function PatacaLanding() {
  useReveal();
  const [navScrolled, setNavScrolled] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", agree: false });
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, boolean> = {};
    if (!form.name.trim()) errs.name = true;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = true;
    if (form.password.length < 6) errs.password = true;
    if (!form.agree) errs.agree = true;
    setErrors(errs);
    if (Object.keys(errs).length === 0) setSubmitted(true);
  };

  return (
    <div className="pl-root">
      <style>{`
        .pl-root { background:${INK_950}; color:#fff; font-family:Inter,system-ui,sans-serif; }
        .pl-root * { box-sizing:border-box; }
        .pl-gold-text {
          background:linear-gradient(100deg,${GOLD_LIGHT} 0%,#f5d77a 25%,#fff3d0 50%,${GOLD_LIGHT} 75%,${GOLD} 100%);
          background-size:200% auto; -webkit-background-clip:text; background-clip:text; -webkit-text-fill-color:transparent;
          animation:pl-shimmer 5s linear infinite;
        }
        .pl-coin { background:radial-gradient(circle at 35% 30%,#f5d77a 0%,${GOLD} 40%,#9c7a1f 100%); box-shadow:inset 0 0 10px rgba(120,90,20,.5),0 6px 18px rgba(0,0,0,.5); }
        .pl-card { background:${INK_800}; border:1px solid ${INK_600}; }
        .pl-reveal { opacity:0; transform:translateY(28px); transition:opacity .7s ease, transform .7s ease; }
        .pl-reveal-in { opacity:1; transform:translateY(0); }
        .pl-input:focus { outline:none; border-color:${GOLD}; box-shadow:0 0 0 3px rgba(212,175,55,.18); }
        .pl-nav-blur { background:rgba(10,10,10,.8); backdrop-filter:blur(12px); }
        .pl-grain { background-image:radial-gradient(rgba(212,175,55,.05) 1px,transparent 1px); background-size:22px 22px; }
        .pl-float { animation:pl-float 6s ease-in-out infinite; }
        .pl-progress > span { display:block; height:100%; border-radius:9999px; background:linear-gradient(90deg,${GOLD},${GOLD_LIGHT}); }
        @keyframes pl-shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
        @keyframes pl-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        @media (prefers-reduced-motion: reduce) { .pl-float,.pl-gold-text{animation:none} .pl-reveal{opacity:1;transform:none} }
      `}</style>

      {/* NAV */}
      <header
        className="fixed top-0 inset-x-0 z-50 transition-all duration-300"
        style={navScrolled ? { background: "rgba(10,10,10,.8)", backdropFilter: "blur(12px)", boxShadow: "0 4px 20px rgba(0,0,0,.4)" } : undefined}
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-4 flex items-center justify-between">
          <a href="#top" className="flex items-center gap-2.5">
            <span className="relative w-8 h-8 pl-coin rounded-full flex items-center justify-center">
              <span className="font-bold text-sm" style={{ color: INK_950 }}>P</span>
            </span>
            <span className="text-xl font-bold tracking-tight">Pataca</span>
          </a>
          <nav className="hidden md:flex items-center gap-1 text-sm">
            {NAV.map((n) => (
              <a key={n.href} href={n.href} className="px-4 py-2 rounded-full transition hover:text-white" style={{ color: MUTED }}>{n.label}</a>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-xs" style={{ color: MUTED_DARK }}>Pataca v1.0.0</span>
            <a href="#cadastro" className="px-5 py-2.5 rounded-full font-semibold text-sm transition" style={{ background: GOLD, color: INK_950 }}>Cadastrar grátis</a>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section id="top" className="relative pt-32 pb-20 pl-grain">
        <div className="absolute inset-0 -z-10 pointer-events-none">
          <div className="absolute -top-40 -left-40 w-[520px] h-[520px] rounded-full blur-3xl" style={{ background: "rgba(212,175,55,.10)" }} />
          <div className="absolute top-40 -right-40 w-[460px] h-[460px] rounded-full blur-3xl" style={{ background: "rgba(193,154,46,.10)" }} />
        </div>
        <div className="max-w-7xl mx-auto px-5 sm:px-8 grid lg:grid-cols-2 gap-12 items-center">
          <div className="pl-reveal">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs uppercase tracking-[0.2em] mb-6" style={{ border: `1px solid rgba(212,175,55,.4)`, color: GOLD_LIGHT }}>✦ Numismática organizada</span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl leading-[1.08] font-bold">
              Sua coleção de moedas,<br /><span className="pl-gold-text">organizada e viva.</span>
            </h1>
            <p className="mt-6 text-lg max-w-xl" style={{ color: MUTED }}>
              O Pataca é o lar digital de quem coleciona moedas. Catálogo, coleções, ranking e
              acompanhamento do seu acervo — tudo em um só lugar, com a elegância que sua numismática merece.
            </p>
            <div className="mt-9 flex flex-col sm:flex-row gap-4">
              <a href="#cadastro" className="inline-flex justify-center items-center gap-2 px-7 py-4 rounded-full font-semibold transition" style={{ background: GOLD, color: INK_950 }}>Começar minha coleção →</a>
              <a href="#dashboard" className="inline-flex justify-center items-center gap-2 px-7 py-4 rounded-full border transition hover:bg-[#1a1a1a]" style={{ borderColor: INK_600, color: "#fff" }}>Ver o app</a>
            </div>
            <div className="mt-10 flex items-center gap-4 text-sm" style={{ color: MUTED }}>
              <div className="flex -space-x-3">
                {["C", "M", "R"].map((l) => (
                  <span key={l} className="w-9 h-9 pl-coin rounded-full flex items-center justify-center font-bold text-xs" style={{ color: INK_950 }}>{l}</span>
                ))}
              </div>
              <span>+2.400 colecionadores já organizam suas moedas no Pataca</span>
            </div>
          </div>

          {/* Dashboard preview */}
          <div id="dashboard" className="pl-reveal relative">
            <div className="pl-card rounded-2xl p-5 shadow-2xl shadow-black/50">
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 rounded-md text-xs font-semibold" style={{ background: "rgba(212,175,55,.15)", color: GOLD_LIGHT }}>Ranking #122</span>
                <span className="text-sm" style={{ color: MUTED }}>Bem-vindo(a), testeteste</span>
              </div>
              <h3 className="text-2xl font-bold mb-4">Visão geral do acervo</h3>
              <div className="grid grid-cols-3 gap-3 mb-5">
                {[["Moedas diferentes", "24", true], ["Buscando", "1", false], ["Coleções ativas", "2", false]].map(([label, val, gold]) => (
                  <div key={label as string} className="pl-card rounded-xl p-3">
                    <p className="text-xs" style={{ color: MUTED }}>{label as string}</p>
                    <p className="text-2xl font-bold mt-1" style={gold ? { color: GOLD_LIGHT } : undefined}>{val as string}</p>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold">Minhas coleções</p>
                <a href="#colecoes" className="text-xs transition" style={{ color: GOLD_LIGHT }}>Abrir coleções →</a>
              </div>
              <div className="space-y-2 text-sm">
                {[["Reino Unido", "28 no catálogo", 78], ["Brasil", "50 de 299", 17]].map(([pais, info, pct]) => (
                  <div key={pais as string} className="flex items-center justify-between py-2 border-b" style={{ borderColor: INK_600 }}>
                    <span>{pais as string}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs" style={{ color: MUTED }}>{info as string}</span>
                      <div className="w-24 h-1.5 rounded-full pl-progress" style={{ background: INK_600 }}><span style={{ width: `${pct}%` }} /></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute -bottom-5 -left-5 hidden sm:block pl-float">
              <span className="w-16 h-16 pl-coin rounded-full flex items-center justify-center font-bold text-xl" style={{ color: INK_950 }}>P</span>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="border-y bg-[#121212]" style={{ borderColor: INK_600 }}>
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
          <Stat value={2400} suffix="+" label="Colecionadores" />
          <Stat value={180000} suffix="+" label="Moedas catalogadas" />
          <Stat value={42} label="Países" />
          <Stat value={100} suffix="%" label="Grátis para começar" />
        </div>
      </section>

      {/* RECURSOS */}
      <section className="py-24 pl-grain">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="max-w-2xl mx-auto text-center pl-reveal">
            <span className="text-xs uppercase tracking-[0.25em]" style={{ color: GOLD_LIGHT }}>Recursos</span>
            <h2 className="text-4xl sm:text-5xl font-bold mt-3">Tudo para o seu acervo</h2>
            <p className="mt-4" style={{ color: MUTED }}>Ferramentas pensadas para o colecionador — do iniciante ao numismata experiente.</p>
          </div>
          <div className="mt-16 grid md:grid-cols-3 gap-5">
            {FEATURES.map((f) => (
              <article key={f.title} className="pl-reveal pl-card rounded-2xl p-7 transition group hover:border-[#d4af37]/40">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl mb-5 group-hover:scale-110 transition" style={{ background: "rgba(212,175,55,.15)", color: GOLD_LIGHT }}>{f.icon}</div>
                <h3 className="text-xl font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed" style={{ color: MUTED }}>{f.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* APP SHOWCASE */}
      <section className="py-24 bg-[#121212] border-y" style={{ borderColor: INK_600 }}>
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="max-w-2xl mx-auto text-center pl-reveal">
            <span className="text-xs uppercase tracking-[0.25em]" style={{ color: GOLD_LIGHT }}>O app</span>
            <h2 className="text-4xl sm:text-5xl font-bold mt-3">Veja o Pataca em ação</h2>
            <p className="mt-4" style={{ color: MUTED }}>Uma interface escura, limpa e focada no que importa: as suas moedas.</p>
          </div>
          <div className="mt-16 space-y-24">
            {SCREENS.map((s, i) => {
              const imgFirst = i % 2 === 0;
              return (
                <div key={s.id} id={s.id} className="grid lg:grid-cols-2 gap-10 items-center">
                  <div className={`pl-reveal ${imgFirst ? "" : "order-2 lg:order-1"}`}>
                    <img src={s.img} alt={s.alt} loading="lazy" className="w-full rounded-2xl shadow-2xl shadow-black/60" style={{ border: `1px solid ${INK_600}` }} />
                  </div>
                  <div className={`pl-reveal ${imgFirst ? "" : "order-1 lg:order-2"}`}>
                    <span className="text-xs uppercase tracking-[0.25em]" style={{ color: GOLD_LIGHT }}>{s.tag}</span>
                    <h3 className="text-3xl font-bold mt-3">{s.title}</h3>
                    <p className="mt-4" style={{ color: MUTED }}>{s.desc}</p>
                    <ul className="mt-6 space-y-3" style={{ color: MUTED }}>
                      {s.bullets.map((b) => (
                        <li key={b} className="flex items-center gap-3"><span style={{ color: GOLD_LIGHT }}>✦</span>{b}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section className="py-24 pl-grain">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="max-w-2xl mx-auto text-center pl-reveal">
            <span className="text-xs uppercase tracking-[0.25em]" style={{ color: GOLD_LIGHT }}>Como funciona</span>
            <h2 className="text-4xl sm:text-5xl font-bold mt-3">Três passos para o ouro</h2>
          </div>
          <div className="mt-16 grid md:grid-cols-3 gap-10">
            {[["1", "Crie sua conta", "Cadastre-se grátis em segundos. Sem cartão, sem complicação."],
              ["2", "Monte suas coleções", "Escolha países, marque o que você tem e o que está buscando."],
              ["3", "Acompanhe seu acervo", "Veja estatísticas, progresso e sua posição no ranking."]].map(([n, t, d]) => (
              <div key={n} className="pl-reveal text-center">
                <div className="relative mx-auto w-20 h-20 pl-coin rounded-full flex items-center justify-center text-3xl font-bold" style={{ color: INK_950 }}>{n}</div>
                <h3 className="text-xl font-semibold mt-6">{t}</h3>
                <p className="mt-2 text-sm" style={{ color: MUTED }}>{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CADASTRO */}
      <section id="cadastro" className="py-24 bg-[#121212] border-y" style={{ borderColor: INK_600 }}>
        <div className="max-w-5xl mx-auto px-5 sm:px-8">
          <div className="pl-card rounded-3xl overflow-hidden grid lg:grid-cols-2">
            <div className="p-8 sm:p-10 relative" style={{ background: INK_800 }}>
              <span className="text-xs uppercase tracking-[0.25em]" style={{ color: GOLD_LIGHT }}>Cadastro gratuito</span>
              <h2 className="text-3xl font-bold mt-3">Comece sua coleção hoje</h2>
              <p className="mt-3" style={{ color: MUTED }}>Preencha seus dados e ganhe acesso imediato ao Pataca. Sem cartão de crédito.</p>
              <ul className="mt-8 space-y-3 text-sm" style={{ color: MUTED }}>
                <li className="flex items-center gap-3"><span style={{ color: GOLD_LIGHT }}>✦</span>Acesso a catálogo e coleções</li>
                <li className="flex items-center gap-3"><span style={{ color: GOLD_LIGHT }}>✦</span>Ranking de colecionadores</li>
                <li className="flex items-center gap-3"><span style={{ color: GOLD_LIGHT }}>✦</span>Exportação em PDF e CSV</li>
              </ul>
              <div className="mt-10 hidden lg:flex items-center gap-3 text-xs" style={{ color: MUTED_DARK }}>
                <span className="w-8 h-8 pl-coin rounded-full flex items-center justify-center font-bold" style={{ color: INK_950 }}>🔒</span>
                Seus dados estão seguros com a gente.
              </div>
            </div>
            <div className="p-8 sm:p-10">
              {submitted ? (
                <div className="text-center py-10">
                  <div className="w-16 h-16 mx-auto pl-coin rounded-full flex items-center justify-center text-3xl" style={{ color: INK_950 }}>✓</div>
                  <h3 className="text-2xl font-bold mt-5">Bem-vindo ao Pataca!</h3>
                  <p className="mt-2 text-sm" style={{ color: MUTED }}>Sua conta foi criada. Enviamos um e-mail de confirmação para você começar sua coleção.</p>
                  <a href="#top" className="mt-6 inline-flex px-6 py-3 rounded-full border text-sm transition hover:bg-[#1a1a1a]" style={{ borderColor: INK_600 }}>Voltar ao início</a>
                </div>
              ) : (
                <form onSubmit={submit} className="space-y-5" noValidate>
                  <div>
                    <label className="block text-sm mb-2" style={{ color: MUTED }}>Nome completo</label>
                    <input
                      type="text" required placeholder="Seu nome" value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="pl-input w-full px-4 py-3 rounded-xl text-sm transition"
                      style={{ background: INK_950, border: `1px solid ${errors.name ? "#f87171" : INK_600}`, color: "#fff" }}
                    />
                    {errors.name && <p className="text-xs mt-1" style={{ color: "#f87171" }}>Informe seu nome.</p>}
                  </div>
                  <div>
                    <label className="block text-sm mb-2" style={{ color: MUTED }}>E-mail</label>
                    <input
                      type="email" required placeholder="voce@email.com" value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="pl-input w-full px-4 py-3 rounded-xl text-sm transition"
                      style={{ background: INK_950, border: `1px solid ${errors.email ? "#f87171" : INK_600}`, color: "#fff" }}
                    />
                    {errors.email && <p className="text-xs mt-1" style={{ color: "#f87171" }}>E-mail inválido.</p>}
                  </div>
                  <div>
                    <label className="block text-sm mb-2" style={{ color: MUTED }}>Senha</label>
                    <input
                      type="password" required minLength={6} placeholder="Mínimo 6 caracteres" value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      className="pl-input w-full px-4 py-3 rounded-xl text-sm transition"
                      style={{ background: INK_950, border: `1px solid ${errors.password ? "#f87171" : INK_600}`, color: "#fff" }}
                    />
                    {errors.password && <p className="text-xs mt-1" style={{ color: "#f87171" }}>Senha muito curta.</p>}
                  </div>
                  <label className="flex items-start gap-3 text-xs" style={{ color: MUTED }}>
                    <input type="checkbox" checked={form.agree} onChange={(e) => setForm({ ...form, agree: e.target.checked })} className="mt-0.5" style={{ accentColor: GOLD }} />
                    <span>Li e aceito os <a href="#" style={{ color: GOLD_LIGHT }} className="underline">Termos de uso</a> e a <a href="#" style={{ color: GOLD_LIGHT }} className="underline">Política de privacidade</a>.</span>
                  </label>
                  {errors.agree && <p className="text-xs" style={{ color: "#f87171" }}>Você precisa aceitar os termos.</p>}
                  <button type="submit" className="w-full px-6 py-4 rounded-full font-semibold transition" style={{ background: GOLD, color: INK_950 }}>
                    Criar minha conta grátis
                  </button>
                  <p className="text-center text-xs" style={{ color: MUTED }}>Já tem conta? <a href="#" style={{ color: GOLD_LIGHT }} className="underline">Entrar</a></p>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 pl-grain">
        <div className="max-w-3xl mx-auto px-5 sm:px-8">
          <div className="text-center pl-reveal">
            <span className="text-xs uppercase tracking-[0.25em]" style={{ color: GOLD_LIGHT }}>Dúvidas</span>
            <h2 className="text-4xl sm:text-5xl font-bold mt-3">Perguntas frequentes</h2>
          </div>
          <div className="mt-12 space-y-3">
            {FAQS.map((f) => <FaqItem key={f.q} {...f} />)}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-24 bg-[#121212] border-t" style={{ borderColor: INK_600 }}>
        <div className="max-w-4xl mx-auto px-5 sm:px-8 text-center pl-reveal">
          <div className="w-20 h-20 pl-coin rounded-full mx-auto flex items-center justify-center text-3xl font-bold pl-float" style={{ color: INK_950 }}>P</div>
          <h2 className="text-4xl sm:text-5xl font-bold mt-6">Sua coleção merece um lar à altura</h2>
          <p className="mt-4 text-lg" style={{ color: MUTED }}>Junte-se a milhares de colecionadores que já organizam suas moedas no Pataca.</p>
          <a href="#cadastro" className="mt-8 inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold transition" style={{ background: GOLD, color: INK_950 }}>Cadastrar grátis agora →</a>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t bg-[#0a0a0a]" style={{ borderColor: INK_600 }}>
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-12 grid md:grid-cols-4 gap-10">
          <div>
            <a href="#top" className="flex items-center gap-2.5">
              <span className="relative w-8 h-8 pl-coin rounded-full flex items-center justify-center">
                <span className="font-bold text-sm" style={{ color: INK_950 }}>P</span>
              </span>
              <span className="text-xl font-bold">Pataca</span>
            </a>
            <p className="text-sm mt-4" style={{ color: MUTED }}>O lar digital da sua coleção de moedas.</p>
          </div>
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider" style={{ color: GOLD_LIGHT }}>Produto</h4>
            <ul className="mt-4 space-y-2 text-sm" style={{ color: MUTED }}>
              {NAV.map((n) => <li key={n.href}><a href={n.href} className="transition hover:text-[#eebc3f]">{n.label}</a></li>)}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider" style={{ color: GOLD_LIGHT }}>Empresa</h4>
            <ul className="mt-4 space-y-2 text-sm" style={{ color: MUTED }}>
              <li><a href="#" className="transition hover:text-[#eebc3f]">Sobre</a></li>
              <li><a href="#" className="transition hover:text-[#eebc3f]">Contato</a></li>
              <li><a href="#faq" className="transition hover:text-[#eebc3f]">FAQ</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider" style={{ color: GOLD_LIGHT }}>Legal</h4>
            <ul className="mt-4 space-y-2 text-sm" style={{ color: MUTED }}>
              <li><a href="#" className="transition hover:text-[#eebc3f]">Termos de uso</a></li>
              <li><a href="#" className="transition hover:text-[#eebc3f]">Privacidade</a></li>
              <li><a href="#" className="transition hover:text-[#eebc3f]">Cookies</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t" style={{ borderColor: INK_600 }}>
          <div className="max-w-7xl mx-auto px-5 sm:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs" style={{ color: MUTED_DARK }}>
            <p>© 2026 Pataca v1.0.0 — Todos os direitos reservados.</p>
            <p>Feito com ✦ para colecionadores de moedas.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
