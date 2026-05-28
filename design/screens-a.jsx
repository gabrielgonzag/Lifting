/* LIFTO — Login, Home, Fichas screens */

// ───────── LOGIN ─────────
function LoginScreen({ onLogin, isMobile }) {
  const [loading, setLoading] = React.useState(false);
  const submit = () => {
    setLoading(true);
    setTimeout(() => { setLoading(false); onLogin(); }, 1100);
  };
  return (
    <div style={{
      width: '100%', height: '100%', position: 'relative',
      display: 'flex', flexDirection: 'column',
      background: 'var(--bg)',
      overflow: 'hidden',
    }}>
      {/* premium gradient background */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: `
          radial-gradient(800px 500px at 10% 0%, rgba(205,255,0,0.10), transparent 60%),
          radial-gradient(700px 600px at 100% 100%, rgba(255,107,91,0.06), transparent 60%),
          linear-gradient(180deg, #0a0a0a 0%, #050505 100%)
        `,
      }} />
      {/* subtle grid */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.4,
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
        backgroundSize: '32px 32px',
        maskImage: 'radial-gradient(circle at 50% 40%, black 0%, transparent 70%)',
        WebkitMaskImage: 'radial-gradient(circle at 50% 40%, black 0%, transparent 70%)',
      }} />

      <div style={{
        position: 'relative', flex: 1, display: 'flex',
        flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: isMobile ? '24px' : '40px',
        gap: isMobile ? 32 : 40,
      }}>
        <div className="anim-rise" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
          <div style={{
            width: isMobile ? 64 : 80, height: isMobile ? 64 : 80,
            borderRadius: isMobile ? 18 : 22,
            background: 'var(--lime)',
            display: 'grid', placeItems: 'center',
            boxShadow: '0 0 0 1px rgba(255,255,255,0.08) inset, 0 16px 48px rgba(205,255,0,0.25)',
          }}>
            <svg width={isMobile ? 38 : 48} height={isMobile ? 38 : 48} viewBox="0 0 24 24" fill="none">
              <path d="M5 7v10M9 4v16M15 4v16M19 7v10M3 12h2M19 12h2M9 12h6" stroke="#0a0a0a" strokeWidth="2.4" strokeLinecap="round" />
            </svg>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: isMobile ? 44 : 60, fontWeight: 900, letterSpacing: '-0.045em',
              lineHeight: 0.95,
            }}>LIFTO</div>
            <div style={{
              marginTop: isMobile ? 10 : 14, color: 'var(--fg-2)',
              fontSize: isMobile ? 15 : 18, fontWeight: 400, letterSpacing: '-0.01em',
            }}>
              Treino sério. <span style={{ color: 'var(--fg)' }}>Resultado real.</span>
            </div>
          </div>
        </div>

        <div className="anim-slide-up" style={{
          width: '100%', maxWidth: isMobile ? '100%' : 340,
          display: 'flex', flexDirection: 'column', gap: 10,
        }}>
          <button onClick={submit} disabled={loading} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            height: 52, background: 'var(--fg)', color: '#0a0a0a',
            borderRadius: 12, fontSize: 15, fontWeight: 600,
            transition: 'opacity 120ms, transform 80ms',
            opacity: loading ? 0.7 : 1,
          }}>
            {loading ? (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 800ms linear infinite' }}>
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.4" opacity="0.2" />
                  <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
                </svg>
                Entrando…
              </>
            ) : (
              <>
                <Icon name="google" size={18} stroke={0} />
                Entrar com Google
              </>
            )}
          </button>
          <button style={{
            height: 44, color: 'var(--fg-3)', fontSize: 13, fontWeight: 500,
            transition: 'color 120ms',
          }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--fg)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--fg-3)'}
          >
            Continuar como visitante
          </button>
        </div>
      </div>

      <div style={{
        position: 'relative', padding: '20px 24px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontSize: 11, color: 'var(--fg-4)', letterSpacing: 0.04,
      }}>
        <span>v2.4.1</span>
        <span>© 2026 LIFTO</span>
      </div>
    </div>
  );
}

