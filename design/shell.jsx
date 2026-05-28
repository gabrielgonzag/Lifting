/* LIFTO — shell: sidebar, bottom nav, viewport toggle, header */

const NAV = [
  { id: 'home',      icon: 'home',     label: 'Home' },
  { id: 'fichas',    icon: 'book',     label: 'Fichas' },
  { id: 'treino',    icon: 'dumbbell', label: 'Treino' },
  { id: 'progresso', icon: 'chart',    label: 'Progresso' },
];

function Wordmark({ size = 22, color }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      fontWeight: 800, fontSize: size, letterSpacing: '-0.04em',
      fontFamily: 'var(--font-sans)', color: color || 'var(--fg)',
    }}>
      <div style={{
        width: size * 0.95, height: size * 0.95, borderRadius: 6,
        background: 'var(--lime)', display: 'grid', placeItems: 'center',
        boxShadow: '0 0 0 1px rgba(255,255,255,0.04) inset',
      }}>
        <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 24 24" fill="none">
          <path d="M5 7v10M9 4v16M15 4v16M19 7v10M3 12h2M19 12h2M9 12h6" stroke="#0a0a0a" strokeWidth="2.4" strokeLinecap="round" />
        </svg>
      </div>
      <span>LIFTO</span>
    </div>
  );
}

function PlanBadge({ plan = 'Casual' }) {
  const map = {
    Casual: { c: 'var(--plan-casual)' },
    Core:   { c: 'var(--plan-core)' },
    Coach:  { c: 'var(--plan-coach)' },
    Elite:  { c: 'var(--plan-elite)' },
  };
  const v = map[plan] || map.Casual;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase',
      color: v.c, padding: '3px 7px', borderRadius: 999,
      border: `1px solid ${v.c}33`, background: `${v.c}14`,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: 999, background: v.c }} />
      {plan}
    </span>
  );
}

function UserChip({ user, compact }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: compact ? '8px' : '10px 12px',
      background: 'var(--card)', border: '1px solid var(--border)',
      borderRadius: 12,
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: 999,
        background: 'linear-gradient(135deg, #2a2a2a, #1a1a1a)',
        display: 'grid', placeItems: 'center', flexShrink: 0,
        border: '1px solid var(--border-hi)',
        fontWeight: 700, fontSize: 13, letterSpacing: '-0.02em',
      }}>
        {user.name.split(' ').map(s => s[0]).slice(0, 2).join('')}
      </div>
      {!compact && (
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</div>
          <div style={{ marginTop: 2 }}><PlanBadge plan={user.plan} /></div>
        </div>
      )}
    </div>
  );
}

// ───────── Sidebar (desktop) ─────────
function Sidebar({ route, onRoute, user, onLogout }) {
  return (
    <aside style={{
      width: 232, flexShrink: 0,
      borderRight: '1px solid var(--border)',
      padding: '20px 14px',
      display: 'flex', flexDirection: 'column', gap: 18,
      background: 'var(--bg-1)',
    }}>
      <div style={{ padding: '4px 6px' }}>
        <Wordmark size={22} />
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {NAV.map(n => {
          const active = n.id === route;
          return (
            <button key={n.id} onClick={() => onRoute(n.id)} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '9px 10px', borderRadius: 8,
              background: active ? 'var(--card-hi)' : 'transparent',
              color: active ? 'var(--fg)' : 'var(--fg-2)',
              fontSize: 13.5, fontWeight: active ? 600 : 500,
              transition: 'background 120ms, color 120ms',
              textAlign: 'left', position: 'relative',
            }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'var(--card)'; e.currentTarget.style.color = 'var(--fg)'; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; if (!active) e.currentTarget.style.color = 'var(--fg-2)'; }}
            >
              {active && <span style={{
                position: 'absolute', left: -14, top: '50%', transform: 'translateY(-50%)',
                width: 3, height: 18, borderRadius: 2, background: 'var(--lime)',
              }} />}
              <Icon name={n.icon} size={17} stroke={active ? 1.9 : 1.6} />
              {n.label}
            </button>
          );
        })}
      </nav>

      <div style={{ flex: 1 }} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <UserChip user={user} />
        <button className="btn btn-ghost btn-sm" onClick={onLogout} style={{ justifyContent: 'flex-start', color: 'var(--fg-3)' }}>
          <Icon name="log_out" size={14} />
          Sair
        </button>
      </div>
    </aside>
  );
}

