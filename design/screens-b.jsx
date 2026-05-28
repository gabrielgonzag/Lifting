/* LIFTO — Editor (ficha edit) + Treino screens */

// ───────── EDITOR DE FICHA ─────────
function EditorScreen({ ficha, onSave, onCancel, isMobile }) {
  const [title, setTitle] = React.useState(ficha.title);
  const [desc, setDesc]   = React.useState(ficha.desc);
  const [color, setColor] = React.useState(ficha.color);
  const [exercises, setExercises] = React.useState(ficha.exercises);
  const [pickerOpen, setPickerOpen] = React.useState(false);
  const toast = useToast();

  const addExercise = (id) => {
    if (exercises.includes(id)) {
      setExercises(exercises.filter(x => x !== id));
    } else {
      setExercises([...exercises, id]);
    }
  };
  const removeExercise = (id) => setExercises(exercises.filter(x => x !== id));

  const move = (idx, dir) => {
    const next = [...exercises];
    const ni = idx + dir;
    if (ni < 0 || ni >= next.length) return;
    [next[idx], next[ni]] = [next[ni], next[idx]];
    setExercises(next);
  };

  const save = () => {
    onSave({ ...ficha, title, desc, color, exercises, lastUsed: Date.now() });
    toast({ kind: 'ok', msg: 'Ficha salva' });
  };

  // mobile = bottom sheet, desktop = side panel
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      {/* Header — back + title editable */}
      <div style={{
        flexShrink: 0,
        padding: isMobile ? '16px 18px 12px' : '20px 32px 14px',
        display: 'flex', alignItems: 'center', gap: 12,
        borderBottom: '1px solid var(--border)',
      }}>
        <button className="btn btn-ghost btn-icon btn-sm" onClick={onCancel} aria-label="Voltar">
          <Icon name="arrow_l" size={16} />
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 11, color: 'var(--fg-3)', fontWeight: 500, letterSpacing: 0.06, textTransform: 'uppercase' }}>Editar ficha</div>
          <InlineTitle value={title} onChange={setTitle} />
        </div>
        {!isMobile && (
          <>
            <button className="btn btn-ghost" onClick={onCancel}>Cancelar</button>
            <button className="btn btn-primary" onClick={save}><Icon name="check" size={15} stroke={2.4} />Salvar ficha</button>
          </>
        )}
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: isMobile ? 'column' : 'row', minHeight: 0, overflow: 'hidden' }}>
        {/* Form */}
        <div style={{ flex: 1, minWidth: 0, overflow: 'auto', padding: isMobile ? '16px 18px 100px' : '24px 32px' }}>
          <div style={{ maxWidth: 640, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 22 }}>

            <Field label="Descrição curta">
              <input className="input" value={desc} onChange={e => setDesc(e.target.value)} placeholder="Ex: Push pesado, foco em supino" />
            </Field>

            <Field label="Cor da ficha">
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {Object.entries(FICHA_COLORS).map(([k, c]) => (
                  <button key={k} onClick={() => setColor(k)} aria-label={c.name} style={{
                    width: 36, height: 36, borderRadius: 10, background: c.bg,
                    position: 'relative', cursor: 'pointer',
                    boxShadow: color === k
                      ? `0 0 0 2px var(--bg), 0 0 0 4px ${c.bg}`
                      : 'inset 0 0 0 1px rgba(255,255,255,0.08)',
                    transition: 'transform 100ms',
                    transform: color === k ? 'scale(1)' : 'scale(0.94)',
                  }}>
                    {color === k && (
                      <span style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', color: c.ink }}>
                        <Icon name="check" size={16} stroke={3} />
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </Field>

            <Field
              label={`Exercícios da ficha (${exercises.length})`}
              hint="Arraste para reordenar."
              right={
                <button className="btn btn-secondary btn-sm" onClick={() => setPickerOpen(true)}>
                  <Icon name="plus" size={14} stroke={2.2} />
                  Adicionar
                </button>
              }
            >
              {exercises.length === 0 ? (
                <div style={{
                  padding: '24px 16px', textAlign: 'center', color: 'var(--fg-3)',
                  background: 'var(--bg-1)', border: '1px dashed var(--border-hi)',
                  borderRadius: 12, fontSize: 13,
                }}>
                  Nenhum exercício ainda. Toque em <b>Adicionar</b>.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {exercises.map((id, i) => {
                    const ex = exerciseById(id);
                    return (
                      <div key={id} className="anim-rise" style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '10px 12px', background: 'var(--bg-1)',
                        border: '1px solid var(--border)', borderRadius: 10,
                      }}>
                        <button onMouseDown={e => e.preventDefault()} style={{ color: 'var(--fg-4)', cursor: 'grab', display: 'grid', placeItems: 'center' }} aria-label="Arrastar">
                          <Icon name="drag" size={16} />
                        </button>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 14, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ex.name}</div>
                          <div style={{ fontSize: 11.5, color: 'var(--fg-3)' }}>{ex.group} · {ex.kind}</div>
                        </div>
                        <div style={{ display: 'flex', gap: 2 }}>
                          <button className="btn btn-ghost btn-sm btn-icon" onClick={() => move(i, -1)} disabled={i === 0} style={{ opacity: i === 0 ? 0.3 : 1 }} aria-label="Subir"><Icon name="chevron_u" size={14} /></button>
                          <button className="btn btn-ghost btn-sm btn-icon" onClick={() => move(i, 1)} disabled={i === exercises.length - 1} style={{ opacity: i === exercises.length - 1 ? 0.3 : 1 }} aria-label="Descer"><Icon name="chevron_d" size={14} /></button>
                          <button className="btn btn-ghost btn-sm btn-icon" onClick={() => removeExercise(id)} style={{ color: 'var(--coral)' }} aria-label="Remover"><Icon name="x" size={14} /></button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Field>
          </div>
        </div>

        {/* Desktop side picker, mobile bottom sheet */}
        {!isMobile ? (
          <div style={{
            width: 380, flexShrink: 0,
            borderLeft: '1px solid var(--border)',
            background: 'var(--bg-1)',
            overflow: 'hidden', display: 'flex', flexDirection: 'column',
          }}>
            <ExercisePicker selected={exercises} onToggle={addExercise} embedded />
          </div>
        ) : (
          <>
            {/* Mobile floating Save */}
            <div style={{
              position: 'absolute', left: 0, right: 0, bottom: 0,
              padding: '12px 18px 18px',
              background: 'linear-gradient(180deg, transparent, var(--bg) 30%)',
              display: 'flex', gap: 8,
            }}>
              <button className="btn btn-secondary" onClick={() => setPickerOpen(true)} style={{ flexShrink: 0 }}>
                <Icon name="plus" size={15} stroke={2.2} />
              </button>
              <button className="btn btn-primary" onClick={save} style={{ flex: 1, height: 48, fontSize: 15 }}>
                <Icon name="check" size={15} stroke={2.4} />
                Salvar ficha
              </button>
            </div>

            {pickerOpen && (
              <div style={{
                position: 'absolute', inset: 0, zIndex: 50,
                background: 'rgba(0,0,0,0.5)',
              }} onClick={() => setPickerOpen(false)}>
                <div onClick={e => e.stopPropagation()} className="anim-slide-up" style={{
                  position: 'absolute', left: 0, right: 0, bottom: 0,
                  height: '85%', background: 'var(--bg-1)',
                  borderRadius: '20px 20px 0 0', border: '1px solid var(--border)',
                  display: 'flex', flexDirection: 'column', overflow: 'hidden',
                }}>
                  <div style={{ padding: '8px 0 4px', display: 'grid', placeItems: 'center' }}>
                    <div style={{ width: 40, height: 4, borderRadius: 999, background: 'var(--border-hi)' }} />
                  </div>
                  <ExercisePicker selected={exercises} onToggle={addExercise} onClose={() => setPickerOpen(false)} />
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function InlineTitle({ value, onChange }) {
  const [editing, setEditing] = React.useState(false);
  const ref = React.useRef(null);
  React.useEffect(() => { if (editing) ref.current?.focus(); }, [editing]);
  return editing ? (
    <input ref={ref} value={value} onChange={e => onChange(e.target.value)}
      onBlur={() => setEditing(false)}
      onKeyDown={e => { if (e.key === 'Enter') e.target.blur(); }}
      style={{
        fontSize: 20, fontWeight: 700, letterSpacing: '-0.025em',
        color: 'var(--fg)', background: 'transparent', width: '100%',
        outline: 0, padding: '2px 0', borderBottom: '1px solid var(--lime-line)',
      }} />
  ) : (
    <button onClick={() => setEditing(true)} style={{
      display: 'flex', alignItems: 'center', gap: 8,
      fontSize: 20, fontWeight: 700, letterSpacing: '-0.025em',
      color: 'var(--fg)', padding: '2px 0',
    }}>
      {value}
      <Icon name="edit" size={13} style={{ color: 'var(--fg-3)', opacity: 0.6 }} />
    </button>
  );
}

function Field({ label, hint, right, children }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--fg-2)' }}>{label}</div>
          {hint && <div style={{ fontSize: 11.5, color: 'var(--fg-4)', marginTop: 2 }}>{hint}</div>}
        </div>
        {right}
      </div>
      {children}
    </div>
  );
}

// ───────── Exercise picker (used in editor) ─────────
function ExercisePicker({ selected, onToggle, onClose, embedded }) {
  const [search, setSearch] = React.useState('');
  const [activeGroup, setActiveGroup] = React.useState('Peito');
  const allGroups = [...CATALOG.superior, ...CATALOG.inferior];
  const filtered = search
    ? allGroups.flatMap(g => g.items.filter(it => it.name.toLowerCase().includes(search.toLowerCase())).map(it => ({ ...it, group: g.group })))
    : allGroups.find(g => g.group === activeGroup)?.items || [];

  return (
    <>
      <div style={{ padding: '14px 18px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-0.01em' }}>Adicionar exercício</div>
          <div style={{ fontSize: 12, color: 'var(--fg-3)', marginTop: 2 }}>{selected.length} selecionado{selected.length === 1 ? '' : 's'}</div>
        </div>
        {onClose && <button className="btn btn-ghost btn-icon btn-sm" onClick={onClose}><Icon name="x" size={16} /></button>}
      </div>

      <div style={{ padding: '0 18px 12px' }}>
        <div style={{ position: 'relative' }}>
          <Icon name="search" size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--fg-3)' }} />
          <input className="input" placeholder="Buscar exercício…" value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 36, height: 40 }} />
        </div>
      </div>

      {!search && (
        <div style={{ padding: '0 18px 10px', display: 'flex', gap: 6, overflowX: 'auto', flexShrink: 0 }}>
          {allGroups.map(g => (
            <button key={g.group} onClick={() => setActiveGroup(g.group)} style={{
              flexShrink: 0,
              padding: '5px 11px', borderRadius: 999, fontSize: 12, fontWeight: 500,
              background: activeGroup === g.group ? 'var(--lime-soft)' : 'var(--card)',
              border: `1px solid ${activeGroup === g.group ? 'var(--lime-line)' : 'var(--border)'}`,
              color: activeGroup === g.group ? 'var(--lime)' : 'var(--fg-1)',
              transition: 'all 120ms',
              whiteSpace: 'nowrap',
            }}>{g.group}</button>
          ))}
        </div>
      )}

      <div style={{ flex: 1, overflow: 'auto', padding: '0 12px 16px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {filtered.map(ex => {
            const isOn = selected.includes(ex.id);
            return (
              <button key={ex.id} onClick={() => onToggle(ex.id)} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px', borderRadius: 8,
                background: isOn ? 'var(--lime-soft)' : 'transparent',
                border: `1px solid ${isOn ? 'var(--lime-line)' : 'transparent'}`,
                textAlign: 'left',
                transition: 'background 120ms',
              }}
                onMouseEnter={e => { if (!isOn) e.currentTarget.style.background = 'var(--card)'; }}
                onMouseLeave={e => { if (!isOn) e.currentTarget.style.background = 'transparent'; }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 500 }}>{ex.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--fg-3)', marginTop: 1 }}>
                    {ex.group && <span>{ex.group} · </span>}{ex.kind}
                  </div>
                </div>
                <div style={{
                  width: 26, height: 26, borderRadius: 7,
                  display: 'grid', placeItems: 'center',
                  background: isOn ? 'var(--lime)' : 'var(--card)',
                  color: isOn ? 'var(--lime-ink)' : 'var(--fg-3)',
                  border: isOn ? 'none' : '1px solid var(--border-hi)',
                  transition: 'all 120ms',
                }}>
                  <Icon name={isOn ? 'check' : 'plus'} size={14} stroke={2.4} />
                </div>
              </button>
            );
          })}
          {filtered.length === 0 && (
            <div style={{ padding: '40px 16px', textAlign: 'center', color: 'var(--fg-3)', fontSize: 13 }}>
              Nada encontrado.
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ───────── TREINO ─────────
function TreinoScreen({ ficha, onFinish, isMobile }) {
  // sets state: { [exerciseId]: [{ weight, reps, rpe, done }] }
  const initial = React.useMemo(() => {
    const out = {};
    ficha.exercises.forEach(id => {
      out[id] = [
        { weight: '', reps: '', rpe: '', done: false },
        { weight: '', reps: '', rpe: '', done: false },
        { weight: '', reps: '', rpe: '', done: false },
      ];
    });
    return out;
  }, [ficha.id]);
  const [sets, setSets] = React.useState(initial);
  const [restEnabled, setRestEnabled] = React.useState(false);
  const [restRemaining, setRestRemaining] = React.useState(0);
  const restDuration = 90;
  const [elapsed, setElapsed] = React.useState(0);
  const [activeIdx, setActiveIdx] = React.useState(0);
  const [showSummary, setShowSummary] = React.useState(false);
  const toast = useToast();

  // total timer
  React.useEffect(() => {
    const t = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(t);
  }, []);
  // rest countdown
  React.useEffect(() => {
    if (restRemaining <= 0) return;
    const t = setInterval(() => setRestRemaining(r => Math.max(0, r - 1)), 1000);
    return () => clearInterval(t);
  }, [restRemaining]);

  const updateSet = (exId, i, field, val) => {
    setSets(prev => ({ ...prev, [exId]: prev[exId].map((s, j) => j === i ? { ...s, [field]: val } : s) }));
  };

  const toggleDone = (exId, i) => {
    const cur = sets[exId][i];
    const willDone = !cur.done;
    setSets(prev => ({ ...prev, [exId]: prev[exId].map((s, j) => j === i ? { ...s, done: willDone } : s) }));
    if (willDone) {
      if (restEnabled) setRestRemaining(restDuration);
      // detect PR
      const weight = parseFloat(cur.weight);
      const reps = parseInt(cur.reps);
      if (weight > 0 && reps > 0) {
        const history = PR_HISTORY[exId];
        const lastPR = history ? history[history.length - 1].kg : 0;
        if (weight > lastPR) {
          toast({ kind: 'pr', msg: `🏆 Novo PR! ${weight}kg em ${exerciseById(exId).name}` });
        }
      }
    }
  };

  const addSet = (exId) => {
    setSets(prev => ({ ...prev, [exId]: [...prev[exId], { weight: '', reps: '', rpe: '', done: false }] }));
  };

  const removeSet = (exId, i) => {
    setSets(prev => ({ ...prev, [exId]: prev[exId].filter((_, j) => j !== i) }));
  };

  const counts = (() => {
    let done = 0, total = 0, volume = 0, prs = 0;
    Object.entries(sets).forEach(([exId, ss]) => {
      ss.forEach(s => {
        total++;
        if (s.done) {
          done++;
          const w = parseFloat(s.weight) || 0;
          const r = parseInt(s.reps) || 0;
          volume += w * r;
          const hist = PR_HISTORY[exId];
          if (hist && w > hist[hist.length - 1].kg) prs++;
        }
      });
    });
    return { done, total, volume, prs };
  })();

  const fmtTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  const color = FICHA_COLORS[ficha.color];

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, position: 'relative' }}>
      {/* sticky top bar with timer + progress */}
      <div style={{
        flexShrink: 0,
        padding: isMobile ? '14px 18px 12px' : '18px 32px 14px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg)',
        display: 'flex', flexDirection: 'column', gap: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 11, color: 'var(--fg-3)', fontWeight: 500, letterSpacing: 0.06, textTransform: 'uppercase' }}>Treinando</div>
            <div style={{ fontSize: isMobile ? 18 : 22, fontWeight: 700, letterSpacing: '-0.025em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ficha.title}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div className="mono" style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '6px 10px', borderRadius: 8,
              background: 'var(--card)', border: '1px solid var(--border)',
              fontSize: 13, fontWeight: 600,
            }}>
              <Icon name="clock" size={12} />
              {fmtTime(elapsed)}
            </div>
          </div>
        </div>

        {/* progress bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ flex: 1, height: 4, borderRadius: 999, background: 'var(--card)', overflow: 'hidden' }}>
            <div style={{
              height: '100%', width: `${counts.total ? (counts.done / counts.total) * 100 : 0}%`,
              background: color.bg, borderRadius: 999, transition: 'width 280ms ease',
            }} />
          </div>
          <span className="mono" style={{ fontSize: 11.5, color: 'var(--fg-3)', fontWeight: 500, minWidth: 42, textAlign: 'right' }}>
            {counts.done}/{counts.total}
          </span>
        </div>
      </div>

      {/* rest banner */}
      {restRemaining > 0 && (
        <div className="anim-rise" style={{
          flexShrink: 0,
          margin: isMobile ? '12px 18px 0' : '14px 32px 0',
          padding: '12px 16px',
          background: 'var(--lime-soft)', border: '1px solid var(--lime-line)',
          borderRadius: 12,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Icon name="timer" size={16} style={{ color: 'var(--lime)' }} />
            <div>
              <div style={{ fontSize: 12.5, color: 'var(--lime)', fontWeight: 600 }}>Descanso</div>
              <div className="mono t-num" style={{ fontSize: 18, fontWeight: 700, marginTop: 1 }}>{fmtTime(restRemaining)}</div>
            </div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => setRestRemaining(0)}>Pular</button>
        </div>
      )}

      {/* exercises */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        <div style={{ padding: isMobile ? '14px 18px 120px' : '18px 32px 60px', display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 820, margin: '0 auto' }}>
          {ficha.exercises.map((exId, i) => (
            <ExerciseBlock
              key={exId}
              exercise={exerciseById(exId)}
              sets={sets[exId]}
              onUpdate={(idx, field, val) => updateSet(exId, idx, field, val)}
              onToggleDone={(idx) => toggleDone(exId, idx)}
              onAddSet={() => addSet(exId)}
              onRemoveSet={(idx) => removeSet(exId, idx)}
              accent={color}
              active={i === activeIdx}
              onActivate={() => setActiveIdx(i)}
              isMobile={isMobile}
              prThreshold={PR_HISTORY[exId]?.[PR_HISTORY[exId].length - 1]?.kg}
            />
          ))}
        </div>
      </div>

      {/* bottom action bar */}
      <div style={{
        flexShrink: 0,
        padding: isMobile ? '12px 18px 18px' : '14px 32px 18px',
        borderTop: '1px solid var(--border)',
        background: 'var(--bg)',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <label style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px',
          borderRadius: 10, background: 'var(--card)', border: '1px solid var(--border)',
          fontSize: 12, fontWeight: 500, color: 'var(--fg-2)', cursor: 'pointer',
        }}>
          <input type="checkbox" checked={restEnabled} onChange={e => setRestEnabled(e.target.checked)} style={{ width: 14, height: 14, accentColor: '#CDFF00' }} />
          <Icon name="timer" size={13} />
          Descanso 90s
        </label>
        <div style={{ flex: 1 }} />
        <button className="btn btn-primary" onClick={() => setShowSummary(true)} style={{ height: 44, padding: '0 18px', fontSize: 14 }}>
          <Icon name="check" size={15} stroke={2.4} />
          Finalizar treino
        </button>
      </div>

      {/* Summary modal */}
      {showSummary && (
        <FinishSummary
          counts={counts}
          ficha={ficha}
          elapsed={elapsed}
          onClose={() => setShowSummary(false)}
          onConfirm={() => { setShowSummary(false); onFinish(); }}
        />
      )}
    </div>
  );
}

function ExerciseBlock({ exercise, sets, onUpdate, onToggleDone, onAddSet, onRemoveSet, accent, isMobile, prThreshold }) {
  return (
    <div className="card" style={{ padding: 16, overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 12 }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-0.01em' }}>{exercise.name}</div>
          <div style={{ marginTop: 2, fontSize: 11.5, color: 'var(--fg-3)' }}>{exercise.group} · {exercise.kind}{prThreshold ? ` · PR ${prThreshold}kg` : ''}</div>
        </div>
        <button className="btn btn-ghost btn-sm" style={{ color: 'var(--fg-3)', padding: '0 6px' }} aria-label="Notas">
          <Icon name="note" size={14} />
        </button>
      </div>

      {/* sets header */}
      <div style={{
        display: 'grid', gridTemplateColumns: isMobile ? '28px 1fr 1fr 56px 36px' : '36px 1fr 1fr 80px 44px',
        gap: 6, marginBottom: 6,
        fontSize: 10, fontWeight: 600, color: 'var(--fg-4)', letterSpacing: 0.08, textTransform: 'uppercase',
      }}>
        <div style={{ textAlign: 'center' }}>#</div>
        <div style={{ paddingLeft: 8 }}>Peso (kg)</div>
        <div style={{ paddingLeft: 8 }}>Reps</div>
        <div style={{ paddingLeft: 8 }}>RPE</div>
        <div></div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {sets.map((s, i) => (
          <SetRow
            key={i}
            idx={i + 1}
            set={s}
            onWeight={v => onUpdate(i, 'weight', v)}
            onReps={v => onUpdate(i, 'reps', v)}
            onRpe={v => onUpdate(i, 'rpe', v)}
            onDone={() => onToggleDone(i)}
            onRemove={() => onRemoveSet(i)}
            isMobile={isMobile}
            prThreshold={prThreshold}
            accent={accent}
          />
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
        <button onClick={onAddSet} className="btn btn-sm btn-ghost" style={{ color: 'var(--fg-2)' }}>
          <Icon name="plus" size={13} stroke={2.2} />
          Adicionar série
        </button>
      </div>
    </div>
  );
}

function SetRow({ idx, set, onWeight, onReps, onRpe, onDone, onRemove, isMobile, prThreshold, accent }) {
  const weight = parseFloat(set.weight) || 0;
  const isPR = weight > 0 && prThreshold && weight > prThreshold && set.done;
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: isMobile ? '28px 1fr 1fr 56px 36px' : '36px 1fr 1fr 80px 44px',
      gap: 6, alignItems: 'center',
      padding: 4, borderRadius: 8,
      background: set.done ? 'rgba(205,255,0,0.04)' : 'transparent',
      transition: 'background 200ms',
      position: 'relative',
    }}>
      {isPR && (
        <span className="anim-pop" style={{
          position: 'absolute', top: -8, right: 6,
          background: 'var(--lime)', color: 'var(--lime-ink)',
          fontSize: 9, fontWeight: 800, letterSpacing: 0.06, textTransform: 'uppercase',
          padding: '2px 6px', borderRadius: 4,
        }}>🏆 PR</span>
      )}
      <div style={{
        display: 'grid', placeItems: 'center',
        fontSize: 12, fontWeight: 600, color: set.done ? 'var(--lime)' : 'var(--fg-3)',
        fontFamily: 'var(--font-mono)',
      }}>{idx}</div>
      <input className="input input-num" placeholder="0" value={set.weight}
        onChange={e => onWeight(e.target.value.replace(',', '.'))}
        inputMode="decimal" />
      <input className="input input-num" placeholder="0" value={set.reps}
        onChange={e => onReps(e.target.value)}
        inputMode="numeric" />
      <input className="input input-num" placeholder="–" value={set.rpe}
        onChange={e => onRpe(e.target.value)}
        inputMode="decimal" />
      <button onClick={onDone} aria-label="Marcar série" style={{
        width: 32, height: 32, borderRadius: 8,
        background: set.done ? 'var(--lime)' : 'var(--card)',
        color: set.done ? 'var(--lime-ink)' : 'var(--fg-3)',
        border: set.done ? 'none' : '1px solid var(--border-hi)',
        display: 'grid', placeItems: 'center',
        transition: 'all 160ms ease',
        boxShadow: set.done ? '0 0 0 0 rgba(205,255,0,0)' : 'none',
        animation: set.done ? 'pop 280ms cubic-bezier(0.2, 0.7, 0.2, 1)' : 'none',
      }}>
        <Icon name="check" size={15} stroke={3} />
      </button>
    </div>
  );
}

function FinishSummary({ counts, ficha, elapsed, onClose, onConfirm }) {
  const fmtTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return m >= 60 ? `${Math.floor(m / 60)}h ${m % 60}min` : `${m}min ${sec}s`;
  };
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 100,
      background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)',
      display: 'grid', placeItems: 'center',
      padding: 20,
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="anim-pop" style={{
        width: '100%', maxWidth: 380,
        background: 'var(--bg-1)', border: '1px solid var(--border-hi)',
        borderRadius: 20, padding: 24,
        boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16, margin: '0 auto',
            background: 'var(--lime)', display: 'grid', placeItems: 'center',
            color: 'var(--lime-ink)',
          }}>
            <Icon name="check" size={28} stroke={3} />
          </div>
          <h3 style={{ margin: '14px 0 4px', fontSize: 22, fontWeight: 700, letterSpacing: '-0.025em' }}>Bom treino.</h3>
          <div style={{ fontSize: 13.5, color: 'var(--fg-3)' }}>{ficha.title}</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
          <SumStat label="Volume total" value={`${(counts.volume / 1000).toFixed(1)}t`} sub={`${counts.volume.toFixed(0)} kg`} />
          <SumStat label="Séries" value={`${counts.done}`} sub={`de ${counts.total}`} />
          <SumStat label="Duração" value={fmtTime(elapsed)} sub="cronômetro" />
          <SumStat label="PRs batidos" value={counts.prs} sub={counts.prs > 0 ? '🏆 incrível' : 'continue assim'} highlight={counts.prs > 0} />
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary" onClick={onClose} style={{ flex: 1 }}>Voltar</button>
          <button className="btn btn-primary" onClick={onConfirm} style={{ flex: 1.6 }}>Salvar treino</button>
        </div>
      </div>
    </div>
  );
}

function SumStat({ label, value, sub, highlight }) {
  return (
    <div style={{
      padding: 12, borderRadius: 10,
      background: highlight ? 'var(--lime-soft)' : 'var(--card)',
      border: `1px solid ${highlight ? 'var(--lime-line)' : 'var(--border)'}`,
    }}>
      <div style={{ fontSize: 11, color: 'var(--fg-3)', fontWeight: 500, letterSpacing: 0.04, textTransform: 'uppercase' }}>{label}</div>
      <div style={{ marginTop: 4, fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em', color: highlight ? 'var(--lime)' : 'var(--fg)' }}>{value}</div>
      <div style={{ fontSize: 11.5, color: 'var(--fg-3)', marginTop: 2 }}>{sub}</div>
    </div>
  );
}

Object.assign(window, { EditorScreen, TreinoScreen });
