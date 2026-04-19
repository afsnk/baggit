import { useState, useEffect, useRef } from 'react'

const themes = {
  void: {
    name: 'Void Dark',
    desc: 'Electric teal on deep black — terminal meets luxury fintech',
    preview: ['#0a0a0f', '#00e5c7', '#1a1a2e'],
    bg: '#0a0a0f',
    bgCard: '#111118',
    bgCardHover: '#16161f',
    bgAccent: '#00e5c714',
    border: '#ffffff0f',
    borderAccent: '#00e5c740',
    text: '#f0f0f8',
    textMuted: '#6e6e8a',
    textDim: '#3a3a52',
    accent: '#00e5c7',
    accentDark: '#00b09a',
    accentGlow: '0 0 40px #00e5c722',
    accent2: '#7c5cfc',
    badge: '#00e5c715',
    badgeText: '#00e5c7',
    code: '#0d1117',
    codeBorder: '#00e5c720',
    font: "'DM Mono', monospace",
    displayFont: "'Space Grotesk', sans-serif",
    tagline: 'Built for the Terminal Era',
    heroAccentWord: 'stablecoin',
    pricingBg: '#0f0f18',
    navBg: '#0a0a0fcc',
  },
  chalk: {
    name: 'Chalk & Carbon',
    desc: 'Crisp white with carbon precision — editorial financial design',
    preview: ['#fafaf7', '#0f0f0f', '#e8f4ff'],
    bg: '#fafaf7',
    bgCard: '#ffffff',
    bgCardHover: '#f5f5f0',
    bgAccent: '#0f0f0f08',
    border: '#0f0f0f12',
    borderAccent: '#0f0f0f30',
    text: '#0f0f0f',
    textMuted: '#6b6b6b',
    textDim: '#c0c0b8',
    accent: '#1a1aff',
    accentDark: '#0000cc',
    accentGlow: '0 4px 24px #1a1aff18',
    accent2: '#ff3b00',
    badge: '#0f0f0f08',
    badgeText: '#1a1aff',
    code: '#f5f5f0',
    codeBorder: '#e0e0d8',
    font: "'IBM Plex Mono', monospace",
    displayFont: "'Syne', sans-serif",
    tagline: 'Precision Payments Infrastructure',
    heroAccentWord: 'billing',
    pricingBg: '#f0f0eb',
    navBg: '#fafaf7ee',
  },
  cobalt: {
    name: 'Midnight Cobalt',
    desc: 'Deep navy with amber gold — premium banking aesthetics',
    preview: ['#050d1e', '#e6a817', '#0a1628'],
    bg: '#050d1e',
    bgCard: '#0a1628',
    bgCardHover: '#0e1d36',
    bgAccent: '#e6a81710',
    border: '#e6a81718',
    borderAccent: '#e6a81740',
    text: '#e8eaf2',
    textMuted: '#7a85a3',
    textDim: '#2a3555',
    accent: '#e6a817',
    accentDark: '#c48e0d',
    accentGlow: '0 0 40px #e6a81726',
    accent2: '#4a9eff',
    badge: '#e6a81715',
    badgeText: '#e6a817',
    code: '#071020',
    codeBorder: '#e6a81722',
    font: "'JetBrains Mono', monospace",
    displayFont: "'Playfair Display', serif",
    tagline: 'Private-Grade Treasury Infrastructure',
    heroAccentWord: 'treasury',
    pricingBg: '#070f1e',
    navBg: '#050d1ecc',
  },
}

const features = [
  {
    icon: '⬡',
    title: 'Drop-in Components',
    desc: 'Pre-built React and vanilla JS components. Payment forms, wallet connectors, subscription managers — zero boilerplate.',
    tag: 'SDK',
  },
  {
    icon: '◈',
    title: 'Multi-Chain Support',
    desc: 'USDC, USDT, DAI across Ethereum, Polygon, Solana, Base, and Arbitrum. One API, every network.',
    tag: 'Multi-chain',
  },
  {
    icon: '⟳',
    title: 'Recurring Billing',
    desc: 'On-chain subscriptions with automatic renewals, proration, and webhook-driven lifecycle events.',
    tag: 'Subscriptions',
  },
  {
    icon: '◉',
    title: 'Instant Settlement',
    desc: 'Payments settle in seconds, not days. Real-time treasury management with programmable sweep rules.',
    tag: 'Settlement',
  },
  {
    icon: '⬟',
    title: 'Global Onboarding',
    desc: 'KYC/AML flows for 180+ countries. Embedded wallet creation. Self-custody and custodial paths.',
    tag: 'Compliance',
  },
  {
    icon: '◆',
    title: 'Programmable Invoices',
    desc: 'Dynamic invoices with escrow logic, milestone-based releases, and dispute resolution built-in.',
    tag: 'Invoicing',
  },
]