// ───────── HOME ─────────
function StreakStrip({ days }) {
  const today = 3; // index of today
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      {days.map((d, i) => {
        const isToday = i === today;
        return (
          <div key={i} style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
          }}>
            <div style={{
              fontSize: 10, fontWeight: 600, letterSpacing: 0.08,
              color: isToday ? 'var(--fg)' : 'var(--fg-4)',
              textTransform: 'uppercase',
            }}>{d.d}</div>
            <div style={{
              width: '100%', height: 30, borderRadius: 6,
              background: d.done ? 'var(--lime)' : 'var(--card)',
              border: d.done ? 'none' : '1px solid var(--border)',
              boxShadow: isToday && !d.done ? 'inset 0 0 0 1px var(--border-hi)' : 'none',
              opacity: d.done ? 1 : 0.6,
              display: 'grid', placeItems: 'center',
            }}>
              {isToday && !d.done && <div style={{ width: 4, height: 4, borderRadius: 999, background: 'var(--fg-2)' }} />}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function HomeScreen({ user, fichas, onContinue, onGoFichas, onGoTreino, onGoProgresso, onNewFicha, isMobile }) {
  const last = fichas[0];
  const hour = new Date().getHours();
  const greet = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';

  return (
    <div style={{ flex: 1, overflow: 'auto' }}>
      <div style={{ padding: isMobile ? '20px 18px 40px' : '28px 32px 40px', display: 'flex', flexDirection: 'column', gap: isMobile ? 20 : 24, maxWidth: 980, margin: '0 auto' }}>

        {/* Greeting */}
        <div className="anim-rise">
          <div style={{ fontSize: 13, color: 'var(--fg-3)', fontWeight: 500 }}>
            {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }).replace(/^./, c => c.toUpperCase())}
          </div>
          <h1 style={{ margin: '4px 0 0', fontSize: isMobile ? 28 : 36, fontWeight: 700, letterSpacing: '-0.035em' }}>
            {greet}, <span style={{ color: 'var(--fg-2)' }}>{user.name.split(' ')[0]}.</span>
          </h1>
        </div>

        {/* Continue card (hero) */}
        {last ? (
          <ContinueCard ficha={last} onContinue={onContinue} isMobile={isMobile} />
        ) : (
          <div className="card card-pad anim-rise" style={{ padding: 24 }}>
            <EmptyState
              icon="dumbbell"
              title="Você ainda não tem nenhuma ficha."
              body="Crie sua primeira rotina e comece a registrar treinos hoje."
              action={
                <button className="btn btn-primary" onClick={onNewFicha}>
                  <Icon name="plus" size={16} stroke={2.2} />
                  Criar primeira ficha
                </button>
              }
            />
          </div>
        )}

        {/* Streak */}
        <div className="card card-pad anim-rise">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 12, color: 'var(--fg-3)', fontWeight: 500, letterSpacing: 0.04 }}>Esta semana</div>
              <div style={{ marginTop: 4, fontSize: 22, fontWeight: 700, letterSpacing: '-0.025em', display: 'flex', alignItems: 'baseline', gap: 8 }}>
                4 <span style={{ fontSize: 13, color: 'var(--fg-3)', fontWeight: 500 }}>de 5 dias</span>
              </div>
            </div>
            <div className="badge" style={{ color: 'var(--lime)', background: 'var(--lime-soft)', borderColor: 'var(--lime-line)' }}>
              <Icon name="flame" size={12} />
              3 semanas
            </div>
          </div>
          <StreakStrip days={STREAK_DAYS} />
        </div>

        {/* Quick stats / shortcuts */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(3, 1fr)', gap: 12 }}>
          <StatTile icon="trophy" label="Último PR" value="Supino 75kg" sub="há 2 dias" tint="lime" onClick={onGoProgresso} />
          <StatTile icon="dumbbell" label="Volume da semana" value="12.4t" sub="+8% vs anterior" onClick={onGoProgresso} />
          {!isMobile && <StatTile icon="book" label="Fichas ativas" value={fichas.length} sub="ver todas" onClick={onGoFichas} />}
        </div>

      </div>
    </div>
  );
}