// ───────── Bottom nav (mobile) ─────────
function BottomNav({ route, onRoute }) {
  return (
    <nav style={{
      flexShrink: 0,
      display: 'grid', gridTemplateColumns: `repeat(${NAV.length}, 1fr)`,
      borderTop: '1px solid var(--border)',
      background: 'rgba(10,10,10,0.92)',
      backdropFilter: 'blur(14px)',
      WebkitBackdropFilter: 'blur(14px)',
      padding: '8px 4px 14px',
    }}>
      {NAV.map(n => {
        const active = n.id === route;
        return (
          <button key={n.id} onClick={() => onRoute(n.id)} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
            padding: '6px 4px', color: active ? 'var(--fg)' : 'var(--fg-3)',
            transition: 'color 120ms',
          }}>
            <div style={{ position: 'relative' }}>
              {active && <span style={{
                position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)',
                width: 22, height: 3, borderRadius: 2, background: 'var(--lime)',
              }} />}
              <Icon name={n.icon} size={20} stroke={active ? 1.9 : 1.6} />
            </div>
            <span style={{ fontSize: 10.5, fontWeight: active ? 600 : 500, letterSpacing: 0.02 }}>{n.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

// ───────── Top header (mobile) ─────────
function MobileHeader({ title, subtitle, right }) {
  return (
    <div style={{
      flexShrink: 0,
      padding: '20px 18px 14px',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12,
      borderBottom: '1px solid var(--border)',
    }}>
      <div style={{ minWidth: 0 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, letterSpacing: '-0.025em' }}>{title}</h1>
        {subtitle && <div style={{ marginTop: 4, color: 'var(--fg-3)', fontSize: 13 }}>{subtitle}</div>}
      </div>
      {right}
    </div>
  );
}

// ───────── Desktop header ─────────
function DesktopHeader({ title, subtitle, right }) {
  return (
    <div style={{
      flexShrink: 0,
      padding: '24px 32px 18px',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16,
      borderBottom: '1px solid var(--border)',
    }}>
      <div style={{ minWidth: 0 }}>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700, letterSpacing: '-0.03em' }}>{title}</h1>
        {subtitle && <div style={{ marginTop: 4, color: 'var(--fg-3)', fontSize: 14 }}>{subtitle}</div>}
      </div>
      {right && <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>{right}</div>}
    </div>
  );
}

// ───────── Viewport switcher (host UI, outside the app) ─────────
function ViewportSwitch({ viewport, onChange }) {
  const opts = [
    { id: 'desktop', icon: 'monitor', label: 'Desktop' },
    { id: 'mobile',  icon: 'smartphone', label: 'Mobile'  },
  ];
  return (
    <div style={{
      display: 'inline-flex', padding: 3, borderRadius: 999,
      background: 'rgba(20,20,20,0.8)', border: '1px solid var(--border)',
      backdropFilter: 'blur(10px)',
    }}>
      {opts.map(o => {
        const active = o.id === viewport;
        return (
          <button key={o.id} onClick={() => onChange(o.id)} style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            height: 28, padding: '0 12px', borderRadius: 999,
            background: active ? 'var(--fg)' : 'transparent',
            color: active ? 'var(--bg)' : 'var(--fg-2)',
            fontSize: 12, fontWeight: 600, letterSpacing: '-0.005em',
            transition: 'all 160ms ease',
          }}>
            <Icon name={o.icon} size={13} />
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

// ───────── Empty state ─────────
function EmptyState({ icon = 'sparkles', title, body, action }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
      padding: '48px 24px', gap: 14,
    }}>
      <div style={{
        width: 56, height: 56, borderRadius: 16,
        background: 'var(--card)', border: '1px solid var(--border)',
        display: 'grid', placeItems: 'center', color: 'var(--lime)',
      }}>
        <Icon name={icon} size={24} stroke={1.6} />
      </div>
      <div>
        <div style={{ fontSize: 16, fontWeight: 600, letterSpacing: '-0.01em' }}>{title}</div>
        <div style={{ marginTop: 6, color: 'var(--fg-3)', fontSize: 13.5, maxWidth: 360 }}>{body}</div>
      </div>
      {action}
    </div>
  );
}

// ───────── Phone frame ─────────
function PhoneFrame({ children }) {
  return (
    <div style={{
      width: 390, height: 800,
      borderRadius: 44, padding: 8,
      background: '#1a1a1a',
      boxShadow: '0 0 0 1px rgba(255,255,255,0.08), 0 40px 100px rgba(0,0,0,0.6)',
      position: 'relative',
      flexShrink: 0,
    }}>
      <div style={{
        width: '100%', height: '100%', borderRadius: 36,
        background: 'var(--bg)', overflow: 'hidden',
        display: 'flex', flexDirection: 'column', position: 'relative',
      }}>
        {/* status bar */}
        <div style={{
          flexShrink: 0, height: 44, display: 'flex', alignItems: 'flex-end',
          justifyContent: 'space-between', padding: '0 28px 6px',
          fontSize: 13, fontWeight: 600, color: 'var(--fg)',
          position: 'relative', zIndex: 2,
        }}>
          <span className="mono">9:41</span>
          <div style={{
            position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)',
            width: 110, height: 28, borderRadius: 999, background: '#000',
          }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <svg width="16" height="11" viewBox="0 0 16 11" fill="none"><path d="M1 6h2v4H1zM5 4h2v6H5zM9 2h2v8H9zM13 0h2v10h-2z" fill="currentColor" /></svg>
            <svg width="14" height="11" viewBox="0 0 14 11" fill="none"><path d="M7 2c2 0 4 .7 5.5 2L13.5 3a8 8 0 0 0-13 0l1 1A7.5 7.5 0 0 1 7 2zm0 3c1.2 0 2.3.4 3.2 1.2l1-1A6 6 0 0 0 2.8 5.2l1 1A4.5 4.5 0 0 1 7 5zm0 3c.5 0 1 .2 1.4.6l1-1a3 3 0 0 0-4.8 0l1 1c.4-.4.9-.6 1.4-.6zm0 2.5a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" fill="currentColor" /></svg>
            <div style={{ display: 'inline-flex', alignItems: 'center' }}>
              <div style={{ width: 22, height: 11, border: '1px solid currentColor', borderRadius: 3, position: 'relative', opacity: 0.8 }}>
                <div style={{ position: 'absolute', inset: 1.5, width: 16, background: 'currentColor', borderRadius: 1 }} />
              </div>
              <div style={{ width: 1.5, height: 4, background: 'currentColor', marginLeft: 1, borderRadius: 0.5, opacity: 0.5 }} />
            </div>
          </div>
        </div>
        <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
          {children}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, {
  Wordmark, PlanBadge, UserChip, Sidebar, BottomNav, MobileHeader, DesktopHeader,
  ViewportSwitch, EmptyState, PhoneFrame, NAV,
});