const steps = [
  {
    n: '01',
    title: 'Install the SDK',
    body: 'npm install @stablepay/sdk — one package, everything included.',
  },
  {
    n: '02',
    title: 'Configure your keys',
    body: 'Generate API keys from the dashboard, set your stablecoin preferences and settlement wallets.',
  },
  {
    n: '03',
    title: 'Drop in a component',
    body: 'Use <PaymentForm />, <SubscribeButton />, or raw API calls — your architecture, your rules.',
  },
  {
    n: '04',
    title: 'Go live instantly',
    body: 'No review queues. No bank approval. Deploy globally in minutes, not weeks.',
  },
]

const pricing = [
  {
    plan: 'Starter',
    price: '$0',
    period: 'forever',
    note: 'Up to $10k/mo volume',
    features: [
      '5 API endpoints',
      'USDC & USDT',
      '3 chains',
      'Community support',
      'Basic webhooks',
    ],
    cta: 'Start free',
    highlighted: false,
  },
  {
    plan: 'Growth',
    price: '$149',
    period: '/ month',
    note: 'Up to $500k/mo volume',
    features: [
      'Unlimited endpoints',
      'All stablecoins',
      'All chains',
      'Priority support',
      'Advanced webhooks',
      'Recurring billing',
      'Custom invoices',
    ],
    cta: 'Start 14-day trial',
    highlighted: true,
  },
  {
    plan: 'Enterprise',
    price: 'Custom',
    period: '',
    note: 'Unlimited volume',
    features: [
      'White-label SDK',
      'Dedicated infra',
      'SLA guarantees',
      'Audit logs',
      'Custom compliance',
      '24/7 support',
      'On-premise option',
    ],
    cta: 'Contact sales',
    highlighted: false,
  },
]

const codeSnippet = `import { StablePay } from '@stablepay/sdk';

const client = new StablePay({
  apiKey: process.env.STABLEPAY_KEY,
  chain: 'base',
});

// Create a payment intent
const intent = await client.payment.create({
  amount: 99.00,
  currency: 'USDC',
  description: 'Pro subscription — April 2026',
  onSuccess: (tx) => console.log(tx.hash),
});`

const stats = [
  { val: '$4.2B+', label: 'Volume processed' },
  { val: '180+', label: 'Countries supported' },
  { val: '99.99%', label: 'Uptime SLA' },
  { val: '<400ms', label: 'Median latency' },
]