function ContinueCard({ ficha, onContinue, isMobile }) {
  const color = FICHA_COLORS[ficha.color];
  const groups = groupsForFicha(ficha);
  return (
    <div className="anim-rise" style={{
      position: 'relative', overflow: 'hidden',
      background: 'var(--card-hi)', border: '1px solid var(--border)',
      borderRadius: 18, padding: isMobile ? 18 : 22,
    }}>
      {/* gradient accent */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: color.bg,
      }} />
      <div style={{
        position: 'absolute', top: -80, right: -60, width: 220, height: 220,
        background: `radial-gradient(circle, ${color.soft}, transparent 70%)`,
        pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative', display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'flex-start' : 'flex-end', gap: 20 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span className="label" style={{ color: color.bg }}>Continuar onde parou</span>
            <span className="badge"><Icon name="clock" size={10} />{fmtAgo(ficha.lastUsed)}</span>
          </div>
          <h2 style={{ margin: 0, fontSize: isMobile ? 24 : 30, fontWeight: 700, letterSpacing: '-0.03em' }}>{ficha.title}</h2>
          <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {groups.map(g => (
              <span key={g} style={{
                fontSize: 11, fontWeight: 500, padding: '3px 8px', borderRadius: 999,
                background: 'var(--card)', color: 'var(--fg-1)',
                border: '1px solid var(--border)',
              }}>{g}</span>
            ))}
            <span style={{
              fontSize: 11, fontWeight: 500, padding: '3px 8px', borderRadius: 999,
              color: 'var(--fg-3)',
            }}>{ficha.exercises.length} exercícios</span>
          </div>
        </div>
        <button onClick={onContinue} className="btn btn-primary" style={{
          height: 48, padding: '0 22px', borderRadius: 12, fontSize: 15,
          width: isMobile ? '100%' : 'auto',
        }}>
          <Icon name="play" size={14} stroke={0} />
          Continuar treino
        </button>
      </div>
    </div>
  );
}

function StatTile({ icon, label, value, sub, tint, onClick }) {
  return (
    <button onClick={onClick} className="card" style={{
      textAlign: 'left', padding: 14,
      transition: 'background 120ms, border-color 120ms, transform 80ms',
    }}
      onMouseEnter={e => { e.currentTarget.style.background = 'var(--card-hi)'; e.currentTarget.style.borderColor = 'var(--border-hi)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'var(--card)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: tint === 'lime' ? 'var(--lime)' : 'var(--fg-3)', marginBottom: 8 }}>
        <Icon name={icon} size={14} />
        <span style={{ fontSize: 11, fontWeight: 500, letterSpacing: 0.04, textTransform: 'uppercase', color: 'var(--fg-3)' }}>{label}</span>
      </div>
      <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em' }}>{value}</div>
      {sub && <div style={{ marginTop: 2, fontSize: 12, color: 'var(--fg-3)' }}>{sub}</div>}
    </button>
  );
}

// ───────── FICHAS ─────────
function FichasScreen({ fichas, onOpen, onNew, onTreinar, isMobile }) {
  return (
    <div style={{ flex: 1, overflow: 'auto' }}>
      <div style={{ padding: isMobile ? '8px 18px 100px' : '24px 32px 60px', maxWidth: 980, margin: '0 auto' }}>
        {fichas.length === 0 ? (
          <div className="card card-pad" style={{ padding: 24 }}>
            <EmptyState
              icon="sparkles"
              title="Sua próxima rotina começa aqui."
              body="Monte uma ficha por grupo muscular e treine com foco."
              action={<button className="btn btn-primary" onClick={onNew}><Icon name="plus" size={16} />Criar ficha</button>}
            />
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 14,
          }}>
            {fichas.map((f, i) => (
              <FichaCard key={f.id} ficha={f} onOpen={() => onOpen(f)} onTreinar={() => onTreinar(f)} delay={i * 40} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function FichaCard({ ficha, onOpen, onTreinar, delay }) {
  const color = FICHA_COLORS[ficha.color];
  const groups = groupsForFicha(ficha);
  const [hover, setHover] = React.useState(false);
  return (
    <div
      className="anim-rise"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: 'relative', overflow: 'hidden',
        background: 'var(--card)', border: '1px solid var(--border)',
        borderRadius: 16, padding: 18,
        transition: 'background 120ms, border-color 120ms, transform 120ms',
        background: hover ? 'var(--card-hi)' : 'var(--card)',
        borderColor: hover ? 'var(--border-hi)' : 'var(--border)',
        animationDelay: `${delay}ms`,
        animationFillMode: 'both',
      }}
    >
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: color.bg,
      }} />
      <div style={{
        position: 'absolute', top: -40, right: -40, width: 140, height: 140,
        background: `radial-gradient(circle, ${color.soft}, transparent 70%)`,
        pointerEvents: 'none', opacity: hover ? 1 : 0.6, transition: 'opacity 200ms',
      }} />

      <div style={{ position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 12 }}>
          <span className="badge" style={{ background: 'transparent', borderColor: 'var(--border-hi)' }}>
            <Icon name="clock" size={10} />
            {fmtAgo(ficha.lastUsed)}
          </span>
          <button onClick={onOpen} className="btn btn-ghost btn-sm" style={{ padding: '0 8px', color: 'var(--fg-3)' }} aria-label="Abrir">
            <Icon name="edit" size={14} />
          </button>
        </div>
        <h3 style={{ margin: '0 0 6px', fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em' }}>{ficha.title}</h3>
        <div style={{ color: 'var(--fg-3)', fontSize: 13, minHeight: 19 }}>{ficha.desc}</div>

        <div style={{ marginTop: 14, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {groups.slice(0, 4).map(g => (
            <span key={g} style={{
              fontSize: 11, fontWeight: 500, padding: '3px 8px', borderRadius: 999,
              background: 'var(--bg-1)', color: 'var(--fg-1)',
              border: '1px solid var(--border)',
            }}>{g}</span>
          ))}
          {groups.length > 4 && (
            <span style={{ fontSize: 11, color: 'var(--fg-3)', padding: '3px 4px' }}>+{groups.length - 4}</span>
          )}
        </div>

        <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <span style={{ fontSize: 12, color: 'var(--fg-3)' }}>{ficha.exercises.length} exercícios</span>
          <button onClick={onTreinar} className="btn btn-sm" style={{
            background: color.bg, color: color.ink, fontWeight: 600,
          }}>
            <Icon name="play" size={11} stroke={0} />
            Treinar agora
          </button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { LoginScreen, HomeScreen, FichasScreen });
