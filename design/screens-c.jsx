/* LIFTING — Progresso screen + custom SVG charts */

// ───────── Line chart (PR over time) ─────────
function LineChart({ data, height = 200, color = '#CDFF00', label }) {
  const w = 100, h = 100; // viewbox %
  const max = Math.max(...data.map(d => d.kg));
  const min = Math.min(...data.map(d => d.kg));
  const range = max - min || 1;
  const padTop = 15, padBot = 18, padX = 4;
  const xStep = (w - padX * 2) / (data.length - 1 || 1);
  const yFor = (kg) => padTop + (1 - (kg - min) / range) * (h - padTop - padBot);

  const points = data.map((d, i) => ({ x: padX + i * xStep, y: yFor(d.kg), kg: d.kg, date: d.date }));
  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = `${path} L ${points[points.length - 1].x} ${h - padBot} L ${points[0].x} ${h - padBot} Z`;

  const last = data[data.length - 1];
  const first = data[0];
  const delta = last.kg - first.kg;
  const pct = ((delta / first.kg) * 100);

  const [hover, setHover] = React.useState(null);

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 14 }}>
        <div>
          <div className="label">Carga máxima</div>
          <div style={{ marginTop: 4, display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span className="mono" style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.025em' }}>{(hover?.kg ?? last.kg)}</span>
            <span style={{ fontSize: 13, color: 'var(--fg-3)', fontWeight: 500 }}>kg</span>
          </div>
        </div>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '4px 10px', borderRadius: 999,
          background: 'var(--lime-soft)', border: '1px solid var(--lime-line)',
          color: 'var(--lime)', fontSize: 12, fontWeight: 600,
        }}>
          <Icon name="chevron_u" size={11} stroke={2.4} />
          +{delta.toFixed(1)}kg · +{pct.toFixed(0)}%
        </div>
      </div>

      <div style={{ position: 'relative', height }}>
        <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ width: '100%', height: '100%', display: 'block' }}>
          <defs>
            <linearGradient id="line-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.24" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>
          {/* horizontal gridlines */}
          {[0.25, 0.5, 0.75].map(t => (
            <line key={t} x1={padX} x2={w - padX} y1={padTop + t * (h - padTop - padBot)} y2={padTop + t * (h - padTop - padBot)} stroke="rgba(255,255,255,0.05)" strokeWidth="0.2" />
          ))}
          {/* area */}
          <path d={areaPath} fill="url(#line-grad)" />
          {/* line */}
          <path d={path} fill="none" stroke={color} strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
          {/* points */}
          {points.map((p, i) => (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r="0.8" fill={color} />
              {i === points.length - 1 && (
                <circle cx={p.x} cy={p.y} r="2.4" fill="none" stroke={color} strokeWidth="0.4" opacity="0.4">
                  <animate attributeName="r" from="0.8" to="3" dur="1.4s" repeatCount="indefinite" />
                  <animate attributeName="opacity" from="0.6" to="0" dur="1.4s" repeatCount="indefinite" />
                </circle>
              )}
            </g>
          ))}
        </svg>
        {/* hover overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'grid', gridTemplateColumns: `repeat(${points.length}, 1fr)`,
        }}>
          {points.map((p, i) => (
            <div key={i}
              onMouseEnter={() => setHover({ kg: data[i].kg, date: data[i].date })}
              onMouseLeave={() => setHover(null)}
              style={{ cursor: 'crosshair' }} />
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
        {data.map((d, i) => (
          <span key={i} style={{
            fontSize: 10, fontWeight: 500, color: 'var(--fg-4)',
            letterSpacing: 0.04,
          }}>{d.date}</span>
        ))}
      </div>
    </div>
  );
}

// ───────── Bar chart (week frequency) ─────────
function BarChart({ data, height = 160, color = '#CDFF00' }) {
  const max = Math.max(...data.map(d => d.days), 7);
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height }}>
        {data.map((d, i) => {
          const isLast = i === data.length - 1;
          const ratio = d.days / max;
          return (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, height: '100%' }}>
              <div style={{ flex: 1, width: '100%', display: 'flex', alignItems: 'flex-end' }}>
                <div className="anim-rise" style={{
                  width: '100%', borderRadius: 6,
                  height: `${ratio * 100}%`,
                  background: isLast ? color : 'var(--card-hi)',
                  border: isLast ? 'none' : '1px solid var(--border-hi)',
                  position: 'relative',
                  animationDelay: `${i * 50}ms`,
                  animationFillMode: 'both',
                }}>
                  <span className="mono t-num" style={{
                    position: 'absolute', top: -18, left: '50%', transform: 'translateX(-50%)',
                    fontSize: 10.5, fontWeight: 600,
                    color: isLast ? color : 'var(--fg-3)',
                  }}>{d.days}</span>
                </div>
              </div>
              <span style={{
                fontSize: 10, fontWeight: 500, color: isLast ? 'var(--fg)' : 'var(--fg-4)', letterSpacing: 0.04,
              }}>{d.w}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ───────── ACHIEVEMENT chip ─────────
function Achievement({ icon, title, sub, tint }) {
  const colors = {
    lime:   { bg: 'var(--lime-soft)',  line: 'var(--lime-line)',  fg: 'var(--lime)'  },
    coral:  { bg: 'var(--coral-soft)', line: 'var(--coral-line)', fg: 'var(--coral)' },
    sky:    { bg: 'rgba(126,196,255,0.12)', line: 'rgba(126,196,255,0.3)', fg: '#7ec4ff' },
    amber:  { bg: 'rgba(245,196,81,0.12)',  line: 'rgba(245,196,81,0.3)',  fg: '#f5c451' },
  };
  const c = colors[tint] || colors.lime;
  return (
    <div className="anim-rise" style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: 14, borderRadius: 12,
      background: 'var(--card)', border: '1px solid var(--border)',
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 10,
        background: c.bg, border: `1px solid ${c.line}`,
        display: 'grid', placeItems: 'center', color: c.fg, flexShrink: 0,
      }}>
        <Icon name={icon} size={16} />
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 13.5, fontWeight: 600, letterSpacing: '-0.005em' }}>{title}</div>
        <div style={{ fontSize: 12, color: 'var(--fg-3)', marginTop: 1 }}>{sub}</div>
      </div>
    </div>
  );
}

// ───────── PROGRESSO ─────────
function ProgressoScreen({ isMobile }) {
  const exerciseOpts = Object.keys(PR_HISTORY);
  const [selExercise, setSelExercise] = React.useState(exerciseOpts[0]);
  const data = PR_HISTORY[selExercise];

  return (
    <div style={{ flex: 1, overflow: 'auto' }}>
      <div style={{ padding: isMobile ? '20px 18px 100px' : '28px 32px 40px', maxWidth: 980, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Insight pill */}
        <div className="anim-rise" style={{
          position: 'relative', overflow: 'hidden',
          padding: 18, borderRadius: 14,
          background: 'var(--card-hi)', border: '1px solid var(--border)',
        }}>
          <div style={{
            position: 'absolute', top: -50, right: -50, width: 180, height: 180,
            background: 'radial-gradient(circle, rgba(205,255,0,0.12), transparent 70%)',
            pointerEvents: 'none',
          }} />
          <div style={{ position: 'relative', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8, flexShrink: 0,
              background: 'var(--lime-soft)', border: '1px solid var(--lime-line)',
              display: 'grid', placeItems: 'center', color: 'var(--lime)',
            }}>
              <Icon name="sparkles" size={15} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--lime)', letterSpacing: 0.06, textTransform: 'uppercase' }}>Insight da semana</div>
              <div style={{ marginTop: 4, fontSize: isMobile ? 16 : 18, fontWeight: 600, letterSpacing: '-0.015em', textWrap: 'pretty' }}>
                Você manteve a ficha em movimento.
              </div>
              <div style={{ marginTop: 4, color: 'var(--fg-3)', fontSize: 13, textWrap: 'pretty' }}>
                Supino reto subiu de 62,5kg para 75kg em 10 semanas. Consistência é o seu motor.
              </div>
            </div>
          </div>
        </div>

        {/* PR chart */}
        <div className="card card-pad anim-rise">
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
            marginBottom: 14, flexWrap: 'wrap',
          }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-0.01em' }}>Evolução de força</div>
              <div style={{ fontSize: 12, color: 'var(--fg-3)', marginTop: 2 }}>10 semanas, marcos de PR</div>
            </div>
            <div style={{ position: 'relative' }}>
              <select value={selExercise} onChange={e => setSelExercise(e.target.value)} style={{
                appearance: 'none', WebkitAppearance: 'none',
                background: 'var(--card)', border: '1px solid var(--border-hi)',
                color: 'var(--fg)', borderRadius: 10,
                padding: '8px 30px 8px 12px', fontSize: 13, fontWeight: 500,
                cursor: 'pointer',
              }}>
                {exerciseOpts.map(id => (
                  <option key={id} value={id} style={{ background: '#0f0f0f' }}>{exerciseById(id).name}</option>
                ))}
              </select>
              <Icon name="chevron_d" size={14} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--fg-3)', pointerEvents: 'none' }} />
            </div>
          </div>
          <LineChart data={data} height={isMobile ? 180 : 220} />
        </div>

        {/* Frequency + Achievements */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.3fr 1fr', gap: 14 }}>
          <div className="card card-pad anim-rise">
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 18 }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-0.01em' }}>Frequência</div>
                <div style={{ fontSize: 12, color: 'var(--fg-3)', marginTop: 2 }}>Treinos por semana</div>
              </div>
              <div className="badge" style={{ color: 'var(--lime)', background: 'var(--lime-soft)', borderColor: 'var(--lime-line)' }}>
                Média 3.8
              </div>
            </div>
            <BarChart data={WEEK_FREQ} height={isMobile ? 140 : 160} />
          </div>

          <div className="card card-pad anim-rise">
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-0.01em' }}>Conquistas recentes</div>
              <div style={{ fontSize: 12, color: 'var(--fg-3)', marginTop: 2 }}>Você está construindo algo.</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Achievement icon="flame" title="3 semanas em chamas" sub="Mais de 3 treinos/semana" tint="coral" />
              <Achievement icon="trophy" title="Novo PR: Supino 75kg" sub="há 2 dias · +2,5kg" tint="lime" />
              <Achievement icon="calendar" title="Você treinou 4× essa semana" sub="meta semanal: 4 dias" tint="sky" />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

Object.assign(window, { ProgressoScreen, LineChart, BarChart, Achievement });