export default function Billing() {
  const [theme, setTheme] = useState(null)
  const [hovered, setHovered] = useState(null)
  const [activeTab, setActiveTab] = useState('node')
  const t = theme ? themes[theme] : null

  useEffect(() => {
    if (!t) return
    document.body.style.background = t.bg
    document.body.style.margin = '0'
    document.body.style.fontFamily = t.font
    const link1 = document.createElement('link')
    link1.rel = 'stylesheet'
    if (theme === 'void')
      link1.href =
        'https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Space+Grotesk:wght@300;400;500;600;700&display=swap'
    else if (theme === 'chalk')
      link1.href =
        'https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500&family=Syne:wght@400;500;600;700;800&display=swap'
    else
      link1.href =
        'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500&family=Playfair+Display:wght@400;500;600;700&display=swap'
    document.head.appendChild(link1)
  }, [theme])

  if (!theme) return <ThemePicker onPick={setTheme} />

  const isDark = theme !== 'chalk'

  return (
    <div
      style={{
        background: t.bg,
        minHeight: '100vh',
        fontFamily: t.font,
        color: t.text,
      }}
    >
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        ::selection { background: ${t.accent}44; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: ${t.bg}; }
        ::-webkit-scrollbar-thumb { background: ${t.accent}44; border-radius: 3px; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes glow { 0%,100% { opacity: 0.4; } 50% { opacity: 0.9; } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes dash { to { stroke-dashoffset: 0; } }
        .hero-word { display: inline; position: relative; }
        .hero-word::after { content: ''; position: absolute; bottom: -4px; left: 0; width: 100%; height: 2px; background: ${t.accent}; transform: scaleX(0); transform-origin: left; transition: transform 0.6s ease; animation: underline-in 0.8s 0.8s forwards; }
        @keyframes underline-in { from { transform: scaleX(0); } to { transform: scaleX(1); } }
        .fade-in { animation: fadeUp 0.7s ease both; }
        .delay-1 { animation-delay: 0.1s; }
        .delay-2 { animation-delay: 0.2s; }
        .delay-3 { animation-delay: 0.3s; }
        .delay-4 { animation-delay: 0.4s; }
        .delay-5 { animation-delay: 0.5s; }
        .delay-6 { animation-delay: 0.6s; }
        .feature-card { transition: border-color 0.25s, background 0.25s, transform 0.25s; }
        .feature-card:hover { transform: translateY(-3px); }
        .cta-btn { position: relative; overflow: hidden; }
        .cta-btn::before { content: ''; position: absolute; inset: 0; background: #ffffff18; opacity: 0; transition: opacity 0.2s; }
        .cta-btn:hover::before { opacity: 1; }
        .pill { display: inline-flex; align-items: center; border-radius: 99px; }
        .nav-link { transition: color 0.2s; cursor: pointer; font-size: 14px; }
        .nav-link:hover { color: ${t.accent}; }
        .tab-btn { cursor: pointer; transition: all 0.2s; border: none; outline: none; }
        .price-card { transition: transform 0.25s, box-shadow 0.25s; }
        .price-card:hover { transform: translateY(-4px); }
        .step-num { font-family: ${t.displayFont}; }
        .grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        .grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
        @media (max-width: 900px) {
          .grid-3 { grid-template-columns: repeat(2, 1fr); }
          .hero-h1 { font-size: clamp(32px, 7vw, 60px) !important; }
        }
        @media (max-width: 640px) {
          .grid-3 { grid-template-columns: 1fr; }
          .grid-2 { grid-template-columns: 1fr; }
          .pricing-grid { grid-template-columns: 1fr !important; }
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .steps-grid { grid-template-columns: 1fr !important; }
          .hero-h1 { font-size: clamp(28px, 9vw, 48px) !important; }
          .nav-links { display: none; }
          .hero-badges { flex-wrap: wrap; }
        }
      `}</style>

      {/* NAV */}
      <nav
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: t.navBg,
          backdropFilter: 'blur(16px)',
          borderBottom: `1px solid ${t.border}`,
          padding: '0 24px',
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: 64,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <svg width="28" height="28" viewBox="0 0 28 28">
              <polygon
                points="14,2 26,8 26,20 14,26 2,20 2,8"
                fill="none"
                stroke={t.accent}
                strokeWidth="1.5"
              />
              <polygon
                points="14,7 21,11 21,18 14,21 7,18 7,11"
                fill={t.accent}
                opacity="0.2"
              />
              <circle cx="14" cy="14" r="3" fill={t.accent} />
            </svg>
            <span
              style={{
                fontFamily: t.displayFont,
                fontWeight: 700,
                fontSize: 18,
                letterSpacing: '-0.03em',
                color: t.text,
              }}
            >
              StablePay
            </span>
          </div>
          <div className="nav-links" style={{ display: 'flex', gap: 32 }}>
            {['Docs', 'Pricing', 'Blog', 'Status'].map((l) => (
              <span key={l} className="nav-link" style={{ color: t.textMuted }}>
                {l}
              </span>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <button
              onClick={() => setTheme(null)}
              style={{
                background: 'transparent',
                border: `1px solid ${t.border}`,
                color: t.textMuted,
                padding: '6px 14px',
                borderRadius: 8,
                cursor: 'pointer',
                fontSize: 13,
                fontFamily: t.font,
                transition: 'all 0.2s',
              }}
            >
              Theme
            </button>
            <button
              className="cta-btn"
              style={{
                background: t.accent,
                color: isDark ? '#000' : '#fff',
                border: 'none',
                padding: '8px 18px',
                borderRadius: 8,
                cursor: 'pointer',
                fontSize: 13,
                fontFamily: t.font,
                fontWeight: 600,
              }}
            >
              Get API key
            </button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section
        style={{ maxWidth: 1200, margin: '0 auto', padding: '90px 24px 70px' }}
      >
        <div
          className="fade-in"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 14px',
            borderRadius: 99,
            border: `1px solid ${t.borderAccent}`,
            background: t.badge,
            marginBottom: 28,
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: t.accent,
              display: 'inline-block',
              animation: 'glow 2s ease infinite',
            }}
          />
          <span
            style={{
              fontSize: 12,
              color: t.badgeText,
              fontWeight: 500,
              letterSpacing: '0.05em',
            }}
          >
            NOW LIVE — Base, Arbitrum & Solana support
          </span>
        </div>

        <h1
          className="fade-in delay-1 hero-h1"
          style={{
            fontFamily: t.displayFont,
            fontSize: 'clamp(40px, 6vw, 76px)',
            fontWeight: 700,
            lineHeight: 1.08,
            letterSpacing: '-0.04em',
            maxWidth: 820,
            color: t.text,
            marginBottom: 24,
          }}
        >
          The global{' '}
          <span className="hero-word" style={{ color: t.accent }}>
            {t.heroAccentWord}
          </span>{' '}
          infrastructure
          <br />
          developers actually ship with
        </h1>

        <p
          className="fade-in delay-2"
          style={{
            fontSize: 18,
            color: t.textMuted,
            lineHeight: 1.65,
            maxWidth: 560,
            marginBottom: 40,
          }}
        >
          Drop-in billing, onboarding, and payment components for
          stablecoin-native products. Integrate in minutes. Scale to millions.
        </p>

        <div
          className="fade-in delay-3 hero-badges"
          style={{
            display: 'flex',
            gap: 16,
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          <button
            className="cta-btn"
            style={{
              background: t.accent,
              color: isDark ? '#000' : '#fff',
              border: 'none',
              padding: '14px 28px',
              borderRadius: 10,
              cursor: 'pointer',
              fontSize: 15,
              fontFamily: t.displayFont,
              fontWeight: 700,
              boxShadow: t.accentGlow,
              letterSpacing: '-0.01em',
            }}
          >
            Start building free →
          </button>
          <button
            style={{
              background: 'transparent',
              border: `1px solid ${t.border}`,
              color: t.text,
              padding: '14px 28px',
              borderRadius: 10,
              cursor: 'pointer',
              fontSize: 15,
              fontFamily: t.font,
              transition: 'border-color 0.2s',
            }}
          >
            View documentation
          </button>
        </div>

        <div
          className="fade-in delay-4"
          style={{ display: 'flex', gap: 24, marginTop: 48, flexWrap: 'wrap' }}
        >
          {[
            'No KYC required for devs',
            'Permissionless',
            'Open-source SDK',
          ].map((s) => (
            <span
              key={s}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontSize: 13,
                color: t.textMuted,
              }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14">
                <circle
                  cx="7"
                  cy="7"
                  r="6"
                  fill="none"
                  stroke={t.accent}
                  strokeWidth="1.5"
                />
                <path
                  d="M4 7l2 2 4-4"
                  stroke={t.accent}
                  strokeWidth="1.5"
                  fill="none"
                  strokeLinecap="round"
                />
              </svg>
              {s}
            </span>
          ))}
        </div>
      </section>

      {/* STATS BAR */}
      <section
        style={{
          borderTop: `1px solid ${t.border}`,
          borderBottom: `1px solid ${t.border}`,
          background: t.bgCard,
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <div
            className="stats-grid"
            style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)' }}
          >
            {stats.map((s, i) => (
              <div
                key={i}
                style={{
                  padding: '32px 24px',
                  borderRight: i < 3 ? `1px solid ${t.border}` : 'none',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    fontFamily: t.displayFont,
                    fontSize: 32,
                    fontWeight: 700,
                    color: t.accent,
                    letterSpacing: '-0.03em',
                  }}
                >
                  {s.val}
                </div>
                <div style={{ fontSize: 13, color: t.textMuted, marginTop: 4 }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section
        style={{ maxWidth: 1200, margin: '0 auto', padding: '90px 24px' }}
      >
        <div style={{ marginBottom: 56 }}>
          <div
            className="pill"
            style={{
              background: t.badge,
              border: `1px solid ${t.borderAccent}`,
              padding: '4px 12px',
              marginBottom: 16,
            }}
          >
            <span
              style={{
                fontSize: 11,
                color: t.badgeText,
                letterSpacing: '0.1em',
                fontWeight: 600,
              }}
            >
              COMPONENTS
            </span>
          </div>
          <h2
            style={{
              fontFamily: t.displayFont,
              fontSize: 'clamp(28px,4vw,44px)',
              fontWeight: 700,
              color: t.text,
              letterSpacing: '-0.03em',
              lineHeight: 1.15,
              maxWidth: 540,
            }}
          >
            Everything you need,
            <br />
            nothing you don't
          </h2>
        </div>

        <div className="grid-3">
          {features.map((f, i) => (
            <div
              key={i}
              className="feature-card fade-in"
              style={{
                animationDelay: `${i * 0.07}s`,
                background: hovered === i ? t.bgCardHover : t.bgCard,
                border: `1px solid ${hovered === i ? t.borderAccent : t.border}`,
                borderRadius: 16,
                padding: '28px 24px',
                cursor: 'default',
              }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: 16,
                }}
              >
                <span style={{ fontSize: 22, color: t.accent }}>{f.icon}</span>
                <span
                  className="pill"
                  style={{
                    background: t.badge,
                    padding: '3px 10px',
                    fontSize: 10,
                    color: t.badgeText,
                    letterSpacing: '0.08em',
                    fontWeight: 600,
                  }}
                >
                  {f.tag}
                </span>
              </div>
              <h3
                style={{
                  fontFamily: t.displayFont,
                  fontSize: 17,
                  fontWeight: 600,
                  color: t.text,
                  marginBottom: 10,
                  letterSpacing: '-0.02em',
                }}
              >
                {f.title}
              </h3>
              <p
                style={{ fontSize: 13.5, color: t.textMuted, lineHeight: 1.65 }}
              >
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CODE SECTION */}
      <section
        style={{
          background: t.pricingBg,
          borderTop: `1px solid ${t.border}`,
          borderBottom: `1px solid ${t.border}`,
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '90px 24px' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 64,
              alignItems: 'center',
            }}
          >
            <div>
              <div
                className="pill"
                style={{
                  background: t.badge,
                  border: `1px solid ${t.borderAccent}`,
                  padding: '4px 12px',
                  marginBottom: 16,
                }}
              >
                <span
                  style={{
                    fontSize: 11,
                    color: t.badgeText,
                    letterSpacing: '0.1em',
                    fontWeight: 600,
                  }}
                >
                  DEVELOPER FIRST
                </span>
              </div>
              <h2
                style={{
                  fontFamily: t.displayFont,
                  fontSize: 'clamp(26px,3.5vw,40px)',
                  fontWeight: 700,
                  color: t.text,
                  letterSpacing: '-0.03em',
                  lineHeight: 1.2,
                  marginBottom: 20,
                }}
              >
                Ship in an afternoon,
                <br />
                not a quarter
              </h2>
              <p
                style={{
                  fontSize: 15,
                  color: t.textMuted,
                  lineHeight: 1.7,
                  marginBottom: 32,
                }}
              >
                The StablePay SDK is 4.2KB gzipped. No external dependencies.
                Tree-shakeable. TypeScript-first with full type coverage and
                auto-generated API clients.
              </p>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {['Node.js', 'Python', 'Go', 'Rust', 'REST'].map((lang) => (
                  <span
                    key={lang}
                    className="pill"
                    style={{
                      background:
                        activeTab === lang.toLowerCase() ? t.accent : t.badge,
                      color:
                        activeTab === lang.toLowerCase()
                          ? isDark
                            ? '#000'
                            : '#fff'
                          : t.badgeText,
                      border: `1px solid ${activeTab === lang.toLowerCase() ? t.accent : t.borderAccent}`,
                      padding: '6px 14px',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                    onClick={() => setActiveTab(lang.toLowerCase())}
                  >
                    {lang}
                  </span>
                ))}
              </div>
            </div>
            <div
              style={{
                background: t.code,
                border: `1px solid ${t.codeBorder}`,
                borderRadius: 16,
                overflow: 'hidden',
                boxShadow: `0 24px 64px ${t.accent}10`,
              }}
            >
              <div
                style={{
                  padding: '12px 16px',
                  borderBottom: `1px solid ${t.codeBorder}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    background: '#ff5f57',
                    display: 'inline-block',
                  }}
                />
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    background: '#ffbd2e',
                    display: 'inline-block',
                  }}
                />
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    background: '#28c840',
                    display: 'inline-block',
                  }}
                />
                <span
                  style={{ fontSize: 12, color: t.textMuted, marginLeft: 8 }}
                >
                  payment.ts
                </span>
              </div>
              <pre
                style={{
                  padding: '24px',
                  fontSize: 12.5,
                  lineHeight: 1.75,
                  color: t.text,
                  overflowX: 'auto',
                  fontFamily: t.font,
                  margin: 0,
                }}
              >
                <code>
                  {codeSnippet.split('\n').map((line, i) => {
                    const accent = t.accent
                    const mut = t.textMuted
                    if (line.includes('import') || line.includes('from'))
                      return (
                        <div key={i}>
                          <span style={{ color: t.accent2 || t.accent }}>
                            import
                          </span>{' '}
                          <span style={{ color: t.text }}>
                            {'{ StablePay }'}
                          </span>{' '}
                          <span style={{ color: t.accent2 || t.accent }}>
                            from
                          </span>{' '}
                          <span style={{ color: '#22c55e' }}>
                            '@stablepay/sdk'
                          </span>
                        </div>
                      )
                    if (line.includes('const client'))
                      return (
                        <div key={i}>
                          <span style={{ color: t.accent }}>const</span> client
                          = <span style={{ color: t.accent }}>new</span>{' '}
                          <span style={{ color: t.text }}>StablePay</span>
                          {'({'}
                        </div>
                      )
                    if (line.trim().startsWith('//'))
                      return (
                        <div key={i}>
                          <span style={{ color: t.textMuted }}>{line}</span>
                        </div>
                      )
                    if (line.includes('apiKey'))
                      return (
                        <div key={i}>
                          {'  '}
                          <span style={{ color: t.textMuted }}>apiKey</span>:
                          process.<span style={{ color: t.accent }}>env</span>
                          .STABLEPAY_KEY,
                        </div>
                      )
                    if (line.includes('chain'))
                      return (
                        <div key={i}>
                          {'  '}
                          <span style={{ color: t.textMuted }}>
                            chain
                          </span>:{' '}
                          <span style={{ color: '#22c55e' }}>'base'</span>,
                        </div>
                      )
                    if (line.includes('amount'))
                      return (
                        <div key={i}>
                          {'  '}
                          <span style={{ color: t.textMuted }}>
                            amount
                          </span>:{' '}
                          <span style={{ color: '#f59e0b' }}>99.00</span>,
                        </div>
                      )
                    if (line.includes('currency'))
                      return (
                        <div key={i}>
                          {'  '}
                          <span style={{ color: t.textMuted }}>
                            currency
                          </span>:{' '}
                          <span style={{ color: '#22c55e' }}>'USDC'</span>,
                        </div>
                      )
                    if (line.includes('description'))
                      return (
                        <div key={i}>
                          {'  '}
                          <span style={{ color: t.textMuted }}>
                            description
                          </span>
                          :{' '}
                          <span style={{ color: '#22c55e' }}>
                            'Pro subscription — April 2026'
                          </span>
                          ,
                        </div>
                      )
                    if (line.includes('onSuccess'))
                      return (
                        <div key={i}>
                          {'  '}
                          <span style={{ color: t.textMuted }}>onSuccess</span>:
                          (tx) =&gt; console.
                          <span style={{ color: t.accent }}>log</span>(tx.hash),
                        </div>
                      )
                    return <div key={i}>{line}</div>
                  })}
                </code>
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section
        style={{ maxWidth: 1200, margin: '0 auto', padding: '90px 24px' }}
      >
        <div style={{ marginBottom: 56 }}>
          <div
            className="pill"
            style={{
              background: t.badge,
              border: `1px solid ${t.borderAccent}`,
              padding: '4px 12px',
              marginBottom: 16,
            }}
          >
            <span
              style={{
                fontSize: 11,
                color: t.badgeText,
                letterSpacing: '0.1em',
                fontWeight: 600,
              }}
            >
              HOW IT WORKS
            </span>
          </div>
          <h2
            style={{
              fontFamily: t.displayFont,
              fontSize: 'clamp(28px,4vw,44px)',
              fontWeight: 700,
              color: t.text,
              letterSpacing: '-0.03em',
              lineHeight: 1.15,
            }}
          >
            From zero to payments
            <br />
            in four steps
          </h2>
        </div>
        <div
          className="steps-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4,1fr)',
            gap: 2,
          }}
        >
          {steps.map((s, i) => (
            <div
              key={i}
              style={{
                padding: '32px 24px',
                background: t.bgCard,
                border: `1px solid ${t.border}`,
                borderRadius:
                  i === 0 ? '16px 0 0 16px' : i === 3 ? '0 16px 16px 0' : '0',
                position: 'relative',
              }}
            >
              {i < 3 && (
                <div
                  style={{
                    position: 'absolute',
                    right: -12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    background: t.bg,
                    border: `1px solid ${t.border}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1,
                    fontSize: 10,
                    color: t.accent,
                  }}
                >
                  →
                </div>
              )}
              <div
                className="step-num"
                style={{
                  fontSize: 40,
                  fontFamily: t.displayFont,
                  fontWeight: 700,
                  color: t.accent,
                  opacity: 0.25,
                  lineHeight: 1,
                  marginBottom: 16,
                }}
              >
                {s.n}
              </div>
              <h3
                style={{
                  fontFamily: t.displayFont,
                  fontSize: 16,
                  fontWeight: 600,
                  color: t.text,
                  marginBottom: 10,
                }}
              >
                {s.title}
              </h3>
              <p style={{ fontSize: 13, color: t.textMuted, lineHeight: 1.6 }}>
                {s.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section
        style={{ background: t.pricingBg, borderTop: `1px solid ${t.border}` }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '90px 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div
              className="pill"
              style={{
                background: t.badge,
                border: `1px solid ${t.borderAccent}`,
                padding: '4px 12px',
                marginBottom: 16,
                display: 'inline-flex',
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  color: t.badgeText,
                  letterSpacing: '0.1em',
                  fontWeight: 600,
                }}
              >
                PRICING
              </span>
            </div>
            <h2
              style={{
                fontFamily: t.displayFont,
                fontSize: 'clamp(28px,4vw,44px)',
                fontWeight: 700,
                color: t.text,
                letterSpacing: '-0.03em',
              }}
            >
              Simple, transparent pricing
            </h2>
            <p style={{ color: t.textMuted, marginTop: 12, fontSize: 16 }}>
              No percentage fees. No hidden charges. Pay for what you use.
            </p>
          </div>

          <div
            className="pricing-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3,1fr)',
              gap: 16,
            }}
          >
            {pricing.map((p, i) => (
              <div
                key={i}
                className="price-card"
                style={{
                  background: p.highlighted ? 'transparent' : t.bgCard,
                  border: `${p.highlighted ? '2px' : '1px'} solid ${p.highlighted ? t.accent : t.border}`,
                  borderRadius: 20,
                  padding: '36px 28px',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: p.highlighted ? t.accentGlow : 'none',
                }}
              >
                {p.highlighted && (
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: `linear-gradient(135deg, ${t.accent}08, transparent)`,
                      pointerEvents: 'none',
                    }}
                  />
                )}
                {p.highlighted && (
                  <div style={{ position: 'absolute', top: 16, right: 16 }}>
                    <span
                      className="pill"
                      style={{
                        background: t.accent,
                        color: isDark ? '#000' : '#fff',
                        padding: '4px 10px',
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: '0.05em',
                      }}
                    >
                      MOST POPULAR
                    </span>
                  </div>
                )}
                <p
                  style={{
                    fontSize: 12,
                    color: t.badgeText,
                    letterSpacing: '0.1em',
                    fontWeight: 600,
                    marginBottom: 12,
                  }}
                >
                  {p.plan.toUpperCase()}
                </p>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: 4,
                    marginBottom: 6,
                  }}
                >
                  <span
                    style={{
                      fontFamily: t.displayFont,
                      fontSize: 40,
                      fontWeight: 700,
                      color: t.text,
                      letterSpacing: '-0.04em',
                    }}
                  >
                    {p.price}
                  </span>
                  <span style={{ fontSize: 14, color: t.textMuted }}>
                    {p.period}
                  </span>
                </div>
                <p
                  style={{ fontSize: 12, color: t.textMuted, marginBottom: 28 }}
                >
                  {p.note}
                </p>
                <div
                  style={{ height: 1, background: t.border, marginBottom: 24 }}
                />
                <ul style={{ listStyle: 'none', padding: 0, marginBottom: 28 }}>
                  {p.features.map((f, j) => (
                    <li
                      key={j}
                      style={{
                        display: 'flex',
                        gap: 10,
                        alignItems: 'flex-start',
                        padding: '6px 0',
                        fontSize: 13.5,
                        color: t.textMuted,
                      }}
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 14 14"
                        style={{ marginTop: 1, flexShrink: 0 }}
                      >
                        <circle
                          cx="7"
                          cy="7"
                          r="6"
                          fill="none"
                          stroke={t.accent}
                          strokeWidth="1.5"
                        />
                        <path
                          d="M4 7l2 2 4-4"
                          stroke={t.accent}
                          strokeWidth="1.5"
                          fill="none"
                          strokeLinecap="round"
                        />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  className="cta-btn"
                  style={{
                    width: '100%',
                    padding: '13px',
                    background: p.highlighted ? t.accent : 'transparent',
                    border: `1px solid ${p.highlighted ? t.accent : t.border}`,
                    color: p.highlighted ? (isDark ? '#000' : '#fff') : t.text,
                    borderRadius: 10,
                    cursor: 'pointer',
                    fontSize: 14,
                    fontFamily: t.font,
                    fontWeight: 600,
                    transition: 'all 0.2s',
                  }}
                >
                  {p.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        style={{ maxWidth: 1200, margin: '0 auto', padding: '90px 24px' }}
      >
        <div
          style={{
            background: t.bgCard,
            border: `1px solid ${t.border}`,
            borderRadius: 24,
            padding: '64px 48px',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: -60,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 320,
              height: 320,
              borderRadius: '50%',
              background: `radial-gradient(${t.accent}18, transparent 70%)`,
              pointerEvents: 'none',
            }}
          />
          <div
            className="pill"
            style={{
              background: t.badge,
              border: `1px solid ${t.borderAccent}`,
              padding: '4px 12px',
              marginBottom: 20,
              display: 'inline-flex',
            }}
          >
            <span
              style={{
                fontSize: 11,
                color: t.badgeText,
                letterSpacing: '0.1em',
                fontWeight: 600,
              }}
            >
              GET STARTED
            </span>
          </div>
          <h2
            style={{
              fontFamily: t.displayFont,
              fontSize: 'clamp(28px,4vw,48px)',
              fontWeight: 700,
              color: t.text,
              letterSpacing: '-0.04em',
              lineHeight: 1.1,
              marginBottom: 16,
            }}
          >
            {t.tagline}
          </h2>
          <p
            style={{
              fontSize: 16,
              color: t.textMuted,
              maxWidth: 480,
              margin: '0 auto 36px',
              lineHeight: 1.65,
            }}
          >
            Join 3,000+ teams already building global payment products on
            StablePay. First 10,000 API calls are free, always.
          </p>
          <div
            style={{
              display: 'flex',
              gap: 16,
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            <button
              className="cta-btn"
              style={{
                background: t.accent,
                color: isDark ? '#000' : '#fff',
                border: 'none',
                padding: '14px 32px',
                borderRadius: 10,
                cursor: 'pointer',
                fontSize: 15,
                fontFamily: t.displayFont,
                fontWeight: 700,
                boxShadow: t.accentGlow,
              }}
            >
              Create free account →
            </button>
            <button
              style={{
                background: 'transparent',
                border: `1px solid ${t.border}`,
                color: t.text,
                padding: '14px 32px',
                borderRadius: 10,
                cursor: 'pointer',
                fontSize: 15,
                fontFamily: t.font,
              }}
            >
              Talk to engineering
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer
        style={{ borderTop: `1px solid ${t.border}`, padding: '40px 24px' }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 16,
          }}
        >
          <span
            style={{
              fontFamily: t.displayFont,
              fontWeight: 700,
              fontSize: 16,
              color: t.textMuted,
            }}
          >
            StablePay
          </span>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            {['Privacy', 'Terms', 'Security', 'Status', 'GitHub'].map((l) => (
              <span
                key={l}
                className="nav-link"
                style={{ color: t.textDim, fontSize: 13 }}
              >
                {l}
              </span>
            ))}
          </div>
          <span style={{ fontSize: 12, color: t.textDim }}>
            © 2026 StablePay Technologies, Inc.
          </span>
        </div>
      </footer>
    </div>
  )
}

function ThemePicker({ onPick }) {
  const [hov, setHov] = useState(null)
  useEffect(() => {
    document.body.style.background = '#0c0c10'
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href =
      'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap'
    document.head.appendChild(link)
  }, [])

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0c0c10',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
        fontFamily: "'Space Grotesk', sans-serif",
      }}
    >
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .theme-card { transition: transform 0.25s, border-color 0.25s; animation: fadeUp 0.5s ease both; cursor: pointer; }
        .theme-card:hover { transform: translateY(-6px); }
      `}</style>
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <svg
          width="40"
          height="40"
          viewBox="0 0 28 28"
          style={{ marginBottom: 20 }}
        >
          <polygon
            points="14,2 26,8 26,20 14,26 2,20 2,8"
            fill="none"
            stroke="#888"
            strokeWidth="1.5"
          />
          <circle cx="14" cy="14" r="3" fill="#888" />
        </svg>
        <h1
          style={{
            fontSize: 'clamp(24px,4vw,40px)',
            fontWeight: 700,
            color: '#f0f0f8',
            letterSpacing: '-0.04em',
            marginBottom: 12,
          }}
        >
          Choose your theme
        </h1>
        <p style={{ color: '#6e6e8a', fontSize: 15 }}>
          Pick an aesthetic for StablePay's landing page
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 20,
          maxWidth: 960,
          width: '100%',
        }}
      >
        {Object.entries(themes).map(([key, th], i) => (
          <div
            key={key}
            className="theme-card"
            style={{ animationDelay: `${i * 0.1}s` }}
            onClick={() => onPick(key)}
            onMouseEnter={() => setHov(key)}
            onMouseLeave={() => setHov(null)}
          >
            <div
              style={{
                borderRadius: 20,
                overflow: 'hidden',
                border: `1px solid ${hov === key ? th.preview[1] + '80' : '#ffffff12'}`,
                boxShadow: hov === key ? `0 0 32px ${th.preview[1]}22` : 'none',
              }}
            >
              {/* Preview swatch */}
              <div
                style={{
                  background: th.preview[0],
                  padding: '28px 24px 20px',
                  position: 'relative',
                }}
              >
                <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                  {[0.3, 0.6, 1].map((o, j) => (
                    <div
                      key={j}
                      style={{
                        height: 6,
                        borderRadius: 3,
                        background: th.preview[1],
                        opacity: o,
                        flex: j === 2 ? 1 : j === 1 ? 1.5 : 0.8,
                      }}
                    />
                  ))}
                </div>
                <div
                  style={{
                    width: '70%',
                    height: 10,
                    borderRadius: 5,
                    background: th.preview[1],
                    marginBottom: 10,
                    opacity: 0.9,
                  }}
                />
                <div
                  style={{
                    width: '50%',
                    height: 7,
                    borderRadius: 4,
                    background: th.preview[1],
                    marginBottom: 20,
                    opacity: 0.3,
                  }}
                />
                <div style={{ display: 'flex', gap: 8 }}>
                  <div
                    style={{
                      background: th.preview[1],
                      borderRadius: 6,
                      padding: '7px 14px',
                      fontSize: 10,
                      color: th.preview[0],
                      fontWeight: 700,
                    }}
                  >
                    Get started
                  </div>
                  <div
                    style={{
                      border: `1px solid ${th.preview[1]}50`,
                      borderRadius: 6,
                      padding: '7px 14px',
                      fontSize: 10,
                      color: th.preview[1] + '99',
                    }}
                  >
                    Docs
                  </div>
                </div>
                {/* Mini feature cards */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 8,
                    marginTop: 16,
                  }}
                >
                  {['SDK', 'Multi-chain', 'Billing', 'KYC'].map((l, j) => (
                    <div
                      key={j}
                      style={{
                        background: th.preview[2],
                        border: `1px solid ${th.preview[1]}18`,
                        borderRadius: 8,
                        padding: '10px 12px',
                      }}
                    >
                      <div
                        style={{
                          width: 16,
                          height: 16,
                          borderRadius: 4,
                          background: th.preview[1],
                          opacity: 0.6,
                          marginBottom: 6,
                        }}
                      />
                      <div
                        style={{
                          fontSize: 9,
                          color: th.preview[1],
                          opacity: 0.7,
                        }}
                      >
                        {l}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Card label */}
              <div
                style={{
                  background: '#111116',
                  padding: '20px 24px',
                  borderTop: `1px solid #ffffff08`,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <p
                      style={{
                        fontWeight: 600,
                        fontSize: 16,
                        color: '#f0f0f8',
                        letterSpacing: '-0.02em',
                        marginBottom: 4,
                      }}
                    >
                      {th.name}
                    </p>
                    <p
                      style={{
                        fontSize: 12,
                        color: '#6e6e8a',
                        lineHeight: 1.4,
                      }}
                    >
                      {th.desc}
                    </p>
                  </div>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      background: th.preview[1],
                      boxShadow: `0 0 16px ${th.preview[1]}60`,
                      flexShrink: 0,
                      marginLeft: 12,
                    }}
                  />
                </div>
                <div
                  style={{
                    marginTop: 16,
                    padding: '10px 16px',
                    background:
                      hov === key ? th.preview[1] + '15' : '#ffffff06',
                    borderRadius: 10,
                    textAlign: 'center',
                    border: `1px solid ${hov === key ? th.preview[1] + '50' : '#ffffff10'}`,
                    fontSize: 13,
                    color: hov === key ? th.preview[1] : '#888',
                    transition: 'all 0.2s',
                    fontWeight: 500,
                  }}
                >
                  {hov === key ? 'Click to select →' : 'Preview theme'}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
